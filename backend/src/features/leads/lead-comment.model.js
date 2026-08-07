import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class LeadComment extends Model {}

LeadComment.init(
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

    stageContext: {
      type: DataTypes.ENUM("A", "C1", "C2", "C3", "C4"),
      allowNull: false,
      defaultValue: "A",
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LeadComment",
    tableName: "lead_comments",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default LeadComment;
