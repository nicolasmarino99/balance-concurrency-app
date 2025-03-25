module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10000
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.bulkInsert('Users', [{
      balance: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  }
};