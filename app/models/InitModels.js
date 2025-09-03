import defineUsers from './Users.js';
import defineRoles from './Roles.js';
import defineCategories from './Categories.js';
import defineUserRolesCategories from './UserRolesCategories.js';
import defineTrainings from './Trainings.js';
import defineTrainingUsersStatus from './TrainingUsersStatus.js';
import definePrivateMessages from './PrivateMessages.js';
import defineGroupMessages from './GroupMessages.js';
import defineArticles from './Articles.js';
import defineChatGroups from './ChatGroups.js';
import defineUsersChatGroup from './UsersChatGroup.js';
import defineUsersCoachTeam from './UsersCoachTeam.js';
import defineTeams from './Teams.js';
import defineUsersConvocation from './UsersConvocation.js';
import defineConvocations from './Convocations.js';

function initModels(sequelize) {
  const Users = defineUsers(sequelize);
  const PrivateMessages = definePrivateMessages(sequelize);
  const Articles = defineArticles(sequelize);
  const GroupMessages = defineGroupMessages(sequelize);
  const Roles = defineRoles(sequelize);
  const Categories = defineCategories(sequelize);
  const UserRolesCategories = defineUserRolesCategories(sequelize);
  const Trainings = defineTrainings(sequelize);
  const TrainingUsersStatus = defineTrainingUsersStatus(sequelize);
  const ChatGroups = defineChatGroups(sequelize);
  const UsersChatGroup = defineUsersChatGroup(sequelize);
  const UsersCoachTeam = defineUsersCoachTeam(sequelize);
  const Teams = defineTeams(sequelize);
  const UsersConvocation = defineUsersConvocation(sequelize);
  const Convocations = defineConvocations(sequelize);

  Teams.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(Teams, { foreignKey: 'categoryId' });

  Teams.hasMany(Convocations, { foreignKey: 'teamId' });
  Convocations.belongsTo(Teams, { foreignKey: 'teamId' });

  Trainings.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(Trainings, { foreignKey: 'categoryId' });

  UserRolesCategories.belongsTo(Users, { foreignKey: 'userId' });
  Users.hasMany(UserRolesCategories, { foreignKey: 'userId' });
  
  UserRolesCategories.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(UserRolesCategories, { foreignKey: 'categoryId' });
  
  UserRolesCategories.belongsTo(Roles, { foreignKey: 'roleId' });
  Roles.hasMany(UserRolesCategories, { foreignKey: 'roleId' });
  
  Users.belongsToMany(Teams, { through: UsersCoachTeam, foreignKey: 'userCoachId', otherKey: 'teamId' });
  Teams.belongsToMany(Users, { through: UsersCoachTeam, foreignKey: 'teamId', otherKey: 'userCoachId' });

  Trainings.belongsToMany(Users, { through: TrainingUsersStatus, foreignKey: 'trainingId', otherKey: 'userId' });
  Users.belongsToMany(Trainings, { through: TrainingUsersStatus, foreignKey: 'userId', otherKey: 'trainingId' });

  Users.belongsToMany(ChatGroups, { through: UsersChatGroup, foreignKey: 'userId', otherKey: 'chatGroupId' });
  ChatGroups.belongsToMany(Users, { through: UsersChatGroup, foreignKey: 'chatGroupId', otherKey: 'userId' });

  Users.belongsToMany(Convocations, { through: UsersConvocation, foreignKey: 'userId', otherKey: 'convocationId' });
  Convocations.belongsToMany(Users, { through: UsersConvocation, foreignKey: 'convocationId', otherKey: 'userId' });

  ChatGroups.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(ChatGroups, { foreignKey: 'categoryId' });

  ChatGroups.belongsTo(Roles, { foreignKey: 'roleId' });
  Roles.hasMany(ChatGroups, { foreignKey: 'roleId' });

  GroupMessages.belongsTo(Users, { foreignKey: 'senderId' });
  Users.hasMany(GroupMessages, { foreignKey: 'senderId' });
  
  GroupMessages.belongsTo(ChatGroups, { foreignKey: 'chatGroupId' });
  ChatGroups.hasMany(GroupMessages, { foreignKey: 'chatGroupId' });

  Users.hasMany(PrivateMessages, { foreignKey: 'senderId' });
  PrivateMessages.belongsTo(Users, { foreignKey: 'senderId' });

  Users.hasMany(PrivateMessages, { foreignKey: 'receiverId' });
  PrivateMessages.belongsTo(Users, { foreignKey: 'receiverId' });

  Users.hasMany(Articles, { foreignKey: 'userAuthorId' });
  Articles.belongsTo(Users, { foreignKey: 'userAuthorId' });

  return {
    sequelize,
    Users,
    Roles,
    Categories,
    UserRolesCategories,
    Trainings,
    TrainingUsersStatus,
    PrivateMessages,
    GroupMessages,
    Articles,
    UsersChatGroup,
    ChatGroups,
    UsersCoachTeam,
    Teams,
    Convocations,
    UsersConvocation,
  };
}

export default initModels;
