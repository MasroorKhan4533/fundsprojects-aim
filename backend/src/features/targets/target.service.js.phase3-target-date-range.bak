import mongoose from "mongoose";
import { AppError } from "../../core/errors/app-error.js";
import { recordAudit } from "../audit/audit.service.js";
import User from "../users/user.model.js";
import Target from "./target.model.js";

const METRIC_KEYS = ["leads", "emails", "messages", "calls", "meetings", "c1", "c2", "c3", "c4", "proposals", "revenue"];

const safeTarget = (target) => ({
  id: String(target._id),
  targetDate: target.targetDate,
  assignedTo: target.assignedTo && typeof target.assignedTo === "object" ? {
    id: String(target.assignedTo._id),
    userId: target.assignedTo.userId,
    fullName: target.assignedTo.fullName,
    email: target.assignedTo.email,
  } : { id: String(target.assignedTo) },
  focusStage: target.focusStage,
  metrics: Object.fromEntries(METRIC_KEYS.map((key) => [key, Number(target.metrics?.[key] || 0)])),
  notes: target.notes || "",
  createdAt: target.createdAt,
  updatedAt: target.updatedAt,
});

const assertActiveAssignee = async (userId) => {
  const user = await User.findOne({ _id: userId, status: "ACTIVE" });
  if (!user) throw new AppError("Target assignee must be an active user", { statusCode: 422, code: "TARGET_ASSIGNEE_INVALID" });
  return user;
};

const applyVisibility = (filter, actor) => {
  if (actor.role !== "ADMIN") filter.assignedTo = actor._id;
  return filter;
};

export const listTargets = async (query, actor) => {
  const filter = {};
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.focusStage) filter.focusStage = query.focusStage;
  if (query.dateFrom || query.dateTo) {
    filter.targetDate = {};
    if (query.dateFrom) filter.targetDate.$gte = query.dateFrom;
    if (query.dateTo) filter.targetDate.$lte = query.dateTo;
  }
  applyVisibility(filter, actor);

  const [items, total] = await Promise.all([
    Target.find(filter).populate("assignedTo", "userId fullName email").sort({ targetDate: -1, createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit),
    Target.countDocuments(filter),
  ]);

  return { items: items.map(safeTarget), meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
};

export const createTarget = async (body, actor, context) => {
  await assertActiveAssignee(body.assignedTo);
  if (actor.role !== "ADMIN" && String(actor._id) !== body.assignedTo) {
    throw new AppError("You can only create a target for yourself", { statusCode: 403, code: "TARGET_ASSIGNMENT_FORBIDDEN" });
  }
  try {
    const target = await Target.create({ ...body, createdBy: actor._id, updatedBy: actor._id });
    await recordAudit({ action: "TARGET.CREATED", actorUserId: actor._id, targetUserId: body.assignedTo, context, metadata: { targetId: String(target._id), targetDate: body.targetDate, focusStage: body.focusStage } });
    await target.populate("assignedTo", "userId fullName email");
    return safeTarget(target);
  } catch (error) {
    if (error?.code === 11000) throw new AppError("A target already exists for this user, date and focus stage", { statusCode: 409, code: "TARGET_DUPLICATE" });
    throw error;
  }
};

export const updateTarget = async (id, body, actor, context) => {
  const target = await Target.findById(id);
  if (!target) throw new AppError("Target not found", { statusCode: 404, code: "TARGET_NOT_FOUND" });
  if (actor.role !== "ADMIN" && String(target.assignedTo) !== String(actor._id)) {
    throw new AppError("You cannot edit this target", { statusCode: 403, code: "TARGET_EDIT_FORBIDDEN" });
  }
  await assertActiveAssignee(body.assignedTo);
  if (actor.role !== "ADMIN" && String(actor._id) !== body.assignedTo) {
    throw new AppError("You cannot reassign this target", { statusCode: 403, code: "TARGET_REASSIGN_FORBIDDEN" });
  }
  Object.assign(target, body, { updatedBy: actor._id });
  try {
    await target.save();
  } catch (error) {
    if (error?.code === 11000) throw new AppError("A target already exists for this user, date and focus stage", { statusCode: 409, code: "TARGET_DUPLICATE" });
    throw error;
  }
  await recordAudit({ action: "TARGET.UPDATED", actorUserId: actor._id, targetUserId: body.assignedTo, context, metadata: { targetId: id } });
  await target.populate("assignedTo", "userId fullName email");
  return safeTarget(target);
};

export const deleteTarget = async (id, actor, context) => {
  const target = await Target.findById(id);
  if (!target) throw new AppError("Target not found", { statusCode: 404, code: "TARGET_NOT_FOUND" });
  if (actor.role !== "ADMIN" && String(target.assignedTo) !== String(actor._id)) {
    throw new AppError("You cannot delete this target", { statusCode: 403, code: "TARGET_DELETE_FORBIDDEN" });
  }
  await target.deleteOne();
  await recordAudit({ action: "TARGET.DELETED", actorUserId: actor._id, targetUserId: target.assignedTo, context, metadata: { targetId: id } });
};

export const aggregateTargets = async ({ assignedTo, dateFrom, dateTo } = {}, actor) => {
  const match = {};
  if (assignedTo) match.assignedTo = new mongoose.Types.ObjectId(assignedTo);
  if (dateFrom || dateTo) {
    match.targetDate = {};
    if (dateFrom) match.targetDate.$gte = dateFrom;
    if (dateTo) match.targetDate.$lte = dateTo;
  }
  if (actor.role !== "ADMIN") match.assignedTo = new mongoose.Types.ObjectId(actor._id);

  const sums = Object.fromEntries(METRIC_KEYS.map((key) => [key, { $sum: `$metrics.${key}` }]));
  const [row] = await Target.aggregate([{ $match: match }, { $group: { _id: null, count: { $sum: 1 }, ...sums } }]);
  return { count: row?.count || 0, ...Object.fromEntries(METRIC_KEYS.map((key) => [key, row?.[key] || 0])) };
};
