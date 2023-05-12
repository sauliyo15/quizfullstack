"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name CreateGroupQuizzesTable

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      "GroupQuizzes",
      {
        quizId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: "compositeKey",
          allowNull: false,
          references: {
            model: "Quizzes",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        groupId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: "compositeKey",
          allowNull: false,
          references: {
            model: "Groups",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable("GroupQuizzes");
  },
};
