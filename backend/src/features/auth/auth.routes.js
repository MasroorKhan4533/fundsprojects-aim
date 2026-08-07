import { Router } from "express";

import { login, logout, me } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, me);

router.post("/logout", authenticate, logout);

export default router;
