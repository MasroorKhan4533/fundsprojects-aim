import {
  addLeadComment,
  addLeadContact,
  checkLeadDuplicates,
  createLead,
  deleteLeadContact,
  getLeadById,
  listLeadAudits,
  listLeadComments,
  listLeads,
  reassignLead,
  restoreLead,
  softDeleteLead,
  updateLead,
  updateLeadContact,
} from "./lead.service.js";

export const create = async (req, res) => {
  const result = await createLead(
    req.validated.body,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    ...result,
  });
};

export const list = async (req, res) => {
  const result = await listLeads(
    req.validated.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getOne = async (req, res) => {
  const lead = await getLeadById(
    req.validated.params.id
  );

  res.status(200).json({
    success: true,
    lead,
  });
};

export const update = async (req, res) => {
  const lead = await updateLead(
    req.validated.params.id,
    req.validated.body,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    lead,
  });
};

export const checkDuplicates = async (
  req,
  res
) => {
  const possibleDuplicates =
    await checkLeadDuplicates(
      req.validated.body
    );

  res.status(200).json({
    success: true,
    possibleDuplicates,
  });
};

export const assign = async (req, res) => {
  const lead = await reassignLead(
    req.validated.params.id,
    req.validated.body.assignedOwnerId,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Lead reassigned successfully",
    lead,
  });
};

export const addContact = async (
  req,
  res
) => {
  const contact =
    await addLeadContact(
      req.validated.params.id,
      req.validated.body,
      req.user
    );

  res.status(201).json({
    success: true,
    message: "Contact added successfully",
    contact,
  });
};

export const updateContact = async (
  req,
  res
) => {
  const contact =
    await updateLeadContact(
      req.validated.params.id,
      req.validated.params.contactId,
      req.validated.body,
      req.user
    );

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    contact,
  });
};

export const deleteContact = async (
  req,
  res
) => {
  await deleteLeadContact(
    req.validated.params.id,
    req.validated.params.contactId,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
};

export const addComment = async (
  req,
  res
) => {
  const comment =
    await addLeadComment(
      req.validated.params.id,
      req.validated.body,
      req.user
    );

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    comment,
  });
};

export const comments = async (
  req,
  res
) => {
  const data =
    await listLeadComments(
      req.validated.params.id
    );

  res.status(200).json({
    success: true,
    comments: data,
  });
};

export const audits = async (
  req,
  res
) => {
  const data =
    await listLeadAudits(
      req.validated.params.id
    );

  res.status(200).json({
    success: true,
    audits: data,
  });
};

export const remove = async (
  req,
  res
) => {
  await softDeleteLead(
    req.validated.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Lead deleted successfully",
  });
};

export const restore = async (
  req,
  res
) => {
  const lead = await restoreLead(
    req.validated.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Lead restored successfully",
    lead,
  });
};
