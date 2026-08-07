import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class C1Profile extends Model {}

C1Profile.init(
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

    businessUnderstanding: DataTypes.TEXT,
    initialRequirement: DataTypes.TEXT,
    currentPainPoints: DataTypes.TEXT,
    decisionMakersIdentified: DataTypes.TEXT,

    buyingIntent: {
      type: DataTypes.ENUM(
        "HIGH",
        "MEDIUM",
        "LOW",
        "UNKNOWN"
      ),
      allowNull: false,
      defaultValue: "UNKNOWN",
    },

    initialBudgetIndication:
      DataTypes.DECIMAL(18, 2),

    expectedTimeline:
      DataTypes.STRING(200),

    status: {
      type: DataTypes.ENUM(
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

    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "C1Profile",
    tableName: "c1_profiles",
    timestamps: true,
    underscored: true,
  }
);

export default C1Profile;
