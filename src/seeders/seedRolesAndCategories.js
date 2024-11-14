const Role = require('../models/Role');
const Category = require('../models/Category');

const seedRolesAndCategories = async () => {
  try {
    const roles = ['joueur', 'coach', 'membre', 'admin'];
    const categories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'senior', 'veteran', 'futsal'];

    for (const roleName of roles) {
      await Role.findOrCreate({ where: { name: roleName } });
    }

    for (const categoryName of categories) {
      await Category.findOrCreate({ where: { name: categoryName } });
    }

    console.log('Rôles et catégories pré-remplis avec succès.');
  } catch (error) {
    console.error('Erreur lors du pré-remplissage des rôles et des catégories:', error);
  }
};

module.exports = seedRolesAndCategories;
