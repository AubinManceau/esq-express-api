import { afterAll, beforeEach } from 'vitest';
import { sequelize } from '../config/database.js';

beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
});

afterAll(async () => {
  await sequelize.close(); 
});