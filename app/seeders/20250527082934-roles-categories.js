'use strict';
import bcrypt from 'bcryptjs';

export default {
  async up (queryInterface) {
    const roles = ['joueur', 'coach', 'membre', 'admin'];
    const categories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'senior', 'veteran', 'futsal', 'feminines'];
    const userEmail = process.env.ADMIN_EMAIL;
    const userPassword = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const roleObjects = roles.map(name => ({
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const categoryObjects = categories.map(name => ({
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const userObjects = [{
      firstName: 'Admin',
      lastName: 'ESQ',
      email: userEmail,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    await queryInterface.bulkInsert('roles', roleObjects, {});
    await queryInterface.bulkInsert('categories', categoryObjects, {});
    await queryInterface.bulkInsert('users', userObjects, {});
    await queryInterface.bulkInsert('user_roles_categories', [{userId: 1,roleId: 4, categoryId: null, createdAt: new Date(), updatedAt: new Date()}], {});
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('roles', {
      name: ['joueur', 'coach', 'membre', 'admin']
    }, {});

    await queryInterface.bulkDelete('categories', {
      name: ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'senior', 'veteran', 'futsal', 'feminines']
    }, {});

    await queryInterface.bulkDelete('users', {
      email: userEmail,
    }, {});
  }
};
