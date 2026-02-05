import { afterAll, beforeAll, beforeEach } from 'vitest';
import { sequelize } from '../config/database.js';
import { execSync } from 'child_process';
import { vi } from 'vitest';

vi.mock('../utils/mail.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true)
}));
vi.mock('../config/redisClient.js', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1)
  }
}));

beforeAll(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
  await sequelize.sync({ force: true });
  execSync('NODE_ENV=test npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
});

beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    const tablesToTruncate = [
        'articles', 
        'trainings',
        'chat_groups',
        'convocations', 
        'private_messages', 
        'group_messages',
        'teams',
        'training_users_status',
        'users_chat_group',
        'users_coach_team',
        'users_convocation'
    ];
    for (const table of tablesToTruncate) {
        await sequelize.query(`TRUNCATE TABLE ${table};`);
    }

    await sequelize.query('DELETE FROM user_roles_categories WHERE userId > 1;');
    await sequelize.query('DELETE FROM users WHERE id > 1;');
    await sequelize.query('ALTER TABLE users AUTO_INCREMENT = 2;');
    await sequelize.query('ALTER TABLE user_roles_categories AUTO_INCREMENT = 2;');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
});

afterAll(async () => {
  await sequelize.close();
});