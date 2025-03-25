const express = require('express');
const { Sequelize } = require('sequelize');
const { Umzug } = require('umzug'); 
const balanceRouter = require('./routes/balance');
const config = require('./config/config.json');

const app = express();
app.use(express.json());

const sequelize = new Sequelize(config.development);

const umzug = new Umzug({
  migrations: {
    glob: 'migrations/*.js',
    resolve: ({ name, path, context }) => {
      const migration = require(path || '');
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: {
    async logMigration({ name }) {
      await sequelize.getQueryInterface().bulkInsert('SequelizeMeta', [{ name }]);
    },
    async unlogMigration({ name }) {
      await sequelize.getQueryInterface().bulkDelete('SequelizeMeta', { name });
    },
    async executed() {
      const migrations = await sequelize.getQueryInterface().select(null, 'SequelizeMeta', {});
      return migrations.map(m => m.name);
    },
  },
  logger: console,
});

const db = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    await sequelize.getQueryInterface().createTable('SequelizeMeta', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
    });
    
    await umzug.up();
    console.log('Migrations executed.');
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start application:', error);
    process.exit(1);
  }
})();

app.use('/balance', balanceRouter);

module.exports = app;