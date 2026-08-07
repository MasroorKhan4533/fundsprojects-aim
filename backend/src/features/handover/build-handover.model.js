import {
  DataTypes,
  Model,
} from "sequelize";

import { sequelize } from "../../config/database.js";

/*
  Internal sales-to-BUILD handover record.
*/
class BuildHandover extends Model {}

BuildHandover.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:
        DataTypes.UUIDV4,
      primaryKey: true,
    },

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    handoverCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    projectName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    clientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    finalScopeSummary:
      DataTypes.TEXT,

    commercialSummary:
      DataTypes.TEXT,

    keyRequirements: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    importantDependencies: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    referenceUrls: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    internalNotes:
      DataTypes.TEXT,

    handoverStatus: {
      type: DataTypes.ENUM(
        "DRAFT",
        "READY",
        "HANDED_OVER"
      ),
      defaultValue: "DRAFT",
    },

    handedOverAt:
      DataTypes.DATE,

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName:
      "BuildHandover",
    tableName:
      "build_handovers",
    timestamps: true,
    underscored: true,
  }
);

export default BuildHandover;
