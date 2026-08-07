import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

/*
  Stores final closure documentation and basic payment readiness.
*/
class C4Closure extends Model {}

C4Closure.init(
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

    agreementUrl: DataTypes.STRING(1500),
    ndaUrl: DataTypes.STRING(1500),
    purchaseOrderUrl: DataTypes.STRING(1500),

    purchaseOrderNumber: DataTypes.STRING(150),

    finalDealValue: DataTypes.DECIMAL(18, 2),

    advanceAmount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0,
    },

    paymentStatus: {
      type: DataTypes.ENUM(
        "NOT_STARTED",
        "ADVANCE_PENDING",
        "ADVANCE_RECEIVED",
        "PARTIALLY_PAID",
        "PAID"
      ),
      defaultValue: "NOT_STARTED",
    },

    closureNotes: DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM(
        "NEGOTIATING",
        "DOCUMENTATION",
        "READY_TO_CLOSE",
        "WON",
        "LOST"
      ),
      defaultValue: "NEGOTIATING",
    },

    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "C4Closure",
    tableName: "c4_closures",
    timestamps: true,
    underscored: true,
  }
);

export default C4Closure;
