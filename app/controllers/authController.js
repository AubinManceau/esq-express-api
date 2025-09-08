import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {sendVerificationEmail, sendPasswordResetEmail} from '../utils/mail.js';
import redis from '../config/redisClient.js';

const signup = async (req, res) => {
    const t = await models.sequelize.transaction();

    try {
        const { firstName, lastName, email, phone, rolesCategories } = req.body;

        // Validation des données
        if (!email || !Array.isArray(rolesCategories) || rolesCategories.length === 0 || !firstName || !lastName) {
            await t.rollback();
            return res.status(400).json({ 
                status: 'error',
                message: 'Nom, Prénom, Email et au moins un rôle sont requis.'
            });
        }

        // Vérification de l'unicité de l'email
        const existingUser = await models.Users.findOne({ where: { email }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(409).json({ 
                status: 'error',
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }

        // Création de l'utilisateur
        const user = await models.Users.create({
            firstName,
            lastName,
            email,
            phone: phone || null
        }, { transaction: t });

        // Attribution des rôles et catégories + training si nécessaire
        for (const { roleId, categoryId } of rolesCategories) {
            const role = await models.Roles.findByPk(roleId, { transaction: t });
            if (!role) throw new Error(`Le rôle '${roleId}' n'existe pas`);

            let category = null;
            if ([1, 2].includes(roleId)) {
                if (!categoryId) throw new Error(`La catégorie est requise pour le rôle '${role.name}'`);

                category = await models.Categories.findByPk(categoryId, { transaction: t });
                if (!category) throw new Error(`La catégorie '${categoryId}' n'existe pas`);

                const trainings = await models.Trainings.findAll({ where: { categoryId }, transaction: t });
                await user.addTrainings(trainings, { transaction: t });
            }

            await models.UserRolesCategories.create({
                userId: user.id,
                roleId,
                categoryId: category ? category.id : null
            }, { transaction: t });
        }

        // Génération du token d'activation
        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_SIGNUP,
            { expiresIn: '48h' }
        );

        // Envoi de l'email de vérification
        sendVerificationEmail(email, firstName, lastName, token)
            .catch(err => console.error("Erreur email :", err));

        await redis.del('users:');
        await t.commit();
        return res.status(201).json({ 
            status: 'success',
            message: 'Utilisateur créé avec succès!', 
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                },
                token
            }
        });

    } catch (error) {
        await t.rollback();
        return res.status(400).json({ 
            status: 'error',
            message: error.message
        });
    }
};

const resendConfirmationEmail = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validation de l'ID utilisateur
        const user = await models.Users.findByPk(userId);
        if (!user || user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé ou actif.'
            });
        }

        // Génération d'un nouveau token d'activation
        const { firstName, lastName, email } = user;
        const token = jwt.sign(
            { userId },
            process.env.SECRET_KEY_SIGNUP,
            { expiresIn: '48h' }
        );

        // Envoi de l'email de vérification
        sendVerificationEmail(email, firstName, lastName, token)
            .catch(err => console.error("Erreur email :", err));

        return res.status(200).json({ 
            status: 'success',
            message: 'Nouveau token généré avec succès!',
            data: { token: token }
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la génération du token." 
        });
    }
};

