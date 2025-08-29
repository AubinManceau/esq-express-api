import express from 'express';
import { sequelize } from './config/database.js';
import initModels from './models/InitModels.js';
import userRoutes from './routes/user.js';
import articleRoutes from './routes/article.js';
import trainingRoutes from './routes/training.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import convocationRoutes from './routes/convocation.js';
import privateMessageRoutes from './routes/privateMessage.js';

const models = initModels(sequelize);
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/trainings', trainingRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/convocations', convocationRoutes);
app.use('/api/v1/private-messages', privateMessageRoutes);

export { app, models };
