const express = require('express');
const { Sequelize } = require('sequelize');
const Umzug = require('umzug');
const balanceRouter = require('./routes/balance');

const app = express();
app.use(express.json());

const umzug = new Umzug({
  migrations: {
    path: './migrations',
    params: [sequelize.getQueryInterface()],
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize,
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    await umzug.up();
    console.log('Migrations executed.');
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start application:', error);
  }
})();

app.use('/balance', balanceRouter);

module.exports = app;