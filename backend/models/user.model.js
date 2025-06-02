// backend/models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.ENUM('employer', 'candidate'), allowNull: false },
  }, {
    timestamps: true,
    tableName: 'users',
  });

  return User;
};
