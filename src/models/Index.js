const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Category = require('./Category');
const UserRoleCategory = require('./UserRoleCategory');
const Training = require('./Training');
const TrainingUserStatus = require('./TrainingUserStatus');

Category.hasMany(Training, { foreignKey: 'categoryId' });

UserRoleCategory.belongsTo(User, { foreignKey: 'userId' });
UserRoleCategory.belongsTo(Role, { foreignKey: 'roleId' });
UserRoleCategory.belongsTo(Category, { foreignKey: 'categoryId', allowNull: true });
Training.belongsTo(Category, { foreignKey: 'categoryId' });
Training.hasMany(TrainingUserStatus, { foreignKey: 'trainingId' });
TrainingUserStatus.belongsTo(User, { foreignKey: 'userId' });
TrainingUserStatus.belongsTo(Training, { foreignKey: 'trainingId' });


Category.hasMany(UserRoleCategory, { foreignKey: 'categoryId' });
Role.hasMany(UserRoleCategory, { foreignKey: 'roleId' });
User.hasMany(UserRoleCategory, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Role,
  Category,
  UserRoleCategory,
  Training,
  TrainingUserStatus,
};
