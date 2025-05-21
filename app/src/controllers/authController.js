const Users = require('../models/Users');
const Roles = require('../models/Roles');
const Categories = require('../models/Categories');
const UserRolesCategories = require('../models/UserRolesCategories');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Trainings = require('../models/Trainings');
const TrainingUsersStatus = require('../models/TrainingUsersStatus');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { email, rolesId, categoriesId, firstName, lastName } = req.body;

        if (!email || !Array.isArray(rolesId) || rolesId.length === 0 || !firstName || !lastName) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Nom, Prénom, Email et au moins un rôle sont requis.'
            });
        }

        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ 
                status: 'error',
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }

        const user = await Users.create({
            first_name: firstName,
            last_name: lastName,
            email: email,
        });

        const roleAssociations = [];
        for (let i = 0; i < rolesId.length; i++) {
            const roleId = rolesId[i];
            const categoryId = categoriesId && i < categoriesId.length ? categoriesId[i] : null;
        
            const roleInstance = await Roles.findOne({ where: { id: roleId } });
            if (!roleInstance) {
                return res.status(400).json({ 
                    status: 'error',
                    message: `Le rôle correspondant à l'id '${roleId}' n'existe pas.` 
                });
            }
        
            let categoryInstance = null;
            if (categoryId) {
                categoryInstance = await Categories.findOne({ where: { id: categoryId } });
                if (!categoryInstance) {
                    return res.status(400).json({ 
                        status: 'error',
                        message: `La catégorie correspondant à l'id '${categoryId}' n'existe pas.` 
                    });
                }

                const trainings = await Trainings.findAll({
                    where: { categoryId: categoryInstance.id }
                }); 
                
                await Promise.all(trainings.map(training =>
                    TrainingUsersStatus.create({ userId: user.id, trainingId: training.id })
                ));
            }
        
            const association = await UserRolesCategories.create({
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
                user: process.env.EMAIL_USER || 'aubinmanceau0@gmail.com',
                pass: process.env.EMAIL_PASS || 'uirw iizy imyx qsah'
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'contact@esq.com',
            to: email,
            subject: "Bienvenue à l'ES Quelaines - Finalisez votre inscription",
            html: `
                <h1>Bienvenue ${firstName} ${lastName} !</h1>
                <p>Nous sommes ravis de vous accueillir à l'<strong>ESQ</strong>.</p>
                <p>Pour finaliser votre inscription, veuillez suivre le lien ci-dessous. Ce lien est valide pendant <strong>48 heures</strong>.</p>
                <a href="${process.env.FRONTEND_URL || 'https://monprojet.com'}/inscription?token=${token}" style="color: #0066cc; text-decoration: none; font-weight: bold;">Complétez votre inscription</a>
                <p>Vous pouvez également télécharger notre application :</p>
                <ul>
                    <li><a href="https://www.apple.com/app-store/" target="_blank">Télécharger depuis l'App Store</a></li>
                    <li><a href="https://play.google.com/store" target="_blank">Télécharger depuis le Play Store</a></li>
                </ul>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@esq.com">support@esq.com</a>.</p>
                <p>À très bientôt,<br>Le bureau de l'ESQ</p>
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
                userId: user.id,
                token: token
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

exports.definePassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Token et mot de passe sont requis.' 
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
                    message: 'Le lien d\'activation a expiré. Veuillez demander un nouveau lien.' 
                });
            }
            return res.status(401).json({ 
                status: 'error',
                message: 'Le token est invalide.' 
            });
        }

        const user = await Users.findByPk(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Utilisateur non trouvé.' 
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


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email et mot de passe sont requis.' 
            });
        }

        const user = await Users.findOne({ 
            where: { email },
            include: [
                {
                    model: UserRolesCategories,
                    include: [
                        { model: Roles },
                        { model: Categories }
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
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
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
            '24h'
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


