"use strict";

//Este fichero se crea tras ejecutar el comando npx sequelize migration:create --name CreateQuizzesTable

//Y seran llamados bajo su orden de creacion con el comando definido en el package.json
//  -npm run migrate o npm run migrate_win (para Windows)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      "Quizzes",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        question: {
          type: Sequelize.STRING,
          validate: { notEmpty: { msg: "Question must not be empty" } },
        },
        answer: {
          type: Sequelize.STRING,
          validate: { notEmpty: { msg: "Answer must not be empty" } },
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

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Quizzes');
  },
};
