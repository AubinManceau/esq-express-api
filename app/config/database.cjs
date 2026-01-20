// Configuration de la base de données pour Sequelize CLI
// Ce fichier est en JavaScript pour être compatible avec sequelize-cli
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'db_app',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mariadb',
        dialectOptions: {
            timezone: 'Etc/GMT+0',
        },
        logging: false,
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mariadb',
        dialectOptions: {
            timezone: 'Etc/GMT+0',
        },
        logging: false,
    }
};
