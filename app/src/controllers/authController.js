const User = require('../models/Users');
const Role = require('../models/Roles');
const Category = require('../models/Categories');
const UserRoleCategory = require('../models/UserRolesCategories');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Training = require('../models/Trainings');
const TrainingUserStatus = require('../models/TrainingUsersStatus');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.signup = async (req, res, next) => {
    try {
        const { email, roleName, categoryName, firstName, lastName } = req.body;

        if (!email || !Array.isArray(roleName) || roleName.length === 0 || !firstName || !lastName) {
            return res.status(400).json({ error: 'Email, mot de passe, et au moins un rôle sont requis.' });
        }

        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email: email,
        });

        for (let i = 0; i < roleName.length; i++) {
            const role = roleName[i];
            const category = categoryName[i] || null;
        
            const roleInstance = await Role.findOne({ where: { name: role } });
            if (!roleInstance) {
                return res.status(400).json({ error: `Le rôle '${role}' n'existe pas.` });
            }
        
            let categoryInstance = null;
            if (category) {
                categoryInstance = await Category.findOne({ where: { name: category } });
                if (!categoryInstance) {
                    return res.status(400).json({ error: `La catégorie '${category}' n'existe pas.` });
                }

                const trainings = await Training.findAll({
                    where : {
                        categoryId: categoryInstance.id
                    }
                }); 
                await Promise.all(trainings.map(training =>
                    TrainingUserStatus.create({ userId: user.id, trainingId: training.id })
                ));
                
            }
        
            await UserRoleCategory.create({
                userId: user.id,
                roleId: roleInstance.id,
                categoryId: categoryInstance ? categoryInstance.id : null
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_SIGNUP,
            { expiresIn: '48h' }
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'aubinmanceau0@gmail.com',
                pass: 'uirw iizy imyx qsah'
            }
        });

        const mailOptions = {
            from: 'your-email@example.com',
            to: email,
            subject: 'Bienvenue à l\'ES Quelaines - Finalisez votre inscription',
            html: `
                <h1>Bienvenue ${firstName} ${lastName} !</h1>
                <p>Nous sommes ravis de vous accueillir à l\'<strong>ESQ</strong>.</p>
                <p>Pour finaliser votre inscription, veuillez suivre le lien ci-dessous. Ce lien est valide pendant <strong>48 heures</strong>.</p>
                <a href="https://monprojet.com/inscription?token=${token}" style="color: #0066cc; text-decoration: none; font-weight: bold;">Complétez votre inscription</a>
                <p>Vous pouvez également télécharger notre application :</p>
                <ul>
                    <li><a href="https://www.apple.com/app-store/" target="_blank">Télécharger depuis l’App Store</a></li>
                    <li><a href="https://play.google.com/store" target="_blank">Télécharger depuis le Play Store</a></li>
                </ul>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@esq.com">support@esq.com</a>.</p>
                <p>À très bientôt,<br>Le bureau de l'ESQ</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            message: 'Utilisateur créé avec succès!', 
            userId: user.id,
            token: token
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
};

exports.definePassword = async (req, res, next) => {
    try {
        const { token, password, confirmPassword  } = req.body;

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ error: 'Token et mot de passe sont requis.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
        }

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_SIGNUP);
        if (!decodedToken) {
            return res.status(400).json({ error: 'Le temps d\'inscription est dépasssé.' });
        }

        const user = await User.findByPk(decodedToken.userId);
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isActive = true;
        await user.save();

        res.status(200).json({ message: 'Mot de passe défini avec succès!' });
    } catch (error) {
        console.error('Erreur lors de la définition du mot de passe:', error);
    }
};


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(401).json({ message: 'Paire identifiant / mot de passe incorrecte' });
        }else{
            if (!user.isActive) {
                return res.status(401).json({ message: 'L\'utilisateur n\'a pas encore défini son mot de passe.' });
            }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Paire identifiant / mot de passe incorrecte' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.SECRET_KEY_LOGIN,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            userId: user.id,
            token: token
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion.' });
    }
};


