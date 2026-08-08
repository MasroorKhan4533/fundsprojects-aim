import AuditLog from "./audit-log.model.js";
import { logger } from "../../utils/logger.js";

export const recordAudit = async ({ action, actorUserId = null, targetUserId = null, context = {}, metadata = {} }) => {
  try {
    await AuditLog.create({
      action,
      actorUserId,
      targetUserId,
      requestId: context.requestId || "",
      ip: context.ip || "",
      userAgent: context.userAgent || "",
      metadata,
    });
  } catch (error) {
    logger.error({ err: error, action, targetUserId }, "Failed to persist security audit event");
  }
};
