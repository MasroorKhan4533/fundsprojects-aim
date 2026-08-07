import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";

import * as controller from "./handover.controller.js";

import {
  leadSchema,
  updateSchema,
} from "./handover.validation.js";

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
  "/from-lead/:leadId",
  validate(leadSchema),
  controller.create
);

router.patch(
  "/:id",
  validate(updateSchema),
  controller.update
);

export default router;
