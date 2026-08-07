import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

/*
  Stores solution versions V1, V2, V3 and any future revisions.
*/
class SolutionVersion extends Model {}

SolutionVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    versionLabel: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    solutionSummary: DataTypes.TEXT,

    modules: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    scopeNotes: DataTypes.TEXT,
    clientFeedback: DataTypes.TEXT,

    demoUrl: DataTypes.STRING(1500),
    presentationUrl: DataTypes.STRING(1500),

    status: {
      type: DataTypes.ENUM(
        "DRAFT",
        "SHARED",
        "REVISED",
        "APPROVED",
        "REJECTED"
      ),
      defaultValue: "DRAFT",
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "SolutionVersion",
    tableName: "solution_versions",
    timestamps: true,
    underscored: true,
  }
);

export default SolutionVersion;
