import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

/*
  Stores proposal, quotation, probability and negotiation data.
*/
class CommercialProfile extends Model {}

CommercialProfile.init(
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

    proposalUrl: DataTypes.STRING(1500),
    quotationUrl: DataTypes.STRING(1500),

    quotationNumber: DataTypes.STRING(100),

    proposalAmount: DataTypes.DECIMAL(18, 2),
    quotationAmount: DataTypes.DECIMAL(18, 2),

    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "INR",
    },

    probabilityPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },

    negotiationNotes: DataTypes.TEXT,

    commercialStatus: {
      type: DataTypes.ENUM(
        "DRAFT",
        "PROPOSAL_SENT",
        "QUOTATION_SENT",
        "NEGOTIATION",
        "COMMERCIAL_AGREED"
      ),
      defaultValue: "DRAFT",
    },

    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CommercialProfile",
    tableName: "commercial_profiles",
    timestamps: true,
    underscored: true,
  }
);

export default CommercialProfile;
