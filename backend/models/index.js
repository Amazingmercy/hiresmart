// backend/models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user.model')(sequelize, Sequelize.DataTypes);
const Job = require('./job.model')(sequelize, Sequelize.DataTypes);
const Application = require('./application.model')(sequelize, Sequelize.DataTypes);

// Associations
User.hasMany(Job, { foreignKey: 'employer_id' });
Job.belongsTo(User, { foreignKey: 'employer_id' });

User.hasMany(Application, { foreignKey: 'candidate_id' });
Application.belongsTo(User, { foreignKey: 'candidate_id' });

Job.hasMany(Application, { foreignKey: 'job_id' });
Application.belongsTo(Job, { foreignKey: 'job_id' });

module.exports = {
  sequelize,
  User,
  Job,
  Application,
};
