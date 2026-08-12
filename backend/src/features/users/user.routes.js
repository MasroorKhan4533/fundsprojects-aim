import { Router } from "express";
import { asyncHandler } from "../../core/http/async-handler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import {
  changeRoleController,
  changeStatusController,
  listUsersController,
  resendActivationController,
  reviewRegistrationController,
  sendPasswordResetController,
} from "./user.controller.js";
import { approvalSchema, listUsersSchema, roleSchema, statusSchema, userIdParamSchema } from "./user.validation.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/", validate(listUsersSchema), asyncHandler(listUsersController));
router.patch("/:id/approval", validate(approvalSchema), asyncHandler(reviewRegistrationController));
router.post("/:id/resend-activation", validate(userIdParamSchema), asyncHandler(resendActivationController));
router.post("/:id/send-password-reset", validate(userIdParamSchema), asyncHandler(sendPasswordResetController));
router.patch("/:id/role", validate(roleSchema), asyncHandler(changeRoleController));
router.patch("/:id/status", validate(statusSchema), asyncHandler(changeStatusController));

export default router;
