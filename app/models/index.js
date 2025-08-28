'use strict';

import { sequelize } from '../config/database.js';
import initModels from './InitModels.js';

const models = initModels(sequelize);

export default {
  ...models,
  sequelize,
};
