const seedRolesAndCategories = async (models) => {
  try {
    const roles = ['joueur', 'coach', 'membre', 'admin'];
    const categories = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'senior', 'veteran', 'futsal'];

    // Utilisation des modèles passés en paramètre
    for (const roleName of roles) {
      await models.Roles.findOrCreate({ where: { name: roleName } });
    }

    for (const categoryName of categories) {
      await models.Categories.findOrCreate({ where: { name: categoryName } });
    }

    console.log('Rôles et catégories pré-remplis avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors du pré-remplissage des rôles et des catégories:', error);
    throw error; // Propager l'erreur pour la gestion dans la chaîne de promesses
  }
};

module.exports = seedRolesAndCategories;