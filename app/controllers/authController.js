import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const mailSubject = "Bienvenue à l'ES Quelaines - Finalisez votre inscription";
const mailContent = ({ firstName, lastName, token }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Bienvenue ${firstName} ${lastName} !</h1>
    <p>Nous sommes ravis de vous accueillir à l'<strong>ESQ</strong>.</p>
    <p>Pour finaliser votre inscription, veuillez suivre le lien ci-dessous. Ce lien est valide pendant <strong>48 heures</strong>.</p>
    <div style="text-align: center; margin: 20px 0;">
        <a href="https://monprojet.com/inscription?token=${token}" 
            style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Complétez votre inscription
        </a>
    </div>
    <p>Vous pouvez également télécharger notre application :</p>
    <ul style="list-style-type: none; padding: 0;">
        <li style="margin: 10px 0;">
            <a href="https://www.apple.com/app-store/" target="_blank" style="color: #0066cc; text-decoration: none;">
                📱 Télécharger depuis l'App Store
            </a>
        </li>
        <li style="margin: 10px 0;">
            <a href="https://play.google.com/store" target="_blank" style="color: #0066cc; text-decoration: none;">
                🤖 Télécharger depuis le Play Store
            </a>
        </li>
    </ul>
    <p>Si vous avez des questions, n'hésitez pas à nous contacter à 
        <a href="mailto:support@esq.com" style="color: #0066cc;">support@esq.com</a>.
    </p>
    <p style="margin-top: 30px;">
        À très bientôt,<br>
        <strong>Le bureau de l'ESQ</strong>
    </p>
</div>`;
const mailContentPassword = ({ firstName, lastName, token }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Bonjour ${firstName} ${lastName} !</h1>
    <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Si vous n'êtes pas à l'origine de cette demande, vous pouvez l'ignorer.</p>
    <p>Pour réinitialiser votre mot de passe, veuillez suivre le lien ci-dessous. Ce lien est valide pendant <strong>1 heure</strong>.</p>
    <div style="text-align: center; margin: 20px 0;">
        <a href="https://monprojet.com/reset-password?token=${token}" 
            style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Réinitialisez votre mot de passe
        </a>
    </div>
    <p>Si vous avez des questions, n'hésitez pas à nous contacter à 
        <a href="mailto:support@esq.com" style="color: #0066cc;">support@esq.com</a>.
    </p>
    <p style="margin-top: 30px;">
        À très bientôt,<br>
        <strong>Le bureau de l'ESQ</strong>
    </p>
</div>`;

const signup = async (req, res) => {
    const t = await models.sequelize.transaction();

    try {
        const { firstName, lastName, email, phone, rolesCategories } = req.body;

        if (!email || !Array.isArray(rolesCategories) || rolesCategories.length === 0 || !firstName || !lastName) {
            await t.rollback();
            return res.status(400).json({ 
                status: 'error',
                message: 'Nom, Prénom, Email et au moins un rôle sont requis.'
            });
        }

        const existingUser = await models.Users.findOne({ where: { email }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(409).json({ 
                status: 'error',
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }

        const user = await models.Users.create({
            firstName,
            lastName,
            email,
            phone: phone || null
        }, { transaction: t });

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

        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_SIGNUP,
            { expiresIn: '48h' }
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: mailSubject,
            html: mailContent({ firstName, lastName, token }),
        };

        transporter.sendMail(mailOptions)
            .catch(emailError => console.error("Erreur lors de l'envoi de l'email :", emailError));

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

        if (!userId) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'ID de l'utilisateur est requis." 
            });
        }

        const user = await models.Users.findByPk(userId);
        if (!user || user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé ou actif.'
            });
        }

       const { firstName, lastName, email } = user;

        const token = jwt.sign(
            { userId },
            process.env.SECRET_KEY_SIGNUP,
            { expiresIn: '48h' }
        );
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: mailSubject,
            html: mailContent({ firstName, lastName, token }),
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            return res.status(500).json({ 
                status: 'error',
                message: "Erreur lors de l'envoi de l'email." 
            });
        }

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

        if (!token || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Token, email et mot de passe sont requis.' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Les mots de passe ne correspondent pas.' 
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.' 
            });
        }

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

        const user = await models.Users.findByPk(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé.' 
            });
        }

        if (user.email !== email) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'email doit correspondre à celui utilisé lors de l'inscription." 
            });
        }

        if (user.isActive) {
            return res.status(409).json({ 
                status: 'error',
                message: 'Ce compte est déjà activé.' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isActive = true;
        await user.save();

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

        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email et mot de passe sont requis.' 
            });
        }

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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!user || !user.isActive || !isPasswordValid) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Identifiants incorrects ou compte non activé.' 
            });
        }

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

        if (!refreshToken) {
            return res.status(401).json({ status: 'error', message: 'Refresh token manquant.' });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        } catch (tokenError) {
            return res.status(403).json({ status: 'error', message: 'Refresh token invalide ou expiré.' });
        }

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

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ status: 'error', message: 'Refresh token non valide en base.' });
        }

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

        if (!userId) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'ID de l'utilisateur est requis pour la déconnexion." 
            });
        }

        const user = await models.Users.findByPk(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé ou inactif pour la déconnexion.'
            });
        }

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

        if (!email) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'email est requis pour la réinitialisation du mot de passe." 
            });
        }

        const user = await models.Users.findOne({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: "Aucun utilisateur actif trouvé avec cet email." 
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_RESET_PASSWORD,
            { expiresIn: '1h' }
        );

        const { firstName, lastName } = user;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: mailSubject,
            html: mailContentPassword({ firstName, lastName, token }),
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            return res.status(500).json({ 
                status: 'error',
                message: "Erreur lors de l'envoi de l'email." 
            });
        }

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

        if (!token || !email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Token, email et nouveau mot de passe sont requis.' 
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Les nouveaux mots de passe ne correspondent pas.' 
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.' 
            });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SECRET_KEY_RESET_PASSWORD);
        } catch (tokenError) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Le token est invalide.' 
            });
        }

        const user = await models.Users.findByPk(decodedToken.userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé ou inactif.' 
            });
        }

        if (user.email !== email) {
            return res.status(400).json({ 
                status: 'error',
                message: "L'email doit correspondre à celui du compte." 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

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
