"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS lead_business_id_seq START 1;
    `);

    await queryInterface.createTable("leads", {
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

      company_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      website: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      linkedin_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      sector: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      sub_sector: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      business_types: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },

      company_size: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      employee_strength: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      annual_turnover: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
      },

      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      lead_source: {
        type: Sequelize.ENUM(
          "LINKEDIN",
          "REFERRAL",
          "WEBSITE",
          "COLD_CALL",
          "EVENT",
          "APOLLO",
          "GOOGLE",
          "UPWORK",
          "FIVERR",
          "ADVERTISEMENT",
          "EXISTING_DATABASE",
          "PARTNER",
          "OTHER"
        ),
        allowNull: false,
      },

      other_source_description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      verification_status: {
        type: Sequelize.ENUM("PENDING", "VALID", "INVALID"),
        allowNull: false,
        defaultValue: "PENDING",
      },

      invalid_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      potential_status: {
        type: Sequelize.ENUM(
          "UNSURE",
          "POTENTIAL",
          "NON_POTENTIAL"
        ),
        allowNull: false,
        defaultValue: "UNSURE",
      },

      temperature: {
        type: Sequelize.ENUM("HOT", "WARM", "COLD"),
        allowNull: false,
        defaultValue: "WARM",
      },

      stage: {
        type: Sequelize.ENUM(
          "C1",
          "C2",
          "C3",
          "C4",
          "WON",
          "LOST"
        ),
        allowNull: false,
        defaultValue: "C1",
      },

      estimated_project_budget: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
      },

      company_overview: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      pain_points: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      research_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      assigned_owner_id: {
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

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable("lead_contacts", {
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
        onDelete: "CASCADE",
      },

      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      designation: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      mobile: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      whatsapp: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      contact_type: {
        type: Sequelize.ENUM(
          "DECISION_MAKER",
          "INFLUENCER",
          "TECHNICAL",
          "FINANCE",
          "OPERATIONS",
          "PURCHASE",
          "OTHER"
        ),
        allowNull: false,
        defaultValue: "OTHER",
      },

      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.createTable("lead_comments", {
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
        onDelete: "CASCADE",
      },

      stage_context: {
        type: Sequelize.ENUM("A", "C1", "C2", "C3", "C4"),
        allowNull: false,
        defaultValue: "A",
      },

      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    });

    await queryInterface.createTable("lead_audits", {
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
        onDelete: "CASCADE",
      },

      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      field_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      old_value: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      new_value: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      changed_by_id: {
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
    });

    await queryInterface.addIndex("leads", ["company_name"]);
    await queryInterface.addIndex("leads", ["assigned_owner_id"]);
    await queryInterface.addIndex("leads", ["stage"]);
    await queryInterface.addIndex("leads", ["temperature"]);
    await queryInterface.addIndex("leads", ["verification_status"]);
    await queryInterface.addIndex("leads", ["potential_status"]);
    await queryInterface.addIndex("leads", ["created_at"]);

    await queryInterface.addIndex("lead_contacts", ["lead_id"]);
    await queryInterface.addIndex("lead_contacts", ["email"]);
    await queryInterface.addIndex("lead_contacts", ["mobile"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("lead_audits");
    await queryInterface.dropTable("lead_comments");
    await queryInterface.dropTable("lead_contacts");
    await queryInterface.dropTable("leads");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_lead_comments_stage_context";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_lead_contacts_contact_type";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_leads_lead_source";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_leads_verification_status";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_leads_potential_status";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_leads_temperature";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_leads_stage";'
    );

    await queryInterface.sequelize.query(
      "DROP SEQUENCE IF EXISTS lead_business_id_seq;"
    );
  },
};
