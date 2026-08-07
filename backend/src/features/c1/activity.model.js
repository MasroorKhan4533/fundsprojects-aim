import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class Activity extends Model {}

Activity.init(
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

    activityType: {
      type: DataTypes.ENUM(
        "CALL",
        "EMAIL",
        "WHATSAPP",
        "LINKEDIN_MESSAGE",
        "ONLINE_MEETING",
        "OFFLINE_MEETING",
        "OTHER"
      ),
      allowNull: false,
    },

    activityAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    performedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    contactPersonId:
      DataTypes.UUID,

    discussionContent:
      DataTypes.TEXT,

    customerResponse:
      DataTypes.ENUM(
        "INTERESTED",
        "REPLIED",
        "MEETING_SCHEDULED",
        "FOLLOW_UP_REQUIRED",
        "NO_RESPONSE",
        "CALL_BACK_LATER",
        "NOT_INTERESTED",
        "WRONG_CONTACT",
        "REQUIREMENT_NOT_CLEAR",
        "ON_HOLD",
        "OTHER"
      ),

    outcome:
      DataTypes.STRING(200),

    notes:
      DataTypes.TEXT,

    callStatus:
      DataTypes.ENUM(
        "CONNECTED",
        "NOT_ANSWERED",
        "BUSY",
        "SWITCHED_OFF",
        "WRONG_NUMBER",
        "CALL_BACK_REQUESTED"
      ),

    callDurationMinutes:
      DataTypes.INTEGER,

    recordingUrl:
      DataTypes.STRING(1000),

    meetingMode:
      DataTypes.ENUM(
        "ONLINE",
        "OFFLINE"
      ),

    meetingAgenda:
      DataTypes.TEXT,

    attendees: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    meetingSummary:
      DataTypes.TEXT,

    nextAction:
      DataTypes.TEXT,

    meetingLink:
      DataTypes.STRING(1000),

    meetingLocation:
      DataTypes.STRING(500),

    nextFollowUpAt:
      DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "Activity",
    tableName: "activities",
    timestamps: true,
    underscored: true,
  }
);

export default Activity;
