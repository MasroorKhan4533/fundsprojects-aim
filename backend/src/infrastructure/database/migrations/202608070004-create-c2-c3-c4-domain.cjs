"use strict";

/*
  C2/C3/C4 database migration.

  C2 = detailed requirement clarity.
  C3 = solution, proposal, quotation and negotiation.
  C4 = commercial closure and customer conversion.
*/

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("c2_profiles", {
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

      current_workflow: Sequelize.TEXT,

      must_have_requirements: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      good_to_have_requirements: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      excluded_requirements: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      required_reports: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      integrations: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      demo_feedback: Sequelize.TEXT,

      business_requirement_summary: Sequelize.TEXT,

      brd_url: Sequelize.STRING(1500),
      prd_url: Sequelize.STRING(1500),
      costing_url: Sequelize.STRING(1500),

      status: {
        type: Sequelize.ENUM(
          "NOT_STARTED",
          "IN_PROGRESS",
          "WAITING_FOR_CLIENT",
          "READY_FOR_C3",
          "ON_HOLD"
        ),
        allowNull: false,
        defaultValue: "NOT_STARTED",
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

    await queryInterface.createTable("solution_versions", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },

      lead_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "leads",
          key: "id",
        },
      },

      version_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      version_label: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },

      solution_summary: Sequelize.TEXT,

      modules: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      scope_notes: Sequelize.TEXT,

      client_feedback: Sequelize.TEXT,

      demo_url: Sequelize.STRING(1500),
      presentation_url: Sequelize.STRING(1500),

      status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "SHARED",
          "REVISED",
          "APPROVED",
          "REJECTED"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
      },

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

    await queryInterface.createTable("commercial_profiles", {
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

      proposal_url: Sequelize.STRING(1500),
      quotation_url: Sequelize.STRING(1500),

      quotation_number: Sequelize.STRING(100),

      proposal_amount: Sequelize.DECIMAL(18, 2),
      quotation_amount: Sequelize.DECIMAL(18, 2),

      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },

      probability_percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
      },

      negotiation_notes: Sequelize.TEXT,

      commercial_status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "PROPOSAL_SENT",
          "QUOTATION_SENT",
          "NEGOTIATION",
          "COMMERCIAL_AGREED"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
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

    await queryInterface.createTable("c4_closures", {
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

      agreement_url: Sequelize.STRING(1500),
      nda_url: Sequelize.STRING(1500),
      purchase_order_url: Sequelize.STRING(1500),

      purchase_order_number: Sequelize.STRING(150),

      final_deal_value: Sequelize.DECIMAL(18, 2),

      advance_amount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },

      payment_status: {
        type: Sequelize.ENUM(
          "NOT_STARTED",
          "ADVANCE_PENDING",
          "ADVANCE_RECEIVED",
          "PARTIALLY_PAID",
          "PAID"
        ),
        allowNull: false,
        defaultValue: "NOT_STARTED",
      },

      closure_notes: Sequelize.TEXT,

      status: {
        type: Sequelize.ENUM(
          "NEGOTIATING",
          "DOCUMENTATION",
          "READY_TO_CLOSE",
          "WON",
          "LOST"
        ),
        allowNull: false,
        defaultValue: "NEGOTIATING",
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

    await queryInterface.addIndex(
      "solution_versions",
      ["lead_id", "version_number"],
      {
        unique: true,
      }
    );

    await queryInterface.addIndex(
      "c2_profiles",
      ["lead_id"]
    );

    await queryInterface.addIndex(
      "commercial_profiles",
      ["lead_id"]
    );

    await queryInterface.addIndex(
      "c4_closures",
      ["lead_id"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("c4_closures");
    await queryInterface.dropTable("commercial_profiles");
    await queryInterface.dropTable("solution_versions");
    await queryInterface.dropTable("c2_profiles");
  },
};
