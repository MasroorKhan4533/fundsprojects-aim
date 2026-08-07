import { Op } from "sequelize";

import { sequelize } from "../../config/database.js";

import User from "../users/user.model.js";

import Lead from "./lead.model.js";
import LeadContact from "./lead-contact.model.js";
import LeadComment from "./lead-comment.model.js";
import LeadAudit from "./lead-audit.model.js";

const safeUserAttributes = [
  "id",
  "fullName",
  "email",
  "role",
  "status",
];

export const requireLead = async (
  id,
  options = {}
) => {
  const lead = await Lead.findByPk(id, options);

  if (!lead) {
    const error = new Error("Lead not found");
    error.status = 404;
    throw error;
  }

  return lead;
};

export const requireLeadEditAccess = (lead, user) => {
  if (
    user.role !== "ADMIN" &&
    lead.assignedOwnerId !== user.id
  ) {
    const error = new Error(
      "You can edit only leads assigned to you"
    );

    error.status = 403;
    throw error;
  }
};

const ensureValidOwner = async (
  ownerId,
  transaction
) => {
  const user = await User.findByPk(ownerId, {
    transaction,
  });

  if (!user || user.status !== "ACTIVE") {
    const error = new Error(
      "Assigned owner must be an active user"
    );

    error.status = 400;
    throw error;
  }

  return user;
};

const createBusinessId = async (
  transaction
) => {
  const [rows] = await sequelize.query(
    "SELECT nextval('lead_business_id_seq') AS sequence_number",
    { transaction }
  );

  const sequence = Number(
    rows[0].sequence_number
  );

  return `AIM-L-${String(sequence).padStart(
    6,
    "0"
  )}`;
};

const audit = async ({
  leadId,
  action,
  fieldName = null,
  oldValue = null,
  newValue = null,
  changedById,
  transaction,
}) => {
  await LeadAudit.create(
    {
      leadId,
      action,
      fieldName,
      oldValue,
      newValue,
      changedById,
    },
    { transaction }
  );
};

export const checkLeadDuplicates = async ({
  companyName,
  website,
  email,
  mobile,
}) => {
  const leadIds = new Set();

  const leadConditions = [];

  if (companyName) {
    leadConditions.push({
      companyName: {
        [Op.iLike]: companyName.trim(),
      },
    });
  }

  if (website) {
    leadConditions.push({
      website: {
        [Op.iLike]: website.trim(),
      },
    });
  }

  if (leadConditions.length) {
    const matchingLeads = await Lead.findAll({
      where: {
        [Op.or]: leadConditions,
      },
      attributes: ["id"],
    });

    matchingLeads.forEach((lead) =>
      leadIds.add(lead.id)
    );
  }

  const contactConditions = [];

  if (email) {
    contactConditions.push({
      email: {
        [Op.iLike]: email.trim(),
      },
    });
  }

  if (mobile) {
    contactConditions.push({
      mobile: mobile.trim(),
    });
  }

  if (contactConditions.length) {
    const contacts = await LeadContact.findAll({
      where: {
        [Op.or]: contactConditions,
      },
      attributes: ["leadId"],
    });

    contacts.forEach((contact) =>
      leadIds.add(contact.leadId)
    );
  }

  if (!leadIds.size) {
    return [];
  }

  return Lead.findAll({
    where: {
      id: {
        [Op.in]: [...leadIds],
      },
    },

    attributes: [
      "id",
      "businessId",
      "companyName",
      "website",
      "stage",
      "temperature",
      "assignedOwnerId",
    ],

    include: [
      {
        model: LeadContact,
        as: "contacts",
        where: {
          isPrimary: true,
        },
        required: false,
      },
    ],

    limit: 10,
  });
};

