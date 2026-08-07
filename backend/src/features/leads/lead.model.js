import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class Lead extends Model {}

Lead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    businessId: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },

    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    website: DataTypes.STRING(500),

    linkedinUrl: DataTypes.STRING(500),

    sector: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    subSector: DataTypes.STRING(150),

    businessTypes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    companySize: DataTypes.STRING(100),

    employeeStrength: DataTypes.INTEGER,

    annualTurnover: DataTypes.DECIMAL(18, 2),

    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    state: DataTypes.STRING(100),

    city: DataTypes.STRING(100),

    leadSource: {
      type: DataTypes.ENUM(
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

    otherSourceDescription: DataTypes.STRING(255),

    verificationStatus: {
      type: DataTypes.ENUM("PENDING", "VALID", "INVALID"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    invalidReason: DataTypes.TEXT,

    potentialStatus: {
      type: DataTypes.ENUM(
        "UNSURE",
        "POTENTIAL",
        "NON_POTENTIAL"
      ),
      allowNull: false,
      defaultValue: "UNSURE",
    },

    temperature: {
      type: DataTypes.ENUM("HOT", "WARM", "COLD"),
      allowNull: false,
      defaultValue: "WARM",
    },

    stage: {
      type: DataTypes.ENUM(
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

    estimatedProjectBudget: DataTypes.DECIMAL(18, 2),

    companyOverview: DataTypes.TEXT,

    painPoints: DataTypes.TEXT,

    researchNotes: DataTypes.TEXT,

    assignedOwnerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Lead",
    tableName: "leads",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Lead;
