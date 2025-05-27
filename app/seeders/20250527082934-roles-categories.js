'use strict';

export default {
  async up (queryInterface) {
    const roles = ['joueur', 'coach', 'membre', 'admin'];
    const categories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'senior', 'veteran', 'futsal'];

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

    await queryInterface.bulkInsert('roles', roleObjects, {});
    await queryInterface.bulkInsert('categories', categoryObjects, {});
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('roles', {
      name: ['joueur', 'coach', 'membre', 'admin']
    }, {});

    await queryInterface.bulkDelete('categories', {
      name: ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'senior', 'veteran', 'futsal']
    }, {});
  }
};
