const User = require('../models/User');
const Role = require('../models/Role');
const Category = require('../models/Category');
const UserRoleCategory = require('../models/UserRoleCategory');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Training = require('../models/Training');
const TrainingUserStatus = require('../models/TrainingUserStatus');
const { Op } = require('sequelize');

exports.signup = async (req, res, next) => {
    try {
        const { email, password, roleName, categoryName } = req.body;

        if (!email || !password || !Array.isArray(roleName) || roleName.length === 0) {
            return res.status(400).json({ error: 'Email, mot de passe, et au moins un rôle sont requis.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: email,
            password: hashedPassword
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

        res.status(201).json({ message: 'Utilisateur créé avec succès!', userId: user.id });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
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
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Paire identifiant / mot de passe incorrecte' });
        }

        const token = jwt.sign(
            { userId: user.id },
            'RANDOM_TOKEN_SECRET',
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
