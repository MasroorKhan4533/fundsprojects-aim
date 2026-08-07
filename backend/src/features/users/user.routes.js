import { Router } from "express";

import {
  create,
  list,
  resetPassword,
  updateRole,
  updateStatus,
} from "./user.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";

import {
  createUserSchema,
  passwordSchema,
  roleSchema,
  statusSchema,
} from "./user.validation.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", list);

router.post("/", validate(createUserSchema), create);

router.patch(
  "/:id/status",
  validate(statusSchema),
  updateStatus
);

router.patch(
  "/:id/role",
  validate(roleSchema),
  updateRole
);

router.patch(
  "/:id/password",
  validate(passwordSchema),
  resetPassword
);

export default router;
