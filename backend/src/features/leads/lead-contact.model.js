import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class LeadContact extends Model {}

LeadContact.init(
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

    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    designation: DataTypes.STRING(150),

    email: DataTypes.STRING(200),

    mobile: DataTypes.STRING(30),

    whatsapp: DataTypes.STRING(30),

    contactType: {
      type: DataTypes.ENUM(
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

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LeadContact",
    tableName: "lead_contacts",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default LeadContact;
