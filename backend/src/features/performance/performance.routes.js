import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";

import {
  list,
} from "./performance.controller.js";

const router =
  Router();

router.use(
  authenticate
);

router.get(
  "/",
  list
);

export default router;
