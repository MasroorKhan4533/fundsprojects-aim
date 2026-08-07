import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class FollowUp extends Model {}

FollowUp.init(
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

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    followUpAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    followUpType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    purpose:
      DataTypes.TEXT,

    notes:
      DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "COMPLETED",
        "RESCHEDULED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    assignedUserId: {
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
    modelName: "FollowUp",
    tableName: "follow_ups",
    timestamps: true,
    underscored: true,
  }
);

export default FollowUp;