const definePassword = async (req, res) => {
    try {
        const { token, email, password, confirmPassword } = req.body;

        // Validation des données
        if (!token || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Token, email et mot de passe sont requis.' 
            });
        }

        // Vérification de la correspondance des mots de passe
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Les mots de passe ne correspondent pas.' 
            });
        }

        // Validation du token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SECRET_KEY_SIGNUP);
        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    status: 'error',
                    message: "Le lien d'activation a expiré. Veuillez demander un nouveau lien."
                });
            }
            return res.status(401).json({ 
                status: 'error',
                message: 'Le token est invalide.' 
            });
        }

        // Validation de l'utilisateur
        const user = await models.Users.findByPk(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé.' 
            });
        }

        // Vérification de l'email
        if (user.email !== email) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'email doit correspondre à celui utilisé lors de l'inscription." 
            });
        }

        // Vérification de l'activation du compte
        if (user.isActive) {
            return res.status(409).json({ 
                status: 'error',
                message: 'Ce compte est déjà activé.' 
            });
        }

        // Hachage du mot de passe et activation du compte
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isActive = true;
        await user.save();
        await redis.del('users:');

        return res.status(200).json({ 
            status: 'success',
            message: 'Votre compte est maintenant activé. Vous pouvez vous connecter.'
        });
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de l'activation du compte." 
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des données
        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email et mot de passe sont requis.' 
            });
        }

        // Vérification de l'utilisateur
        const user = await models.Users.findOne({ 
            where: { email },
            include: [
                {
                    model: models.UserRolesCategories,
                    include: [
                        { model: models.Roles },
                        { model: models.Categories }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Identifiants incorrects ou compte non activé.' 
            });
        }

        // Vérification du mot de passe et de l'activation du compte
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!user.isActive || !isPasswordValid) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Identifiants incorrects ou compte non activé.' 
            });
        }

        // Préparation des données utilisateur pour la réponse
        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            roles: user.UserRolesCategories ? user.UserRolesCategories.map(urc => ({
                roleId: urc.roleId,
                roleName: urc.Role ? urc.Role.name : null,
                categoryId: urc.categoryId,
                categoryName: urc.Category ? urc.Category.name : null
            })) : []
        };

        // Génération des tokens JWT et sauvegarde du refresh token
        const accessToken = jwt.sign(
            { 
                userId: user.id,
                roles: userData.roles.map(r => ({ 
                    roleId: r.roleId, 
                    categoryId: r.categoryId 
                }))
            },
            process.env.SECRET_KEY_ACCESS_TOKEN,
            { expiresIn: '15min' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_REFRESH_TOKEN,
            { expiresIn: '7d' }
        );

        if (refreshToken) {
            user.refreshToken = refreshToken;
            await user.save();
        }

        return res.status(200).json({
            status: 'success',
            message: 'Connexion réussie',
            data: {
                user: userData,
                token: accessToken,
                refreshToken: refreshToken
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors de la tentative de connexion.'
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Validation du refresh token
        if (!refreshToken) {
            return res.status(401).json({ status: 'error', message: 'Refresh token manquant.' });
        }

        // Vérification et décodage du refresh token
        let decodedToken;
        try {
            decodedToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        } catch (tokenError) {
            return res.status(403).json({ status: 'error', message: 'Refresh token invalide ou expiré.' });
        }

        // Récupération de l'utilisateur et vérification du refresh token en base
        const user = await models.Users.findByPk(decodedToken.userId, {
            include: [
                {
                    model: models.UserRolesCategories,
                    include: [
                        { model: models.Roles },
                        { model: models.Categories }
                    ]
                }
            ]
        });

        // Vérification de l'utilisateur et du refresh token
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ status: 'error', message: 'Refresh token non valide en base.' });
        }
        
        // Génération de nouveaux tokens
        const roles = user.UserRolesCategories?.map(urc => ({
            roleId: urc.roleId,
            categoryId: urc.categoryId
        })) || [];

        const newAccessToken = jwt.sign(
            { 
                userId: user.id, roles 
            },
            process.env.SECRET_KEY_ACCESS_TOKEN,
            { expiresIn: '15min' }
        );

        const newRefreshToken = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_REFRESH_TOKEN,
            { expiresIn: '7d' }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Nouveau token d\'accès généré avec succès.',
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken,
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors du rafraîchissement du token d\'accès.'
        });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.auth.userId;

        // Validation de l'utilisateur
        const user = await models.Users.findByPk(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé ou inactif pour la déconnexion.'
            });
        }

        // Suppression du refresh token en base
        user.refreshToken = null;
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Déconnexion réussie.'
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors de la déconnexion.'
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation de l'email
        if (!email) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'email est requis pour la réinitialisation du mot de passe." 
            });
        }

        // Vérification de l'utilisateur
        const user = await models.Users.findOne({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: "Aucun utilisateur actif trouvé avec cet email." 
            });
        }

        // Génération du token de réinitialisation
        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_RESET_PASSWORD,
            { expiresIn: '1h' }
        );

        // Envoi de l'email de réinitialisation
        const { firstName, lastName } = user;
        sendPasswordResetEmail(email, firstName, lastName, token)
            .catch(err => console.error("Erreur email :", err));

        return res.status(200).json({ 
            status: 'success',
            message: 'Email de réinitialisation du mot de passe envoyé avec succès.',
            data: { token: token }
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors de la réinitialisation du mot de passe.'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword, confirmNewPassword } = req.body;

        // Validation des données
        if (!token || !email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Token, email et nouveau mot de passe sont requis.' 
            });
        }

        // Vérification de la correspondance des nouveaux mots de passe
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Les nouveaux mots de passe ne correspondent pas.' 
            });
        }

        // Validation du token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SECRET_KEY_RESET_PASSWORD);
        } catch (tokenError) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Le token est invalide.' 
            });
        }

        // Validation de l'utilisateur
        const user = await models.Users.findByPk(decodedToken.userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé ou inactif.' 
            });
        }

        // Vérification de l'email
        if (user.email !== email) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'email doit correspondre à celui du compte." 
            });
        }

        // Hachage du nouveau mot de passe et mise à jour en base
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        await redis.del('users:');

        return res.status(200).json({ 
            status: 'success',
            message: 'Mot de passe réinitialisé avec succès.' 
        });
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors de la réinitialisation du mot de passe.'
        });
    }
};

export default {
    signup,
    definePassword,
    login,
    resendConfirmationEmail,
    refreshAccessToken,
    logout,
    resetPassword,
    forgotPassword,
};
