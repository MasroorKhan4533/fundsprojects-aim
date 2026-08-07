import {
  DataTypes,
  Model,
} from "sequelize";

import { sequelize } from "../../config/database.js";

/*
  DailyTarget stores one user's targets for one date.
*/
class DailyTarget extends Model {}

DailyTarget.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue:
        DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    targetDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    leadsTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    callsTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    meetingsTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    followUpsTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    proposalsTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    closuresTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    notes:
      DataTypes.TEXT,

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName:
      "DailyTarget",
    tableName:
      "daily_targets",
    timestamps: true,
    underscored: true,
  }
);

export default DailyTarget;
