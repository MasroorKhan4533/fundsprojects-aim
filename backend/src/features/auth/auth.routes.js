import { Router } from "express";
import { asyncHandler } from "../../core/http/async-handler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import {
  activateController,
  forgotPasswordController,
  loginController,
  logoutAllController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resetPasswordController,
} from "./auth.controller.js";
import { loginRateLimit, passwordRateLimit, registrationRateLimit } from "./auth.rate-limits.js";
import {
  activationSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", registrationRateLimit, validate(registerSchema), asyncHandler(registerController));
router.post("/login", loginRateLimit, validate(loginSchema), asyncHandler(loginController));
router.post("/refresh", validate(refreshSchema), asyncHandler(refreshController));
router.post("/activate", passwordRateLimit, validate(activationSchema), asyncHandler(activateController));
router.post("/forgot-password", passwordRateLimit, validate(forgotPasswordSchema), asyncHandler(forgotPasswordController));
router.post("/reset-password", passwordRateLimit, validate(resetPasswordSchema), asyncHandler(resetPasswordController));
router.get("/me", authenticate, asyncHandler(meController));
router.post("/logout", validate(logoutSchema), asyncHandler(logoutController));
router.post("/logout-all", authenticate, asyncHandler(logoutAllController));

export default router;