export const createLead = async (
  payload,
  currentUser
) => {
  const possibleDuplicates =
    await checkLeadDuplicates({
      companyName: payload.companyName,
      website: payload.website,
      email: payload.primaryContact?.email,
      mobile: payload.primaryContact?.mobile,
    });

  const transaction =
    await sequelize.transaction();

  try {
    let assignedOwnerId = currentUser.id;

    if (
      currentUser.role === "ADMIN" &&
      payload.assignedOwnerId
    ) {
      assignedOwnerId =
        payload.assignedOwnerId;
    }

    await ensureValidOwner(
      assignedOwnerId,
      transaction
    );

    const businessId =
      await createBusinessId(transaction);

    const lead = await Lead.create(
      {
        businessId,

        companyName:
          payload.companyName.trim(),

        website:
          payload.website || null,

        linkedinUrl:
          payload.linkedinUrl || null,

        sector: payload.sector,

        subSector:
          payload.subSector || null,

        businessTypes:
          payload.businessTypes || [],

        companySize:
          payload.companySize || null,

        employeeStrength:
          payload.employeeStrength ?? null,

        annualTurnover:
          payload.annualTurnover ?? null,

        country: payload.country,

        state: payload.state || null,

        city: payload.city || null,

        leadSource: payload.leadSource,

        otherSourceDescription:
          payload.otherSourceDescription ||
          null,

        estimatedProjectBudget:
          payload.estimatedProjectBudget ??
          null,

        companyOverview:
          payload.companyOverview || null,

        painPoints:
          payload.painPoints || null,

        researchNotes:
          payload.researchNotes || null,

        assignedOwnerId,

        createdById: currentUser.id,
      },
      { transaction }
    );

    await LeadContact.create(
      {
        leadId: lead.id,

        fullName:
          payload.primaryContact.fullName,

        designation:
          payload.primaryContact
            .designation || null,

        email:
          payload.primaryContact.email ||
          null,

        mobile:
          payload.primaryContact.mobile ||
          null,

        whatsapp:
          payload.primaryContact.whatsapp ||
          null,

        contactType:
          payload.primaryContact
            .contactType || "OTHER",

        isPrimary: true,

        createdById: currentUser.id,
      },
      { transaction }
    );

    for (const contact of
      payload.additionalContacts || []) {
      await LeadContact.create(
        {
          leadId: lead.id,
          fullName: contact.fullName,
          designation:
            contact.designation || null,
          email: contact.email || null,
          mobile: contact.mobile || null,
          whatsapp:
            contact.whatsapp || null,
          contactType:
            contact.contactType || "OTHER",
          isPrimary: false,
          createdById: currentUser.id,
        },
        { transaction }
      );
    }

    await audit({
      leadId: lead.id,
      action: "LEAD_CREATED",
      newValue: {
        businessId,
        companyName: lead.companyName,
      },
      changedById: currentUser.id,
      transaction,
    });

    await transaction.commit();

    const createdLead =
      await getLeadById(lead.id);

    return {
      lead: createdLead,
      possibleDuplicates,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const listLeads = async (
  query
) => {
  const page = query.page || 1;
  const limit = query.limit || 20;

  const where = {};

  if (query.search) {
    where[Op.or] = [
      {
        businessId: {
          [Op.iLike]: `%${query.search}%`,
        },
      },

      {
        companyName: {
          [Op.iLike]: `%${query.search}%`,
        },
      },

      {
        sector: {
          [Op.iLike]: `%${query.search}%`,
        },
      },

      {
        city: {
          [Op.iLike]: `%${query.search}%`,
        },
      },
    ];
  }

  if (query.assignedOwnerId) {
    where.assignedOwnerId =
      query.assignedOwnerId;
  }

  if (query.stage) {
    where.stage = query.stage;
  }

  if (query.temperature) {
    where.temperature =
      query.temperature;
  }

  if (query.verificationStatus) {
    where.verificationStatus =
      query.verificationStatus;
  }

  if (query.potentialStatus) {
    where.potentialStatus =
      query.potentialStatus;
  }

  if (query.sector) {
    where.sector = {
      [Op.iLike]: `%${query.sector}%`,
    };
  }

  if (query.country) {
    where.country = {
      [Op.iLike]: `%${query.country}%`,
    };
  }

  if (query.state) {
    where.state = {
      [Op.iLike]: `%${query.state}%`,
    };
  }

  if (query.city) {
    where.city = {
      [Op.iLike]: `%${query.city}%`,
    };
  }

  if (query.leadSource) {
    where.leadSource =
      query.leadSource;
  }

  if (
    query.createdFrom ||
    query.createdTo
  ) {
    where.createdAt = {};

    if (query.createdFrom) {
      where.createdAt[Op.gte] =
        new Date(query.createdFrom);
    }

    if (query.createdTo) {
      where.createdAt[Op.lte] =
        new Date(query.createdTo);
    }
  }

  if (
    query.minBudget !== undefined ||
    query.maxBudget !== undefined
  ) {
    where.estimatedProjectBudget = {};

    if (query.minBudget !== undefined) {
      where.estimatedProjectBudget[
        Op.gte
      ] = query.minBudget;
    }

    if (query.maxBudget !== undefined) {
      where.estimatedProjectBudget[
        Op.lte
      ] = query.maxBudget;
    }
  }

  const result =
    await Lead.findAndCountAll({
      where,

      distinct: true,

      include: [
        {
          model: LeadContact,
          as: "contacts",
          where: {
            isPrimary: true,
          },
          required: false,
        },

        {
          model: User,
          as: "assignedOwner",
          attributes: safeUserAttributes,
        },
      ],

      order: [["createdAt", "DESC"]],

      limit,

      offset: (page - 1) * limit,
    });

  return {
    leads: result.rows,

    pagination: {
      page,
      limit,
      total: result.count,
      totalPages: Math.ceil(
        result.count / limit
      ),
    },
  };
};

export const getLeadById = async (id) => {
  return requireLead(id, {
    include: [
      {
        model: LeadContact,
        as: "contacts",
      },

      {
        model: User,
        as: "assignedOwner",
        attributes: safeUserAttributes,
      },

      {
        model: User,
        as: "creator",
        attributes: safeUserAttributes,
      },

      {
        model: LeadComment,
        as: "comments",
        include: [
          {
            model: User,
            as: "author",
            attributes: safeUserAttributes,
          },
        ],
      },
    ],

    order: [
      [
        { model: LeadComment, as: "comments" },
        "createdAt",
        "DESC",
      ],
    ],
  });
};

export const updateLead = async (
  id,
  payload,
  currentUser
) => {
  const lead =
    await requireLead(id);

  requireLeadEditAccess(
    lead,
    currentUser
  );

  if (
    payload.verificationStatus ===
      "INVALID" &&
    !payload.invalidReason &&
    !lead.invalidReason
  ) {
    const error = new Error(
      "Invalid reason is required"
    );

    error.status = 400;
    throw error;
  }

  const transaction =
    await sequelize.transaction();

  try {
    for (const [
      field,
      newValue,
    ] of Object.entries(payload)) {
      const oldValue = lead.get(field);

      if (
        JSON.stringify(oldValue) ===
        JSON.stringify(newValue)
      ) {
        continue;
      }

      lead.set(field, newValue);

      await audit({
        leadId: lead.id,
        action: "LEAD_UPDATED",
        fieldName: field,
        oldValue,
        newValue,
        changedById: currentUser.id,
        transaction,
      });
    }

    await lead.save({ transaction });

    await transaction.commit();

    return getLeadById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const reassignLead = async (
  id,
  ownerId,
  currentUser
) => {
  const transaction =
    await sequelize.transaction();

  try {
    const lead =
      await requireLead(id, {
        transaction,
      });

    await ensureValidOwner(
      ownerId,
      transaction
    );

    const oldOwnerId =
      lead.assignedOwnerId;

    lead.assignedOwnerId = ownerId;

    await lead.save({ transaction });

    await audit({
      leadId: lead.id,
      action: "LEAD_REASSIGNED",
      fieldName: "assignedOwnerId",
      oldValue: oldOwnerId,
      newValue: ownerId,
      changedById: currentUser.id,
      transaction,
    });

    await transaction.commit();

    return getLeadById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const addLeadContact = async (
  leadId,
  payload,
  currentUser
) => {
  const lead =
    await requireLead(leadId);

  requireLeadEditAccess(
    lead,
    currentUser
  );

  const transaction =
    await sequelize.transaction();

  try {
    if (payload.isPrimary) {
      await LeadContact.update(
        { isPrimary: false },
        {
          where: { leadId },
          transaction,
        }
      );
    }

    const contact =
      await LeadContact.create(
        {
          ...payload,
          leadId,
          isPrimary:
            payload.isPrimary || false,
          createdById: currentUser.id,
        },
        { transaction }
      );

    await audit({
      leadId,
      action: "CONTACT_ADDED",
      newValue: contact.toJSON(),
      changedById: currentUser.id,
      transaction,
    });

    await transaction.commit();

    return contact;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateLeadContact = async (
  leadId,
  contactId,
  payload,
  currentUser
) => {
  const lead =
    await requireLead(leadId);

  requireLeadEditAccess(
    lead,
    currentUser
  );

  const contact =
    await LeadContact.findOne({
      where: {
        id: contactId,
        leadId,
      },
    });

  if (!contact) {
    const error =
      new Error("Contact not found");

    error.status = 404;
    throw error;
  }

  const transaction =
    await sequelize.transaction();

  try {
    if (payload.isPrimary === true) {
      await LeadContact.update(
        { isPrimary: false },
        {
          where: { leadId },
          transaction,
        }
      );
    }

    const oldValue =
      contact.toJSON();

    Object.entries(payload).forEach(
      ([key, value]) => {
        if (
          key === "isPrimary" &&
          value === false &&
          contact.isPrimary
        ) {
          return;
        }

        contact.set(key, value);
      }
    );

    await contact.save({
      transaction,
    });

    await audit({
      leadId,
      action: "CONTACT_UPDATED",
      oldValue,
      newValue: contact.toJSON(),
      changedById: currentUser.id,
      transaction,
    });

    await transaction.commit();

    return contact;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteLeadContact = async (
  leadId,
  contactId,
  currentUser
) => {
  const lead =
    await requireLead(leadId);

  requireLeadEditAccess(
    lead,
    currentUser
  );

  const contact =
    await LeadContact.findOne({
      where: {
        id: contactId,
        leadId,
      },
    });

  if (!contact) {
    const error =
      new Error("Contact not found");

    error.status = 404;
    throw error;
  }

  const transaction =
    await sequelize.transaction();

  try {
    if (contact.isPrimary) {
      const replacement =
        await LeadContact.findOne({
          where: {
            leadId,
            id: {
              [Op.ne]: contactId,
            },
          },
          transaction,
        });

      if (!replacement) {
        const error = new Error(
          "A lead must have at least one primary contact"
        );

        error.status = 400;
        throw error;
      }

      replacement.isPrimary = true;

      await replacement.save({
        transaction,
      });
    }

    await audit({
      leadId,
      action: "CONTACT_DELETED",
      oldValue: contact.toJSON(),
      changedById: currentUser.id,
      transaction,
    });

    await contact.destroy({
      transaction,
    });

    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const addLeadComment = async (
  leadId,
  payload,
  currentUser
) => {
  await requireLead(leadId);

  return LeadComment.create({
    leadId,

    stageContext:
      payload.stageContext || "A",

    comment: payload.comment,

    createdById: currentUser.id,
  });
};

export const listLeadComments = async (
  leadId
) => {
  await requireLead(leadId);

  return LeadComment.findAll({
    where: { leadId },

    include: [
      {
        model: User,
        as: "author",
        attributes: safeUserAttributes,
      },
    ],

    order: [["createdAt", "DESC"]],
  });
};

export const listLeadAudits = async (
  leadId
) => {
  await requireLead(leadId);

  return LeadAudit.findAll({
    where: { leadId },

    include: [
      {
        model: User,
        as: "changedBy",
        attributes: safeUserAttributes,
      },
    ],

    order: [["createdAt", "DESC"]],
  });
};

export const softDeleteLead = async (
  id,
  currentUser
) => {
  const lead =
    await requireLead(id);

  await audit({
    leadId: lead.id,
    action: "LEAD_SOFT_DELETED",
    oldValue: {
      deletedAt: null,
    },
    newValue: {
      deleted: true,
    },
    changedById: currentUser.id,
  });

  await lead.destroy();

  return true;
};

export const restoreLead = async (
  id,
  currentUser
) => {
  const lead =
    await Lead.findByPk(id, {
      paranoid: false,
    });

  if (!lead) {
    const error =
      new Error("Lead not found");

    error.status = 404;
    throw error;
  }

  if (!lead.deletedAt) {
    return getLeadById(id);
  }

  await lead.restore();

  await audit({
    leadId: lead.id,
    action: "LEAD_RESTORED",
    oldValue: {
      deleted: true,
    },
    newValue: {
      deleted: false,
    },
    changedById: currentUser.id,
  });

  return getLeadById(id);
};
