import User from "../features/users/user.model.js";

import Lead from "../features/leads/lead.model.js";
import LeadContact from "../features/leads/lead-contact.model.js";
import LeadComment from "../features/leads/lead-comment.model.js";
import LeadAudit from "../features/leads/lead-audit.model.js";

import C1Profile from "../features/c1/c1-profile.model.js";
import Activity from "../features/c1/activity.model.js";
import FollowUp from "../features/c1/follow-up.model.js";

import Document from "../features/documents/document.model.js";

let initialized = false;

export const initializeAssociations =
  () => {
    if (initialized) {
      return;
    }

    Lead.belongsTo(User, {
      as: "assignedOwner",
      foreignKey:
        "assignedOwnerId",
    });

    Lead.belongsTo(User, {
      as: "creator",
      foreignKey:
        "createdById",
    });

    Lead.hasMany(
      LeadContact,
      {
        as: "contacts",
        foreignKey:
          "leadId",
      }
    );

    LeadContact.belongsTo(
      Lead,
      {
        as: "lead",
        foreignKey:
          "leadId",
      }
    );

    Lead.hasMany(
      LeadComment,
      {
        as: "comments",
        foreignKey:
          "leadId",
      }
    );

    LeadComment.belongsTo(
      User,
      {
        as: "author",
        foreignKey:
          "createdById",
      }
    );

    Lead.hasMany(
      LeadAudit,
      {
        as: "audits",
        foreignKey:
          "leadId",
      }
    );

    LeadAudit.belongsTo(
      User,
      {
        as: "changedBy",
        foreignKey:
          "changedById",
      }
    );

    Lead.hasOne(
      C1Profile,
      {
        as: "c1Profile",
        foreignKey:
          "leadId",
      }
    );

    C1Profile.belongsTo(
      Lead,
      {
        as: "lead",
        foreignKey:
          "leadId",
      }
    );

    Lead.hasMany(
      Activity,
      {
        as: "activities",
        foreignKey:
          "leadId",
      }
    );

    Activity.belongsTo(
      Lead,
      {
        as: "lead",
        foreignKey:
          "leadId",
      }
    );

    Activity.belongsTo(
      User,
      {
        as: "performedBy",
        foreignKey:
          "performedById",
      }
    );

    Activity.belongsTo(
      LeadContact,
      {
        as: "contactPerson",
        foreignKey:
          "contactPersonId",
      }
    );

    Lead.hasMany(
      FollowUp,
      {
        as: "followUps",
        foreignKey:
          "leadId",
      }
    );

    FollowUp.belongsTo(
      Lead,
      {
        as: "lead",
        foreignKey:
          "leadId",
      }
    );

    FollowUp.belongsTo(
      User,
      {
        as: "assignedUser",
        foreignKey:
          "assignedUserId",
      }
    );

    Lead.hasMany(
      Document,
      {
        as: "documents",
        foreignKey:
          "leadId",
      }
    );

    Document.belongsTo(
      Lead,
      {
        as: "lead",
        foreignKey:
          "leadId",
      }
    );

    initialized = true;
  };
