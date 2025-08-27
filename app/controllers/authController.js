import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, rolesId, categoriesId } = req.body;

        if (!email || !Array.isArray(rolesId) || rolesId.length === 0 || !firstName || !lastName) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Nom, Prénom, Email et au moins un rôle sont requis.'
            });
        }

        const existingUser = await models.Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ 
                status: 'error',
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }
        
        const user = await models.Users.create({
            firstName,
            lastName,
            email,
            phone: phone || null,
        });

        const roleAssociations = [];
        let categoryIndex = 0;
        
        for (let i = 0; i < rolesId.length; i++) {
            const roleId = rolesId[i];
            
            const roleInstance = await models.Roles.findOne({ where: { id: roleId } });
            if (!roleInstance) {
                await models.Users.destroy({ where: { id: user.id } });
                return res.status(400).json({ 
                    status: 'error',
                    message: `Le rôle correspondant à l'id '${roleId}' n'existe pas.` 
                });
            }

            let categoryInstance = null;
            
            if ([1, 2].includes(parseInt(roleId))) {
                const categoryId = categoriesId && categoryIndex < categoriesId.length ? categoriesId[categoryIndex] : null;
                categoryIndex++;
                
                if (categoryId) {
                    categoryInstance = await models.Categories.findOne({ where: { id: categoryId } });
                    if (!categoryInstance) {
                        await models.Users.destroy({ where: { id: user.id } });
                        return res.status(400).json({ 
                            status: 'error',
                            message: `La catégorie correspondant à l'id '${categoryId}' n'existe pas.` 
                        });
                    }

                    const trainings = await models.Trainings.findAll({
                        where: { categoryId: categoryInstance.id }
                    }); 
                    
                    await Promise.all(trainings.map(training =>
                        models.TrainingUsersStatus.create({ 
                            userId: user.id, 
                            trainingId: training.id 
                        })
                    ));
                } else {
                    await models.Users.destroy({ where: { id: user.id } });
                    return res.status(400).json({ 
                        status: 'error',
                        message: `La catégorie est requise pour le rôle '${roleInstance.name}'.` 
                    });
                }
            }
        
            const association = await models.UserRolesCategories.create({
                userId: user.id,
                roleId: roleInstance.id,
                categoryId: categoryInstance ? categoryInstance.id : null
            });
            
            roleAssociations.push(association);
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
            subject: "Bienvenue à l'ES Quelaines - Finalisez votre inscription",
            html: `
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
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Erreur lors de l'envoi de l'email de confirmation:", emailError);
        }

        return res.status(201).json({ 
            status: 'success',
            message: 'Utilisateur créé avec succès!', 
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    createdAt: user.createdAt
                },
                token,
            }
        });

    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la création de l'utilisateur."
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
            message: 'Votre compte est maintenant activé. Vous pouvez vous connecter.',
            data: {
                userId: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erreur lors de la définition du mot de passe:', error);
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

        if (!user || !user.isActive) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Identifiants incorrects ou compte non activé.' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
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

        const token = jwt.sign(
            { 
                userId: user.id,
                roles: userData.roles.map(r => ({ 
                    roleId: r.roleId, 
                    categoryId: r.categoryId 
                }))
            },
            process.env.SECRET_KEY_LOGIN,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Connexion réussie',
            data: {
                user: userData,
                token,
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors de la tentative de connexion.'
        });
    }
};

export default {
    signup,
    definePassword,
    login
};
