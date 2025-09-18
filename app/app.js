import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sequelize } from './config/database.js';
import initModels from './models/InitModels.js';
import userRoutes from './routes/user.js';
import articleRoutes from './routes/article.js';
import trainingRoutes from './routes/training.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import convocationRoutes from './routes/convocation.js';
import privateMessageRoutes from './routes/privateMessage.js';
import groupChatRoutes from './routes/groupChats.js';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const models = initModels(sequelize);
const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4000',
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-type'],
  credentials: true,
}));
app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  message: {error: 'Trop de requêtes, veuillez réessayer plus tard.'},
});
app.use(limiter);

app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/trainings', trainingRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/convocations', convocationRoutes);
app.use('/api/v1/private-messages', privateMessageRoutes);
app.use('/api/v1/group-chats', groupChatRoutes);

export { app, models };
