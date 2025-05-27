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
import defineArticleCategories from './ArticleCategories.js';

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
  const ArticleCategories = defineArticleCategories(sequelize);


  Users.hasMany(PrivateMessages, {foreignKey: 'senderId'});
  Users.hasMany(PrivateMessages, {foreignKey: 'receiverId'});
  Users.hasMany(GroupMessages, {foreignKey: 'senderId'});

  UsersCoachTeam.belongsTo(Users, { foreignKey: 'userCoachId' });
  Users.hasMany(UsersCoachTeam, { foreignKey: 'userCoachId' });

  UsersCoachTeam.belongsTo(Teams, { foreignKey: 'teamId' });
  Teams.hasMany(UsersCoachTeam, { foreignKey: 'teamId' });

  Users.hasMany(Articles, {foreignKey: 'userAuthorId'});

  UserRolesCategories.belongsTo(Users, { foreignKey: 'userId' });
  Users.hasMany(UserRolesCategories, { foreignKey: 'userId' });

  UserRolesCategories.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(UserRolesCategories, { foreignKey: 'categoryId' });

  Trainings.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(Trainings, { foreignKey: 'categoryId' });

  TrainingUsersStatus.belongsTo(Users, { foreignKey: 'userId' });
  Users.hasMany(TrainingUsersStatus, { foreignKey: 'userId' })

  TrainingUsersStatus.belongsTo(Trainings, { foreignKey: 'trainingId' });
  Trainings.hasMany(TrainingUsersStatus, { foreignKey: 'trainingId' });

  UserRolesCategories.belongsTo(Roles, { foreignKey: 'roleId' });
  Roles.hasMany(UserRolesCategories, { foreignKey: 'roleId' });

  UsersChatGroup.belongsTo(Users, { foreignKey: 'userId' });
  Users.hasMany(UsersChatGroup, { foreignKey: 'userId' });

  UsersChatGroup.belongsTo(ChatGroups, { foreignKey: 'chatGroupId' });
  ChatGroups.hasMany(UsersChatGroup, { foreignKey: 'chatGroupId' });

  UsersConvocation.belongsTo(Users, { foreignKey: 'userId' });
  Users.hasMany(UsersConvocation, { foreignKey: 'userId' });

  UsersConvocation.belongsTo(Convocations, { foreignKey: 'convocationId' });
  Convocations.hasMany(UsersConvocation, { foreignKey: 'convocationId' });

  ArticleCategories.belongsTo(Articles, { foreignKey: 'articleId' });
  Articles.hasMany(ArticleCategories, { foreignKey: 'articleId' });

  ArticleCategories.belongsTo(Categories, { foreignKey: 'categoryId' });
  Categories.hasMany(ArticleCategories, { foreignKey: 'categoryId' });

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
    ArticleCategories,
    UsersChatGroup,
    ChatGroups,
    UsersCoachTeam,
    Teams,
    Convocations,
    UsersConvocation,
  };
}

export default initModels;
