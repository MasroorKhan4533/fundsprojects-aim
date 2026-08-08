import { Router } from "express";
import { asyncHandler } from "../../core/http/async-handler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { createTargetController, deleteTargetController, listTargetsController, updateTargetController } from "./target.controller.js";
import { createTargetSchema, listTargetsSchema, targetIdSchema, updateTargetSchema } from "./target.validation.js";

const router = Router();
router.use(authenticate);
router.get("/", validate(listTargetsSchema), asyncHandler(listTargetsController));
router.post("/", authorize("ADMIN"), validate(createTargetSchema), asyncHandler(createTargetController));
router.put("/:id", authorize("ADMIN"), validate(updateTargetSchema), asyncHandler(updateTargetController));
router.delete("/:id", authorize("ADMIN"), validate(targetIdSchema), asyncHandler(deleteTargetController));
export default router;
