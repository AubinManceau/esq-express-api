const User = require('../models/User');
const Role = require('../models/Role');
const Category = require('../models/Category');
const UserRoleCategory = require('../models/UserRoleCategory');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Training = require('../models/Training');
const TrainingUserStatus = require('../models/TrainingUserStatus');
const nodemailer = require('nodemailer');

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
            'RANDOM_TOKEN_SECRET_INSCRIPTION',
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

        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET_INSCRIPTION');
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
            'RANDOM_TOKEN_SECRET_CONNEXION',
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

exports.updateUser = async (req, res, next) => {
    try{
        const { userId, email, firstName, lastName, roleName, categoryName } = req.body;

        if (!userId || !email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Identifiant, email, prénom et nom sont requis.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        if (!user.isActive) {
            return res.status(400).json({ error: 'L\'utilisateur n\'a pas encore défini son mot de passe.' });
        }

        if (roleName && roleName.length > 0) {
            await UserRoleCategory.destroy({ where: { userId: userId } });
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
                }
            
                await UserRoleCategory.create({
                    userId: user.id,
                    roleId: roleInstance.id,
                    categoryId: categoryInstance ? categoryInstance.id : null
                });
            }
        }

        user.email = email;
        user.first_name = firstName;
        user.last_name = lastName;
        await user.save();

        res.status(200).json({ message: 'Utilisateur mis à jour avec succès!' });

    } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }  
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { userId, oldPassword, newPassword, confirmPassword } = req.body;

        if (!userId || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Identifiant, ancien mot de passe, nouveau mot de passe et confirmation sont requis.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        if (!user.isActive) {
            return res.status(400).json({ error: 'L\'utilisateur n\'a pas encore défini son mot de passe.' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Ancien mot de passe incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Mot de passe mis à jour avec succès!' });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Identifiant est requis.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const userRoleCategory = await UserRoleCategory.findAll({
            where: { userId: userId },
            include: [
                { model: Role },
                { model: Category }
            ]
        });

        res.status(200).json({ user: user, userRoleCategory: userRoleCategory });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userRoleCategory = await UserRoleCategory.findAll({
                where: { userId: user.id },
                include: [
                    { model: Role },
                    { model: Category }
                ]
            });
            user.dataValues.userRoleCategory = userRoleCategory;
        }

        res.status(200).json({ users: users });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Identifiant est requis.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        await UserRoleCategory.destroy({ where: { userId: userId } });
        await TrainingUserStatus.destroy({ where: { userId: userId } });
        await user.destroy();

        res.status(200).json({ message: 'Utilisateur supprimé avec succès!' });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
};

exports.getUsersByRole = async (req, res, next) => {
    try {
        const roleName = req.params.roleName;

        if (!roleName) {
            return res.status(400).json({ error: 'Nom du rôle est requis.' });
        }

        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(404).json({ error: 'Rôle non trouvé.' });
        }

        const userRoleCategory = await UserRoleCategory.findAll({
            where: { roleId: role.id },
            include: [
                { model: User },
                { model: Category }
            ]
        });

        res.status(200).json({ userRoleCategory: userRoleCategory });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
    }
};

exports.getUsersByRolesAndCategories = async (req, res, next) => {
    try {
        const roleName = req.params.roleName;
        const categoryName = req.params.categoryName;

        if (!roleName || !categoryName) {
            return res.status(400).json({ error: 'Nom du rôle et de la catégorie sont requis.' });
        }

        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(404).json({ error: 'Rôle non trouvé.' });
        }

        const category = await Category.findOne({ where: { name: categoryName } });
        if (!category) {
            return res.status(404).json({ error: 'Catégorie non trouvée.' });
        }

        const userRoleCategory = await UserRoleCategory.findAll({
            where: { roleId: role.id, categoryId: category.id },
            include: [
                { model: User }
            ]
        });

        res.status(200).json({ userRoleCategory: userRoleCategory });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs par rôle et catégorie:', error);
    }
};
