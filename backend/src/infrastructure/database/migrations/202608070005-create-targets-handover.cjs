"use strict";

/*
  STEP 3 database migration.

  daily_targets:
  Stores daily sales/activity targets per team member.

  build_handovers:
  Stores the internal handover created after a deal is WON.
*/

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daily_targets", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      target_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      leads_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      calls_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      meetings_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      follow_ups_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      proposals_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      closures_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      notes: Sequelize.TEXT,

      created_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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

    await queryInterface.addConstraint(
      "daily_targets",
      {
        fields: [
          "user_id",
          "target_date",
        ],
        type: "unique",
        name: "daily_targets_user_date_unique",
      }
    );

    await queryInterface.createTable("build_handovers", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },

      lead_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "leads",
          key: "id",
        },
      },

      handover_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      project_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      client_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      final_scope_summary: Sequelize.TEXT,

      commercial_summary: Sequelize.TEXT,

      key_requirements: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      important_dependencies: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      reference_urls: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      internal_notes: Sequelize.TEXT,

      handover_status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "READY",
          "HANDED_OVER"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
      },

      handed_over_at: Sequelize.DATE,

      created_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      updated_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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

    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS handover_business_id_seq START 1;
    `);

    await queryInterface.addIndex(
      "daily_targets",
      ["target_date"]
    );

    await queryInterface.addIndex(
      "build_handovers",
      ["handover_status"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "build_handovers"
    );

    await queryInterface.dropTable(
      "daily_targets"
    );

    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS handover_business_id_seq;
    `);
  },
};
