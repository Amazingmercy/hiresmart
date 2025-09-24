// backend/models/application.model.js
module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    job_id: DataTypes.INTEGER,
    resume_path: DataTypes.STRING,
    screening_details: DataTypes.JSON,
    analysed_score: DataTypes.STRING,
  }, {
    timestamps: true,
    tableName: 'applications',
  });

  return Application;
};
