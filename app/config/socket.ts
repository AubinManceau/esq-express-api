import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import initModels from '../models/InitModels.js';
import { sequelize } from './database.js';

const models = initModels(sequelize);
let io: Server | null = null;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'test' ? true : 'https://web.aubin-manceau.fr',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket, next) => {
        let token = socket.handshake.auth.token;

        if (!token) return next(new Error("Authentification requise"));

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN as string) as any;
            socket.data.userId = decoded.userId; 
            socket.data.roles = decoded.roles;
            next();
        } catch (err) {
            next(new Error("TokenExpired"));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.data.userId;

        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Utilisateur ${userId} connecté au socket`);

            try {
                const userWithGroups = await models.Users.findByPk(userId, {
                    include: [{
                        model: models.ChatGroups,
                        attributes: ['id'],
                        through: { attributes: [] }
                    }]
                });

                if (userWithGroups && (userWithGroups as any).ChatGroups) {
                    (userWithGroups as any).ChatGroups.forEach((group: any) => {
                        socket.join(`group_${group.id}`);
                        console.log(`User ${userId} joined group_${group.id}`);
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des groupes du socket:", error);
            }
        }

        socket.on('disconnect', () => {
            console.log(`Utilisateur ${userId} déconnecté`);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) throw new Error("Socket.io n'est pas initialisé !");
    return io;
};