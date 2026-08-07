"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },

      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM("ADMIN", "TEAM_MEMBER"),
        allowNull: false,
        defaultValue: "TEAM_MEMBER",
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "DISABLED"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_status";'
    );
  },
};
