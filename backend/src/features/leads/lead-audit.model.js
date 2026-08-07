import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class LeadAudit extends Model {}

LeadAudit.init(
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

    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    fieldName: DataTypes.STRING(150),

    oldValue: DataTypes.JSONB,

    newValue: DataTypes.JSONB,

    changedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LeadAudit",
    tableName: "lead_audits",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default LeadAudit;
