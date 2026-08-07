import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

/*
  Stores the detailed requirement clarity gathered during C2.
*/
class C2Profile extends Model {}

C2Profile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    currentWorkflow: DataTypes.TEXT,

    mustHaveRequirements: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    goodToHaveRequirements: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    excludedRequirements: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    requiredReports: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    integrations: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    demoFeedback: DataTypes.TEXT,

    businessRequirementSummary: DataTypes.TEXT,

    brdUrl: DataTypes.STRING(1500),
    prdUrl: DataTypes.STRING(1500),
    costingUrl: DataTypes.STRING(1500),

    status: {
      type: DataTypes.ENUM(
        "NOT_STARTED",
        "IN_PROGRESS",
        "WAITING_FOR_CLIENT",
        "READY_FOR_C3",
        "ON_HOLD"
      ),
      defaultValue: "NOT_STARTED",
    },

    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "C2Profile",
    tableName: "c2_profiles",
    timestamps: true,
    underscored: true,
  }
);

export default C2Profile;
