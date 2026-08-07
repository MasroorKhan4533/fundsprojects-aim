"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS activity_business_id_seq START 1;
    `);

    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS follow_up_business_id_seq START 1;
    `);

    await queryInterface.createTable("c1_profiles", {
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

      business_understanding: Sequelize.TEXT,
      initial_requirement: Sequelize.TEXT,
      current_pain_points: Sequelize.TEXT,
      decision_makers_identified: Sequelize.TEXT,

      buying_intent: {
        type: Sequelize.ENUM(
          "HIGH",
          "MEDIUM",
          "LOW",
          "UNKNOWN"
        ),
        allowNull: false,
        defaultValue: "UNKNOWN",
      },

      initial_budget_indication: Sequelize.DECIMAL(18, 2),
      expected_timeline: Sequelize.STRING(200),

      status: {
        type: Sequelize.ENUM(
          "NOT_STARTED",
          "IN_PROGRESS",
          "WAITING_FOR_CLIENT",
          "QUALIFIED",
          "ON_HOLD",
          "LOST"
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

    await queryInterface.createTable("activities", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },

      business_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },

      lead_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "leads",
          key: "id",
        },
      },

      activity_type: {
        type: Sequelize.ENUM(
          "CALL",
          "EMAIL",
          "WHATSAPP",
          "LINKEDIN_MESSAGE",
          "ONLINE_MEETING",
          "OFFLINE_MEETING",
          "OTHER"
        ),
        allowNull: false,
      },

      activity_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      performed_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      contact_person_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "lead_contacts",
          key: "id",
        },
      },

      discussion_content: Sequelize.TEXT,

      customer_response: {
        type: Sequelize.ENUM(
          "INTERESTED",
          "REPLIED",
          "MEETING_SCHEDULED",
          "FOLLOW_UP_REQUIRED",
          "NO_RESPONSE",
          "CALL_BACK_LATER",
          "NOT_INTERESTED",
          "WRONG_CONTACT",
          "REQUIREMENT_NOT_CLEAR",
          "ON_HOLD",
          "OTHER"
        ),
        allowNull: true,
      },

      outcome: Sequelize.STRING(200),
      notes: Sequelize.TEXT,

      call_status: {
        type: Sequelize.ENUM(
          "CONNECTED",
          "NOT_ANSWERED",
          "BUSY",
          "SWITCHED_OFF",
          "WRONG_NUMBER",
          "CALL_BACK_REQUESTED"
        ),
        allowNull: true,
      },

      call_duration_minutes: Sequelize.INTEGER,
      recording_url: Sequelize.STRING(1000),

      meeting_mode: {
        type: Sequelize.ENUM("ONLINE", "OFFLINE"),
        allowNull: true,
      },

      meeting_agenda: Sequelize.TEXT,

      attendees: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      meeting_summary: Sequelize.TEXT,
      next_action: Sequelize.TEXT,
      meeting_link: Sequelize.STRING(1000),
      meeting_location: Sequelize.STRING(500),

      next_follow_up_at: Sequelize.DATE,

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("follow_ups", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },

      business_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },

      lead_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "leads",
          key: "id",
        },
      },

      follow_up_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      follow_up_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      purpose: Sequelize.TEXT,
      notes: Sequelize.TEXT,

      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "COMPLETED",
          "RESCHEDULED",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      assigned_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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

    await queryInterface.createTable("documents", {
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

      stage_context: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      document_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      storage_type: {
        type: Sequelize.ENUM(
          "URL",
          "LOCAL"
        ),
        allowNull: false,
      },

      external_url: Sequelize.STRING(1500),
      file_path: Sequelize.STRING(1000),
      original_name: Sequelize.STRING(500),
      mime_type: Sequelize.STRING(200),
      file_size: Sequelize.INTEGER,

      uploaded_by_id: {
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
      "activities",
      ["lead_id", "activity_at"]
    );

    await queryInterface.addIndex(
      "follow_ups",
      ["lead_id", "follow_up_at"]
    );

    await queryInterface.addIndex(
      "follow_ups",
      ["status", "follow_up_at"]
    );

    await queryInterface.addIndex(
      "documents",
      ["lead_id"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("documents");
    await queryInterface.dropTable("follow_ups");
    await queryInterface.dropTable("activities");
    await queryInterface.dropTable("c1_profiles");

    const enumTypes = [
      "enum_documents_storage_type",
      "enum_follow_ups_status",
      "enum_activities_activity_type",
      "enum_activities_customer_response",
      "enum_activities_call_status",
      "enum_activities_meeting_mode",
      "enum_c1_profiles_buying_intent",
      "enum_c1_profiles_status",
    ];

    for (const type of enumTypes) {
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "${type}";`
      );
    }

    await queryInterface.sequelize.query(
      "DROP SEQUENCE IF EXISTS activity_business_id_seq;"
    );

    await queryInterface.sequelize.query(
      "DROP SEQUENCE IF EXISTS follow_up_business_id_seq;"
    );
  },
};
