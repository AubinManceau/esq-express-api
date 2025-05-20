const defineUsers = require('./Users');
const defineRoles = require('./Roles');
const defineCategories = require('./Categories');
const defineUserRolesCategories = require('./UserRolesCategories');
const defineTrainings = require('./Trainings');
const defineTrainingUsersStatus = require('./TrainingUsersStatus');

function initModels(sequelize) {
  const Users = defineUsers(sequelize);
  const Roles = defineRoles(sequelize);
  const Categories = defineCategories(sequelize);
  const UserRolesCategories = defineUserRolesCategories(sequelize);
  const Trainings = defineTrainings(sequelize);
  const TrainingUsersStatus = defineTrainingUsersStatus(sequelize);

  // Associations
  Categories.hasMany(Trainings, { foreignKey: 'categoryId' });

  UserRolesCategories.belongsTo(Users, { foreignKey: 'userId' });
  UserRolesCategories.belongsTo(Roles, { foreignKey: 'roleId' });
  UserRolesCategories.belongsTo(Categories, { foreignKey: 'categoryId' });

  Trainings.belongsTo(Categories, { foreignKey: 'categoryId' });
  Trainings.hasMany(TrainingUsersStatus, { foreignKey: 'trainingId' });

  TrainingUsersStatus.belongsTo(Users, { foreignKey: 'userId' });
  TrainingUsersStatus.belongsTo(Trainings, { foreignKey: 'trainingId' });

  Categories.hasMany(UserRolesCategories, { foreignKey: 'categoryId' });
  Roles.hasMany(UserRolesCategories, { foreignKey: 'roleId' });
  Users.hasMany(UserRolesCategories, { foreignKey: 'userId' });

  return {
    sequelize,
    Users,
    Roles,
    Categories,
    UserRolesCategories,
    Trainings,
    TrainingUsersStatus,
  };
}

module.exports = initModels;
