import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";

import * as controller from "./target.controller.js";

import {
  targetIdSchema,
  targetSchema,
} from "./target.validation.js";

const router =
  Router();

router.use(
  authenticate
);

router.get(
  "/",
  controller.list
);

router.post(
  "/",
  authorize("ADMIN"),
  validate(targetSchema),
  controller.save
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(targetIdSchema),
  controller.remove
);

export default router;
