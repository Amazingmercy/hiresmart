// backend/models/job.model.js
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    required_skills: DataTypes.TEXT,
    qualifications: DataTypes.TEXT,
    experience_years: DataTypes.STRING,
    salary: DataTypes.STRING
  }, {
    timestamps: true,
    tableName: 'jobs',
  });

  return Job;
};
