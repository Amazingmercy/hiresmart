// backend/server.js
const app = require('./app');
const PORT = process.env.PORT || 9400;
const { sequelize } = require('./models');




sequelize
  .sync({ alter: false })
  .then(() => console.log("Database synced"))
  .then(() => app.listen(PORT))
  .then(() => console.log(`Server running at http://localhost:${PORT}`))
  .catch((err) => console.error("Sync failed:", err));

