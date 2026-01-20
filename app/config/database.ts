import { Sequelize } from 'sequelize';
import 'dotenv/config';

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbHost = process.env.DB_HOST as string;
const dbPort = Number(process.env.DB_PORT);

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        host: dbHost,
        port: dbPort,
        dialect: 'mariadb',
        logging: false,
    }
);

export { sequelize };
