import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";

import {
  dashboard,
} from "./dashboard.controller.js";

const router =
  Router();

router.use(
  authenticate
);

router.get(
  "/",
  dashboard
);

export default router;
