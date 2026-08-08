import { Router } from "express";
import { asyncHandler } from "../../core/http/async-handler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { getMyProfileController } from "./profile.controller.js";

const router = Router();
router.use(authenticate);
router.get("/me", asyncHandler(getMyProfileController));
export default router;
