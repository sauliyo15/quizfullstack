"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name CreateGroupsTable

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      "Groups",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
          unique: true,
          validate: {
            notEmpty: { msg: "Group name must not be empty." }
          }
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        sync: { force: true },
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable("Groups");
  },
};
