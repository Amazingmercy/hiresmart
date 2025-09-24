// backend/models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    company: DataTypes.STRING,
  }, {
    timestamps: true,
    tableName: 'users',
  });

  return User;
};
