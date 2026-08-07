import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";

import * as controller from "./c4.controller.js";

import {
  c4OutcomeSchema,
  closureSchema,
  leadIdSchema,
} from "./c4.validation.js";

/*
  C4 API routes.
*/

const router = Router();

router.use(authenticate);

router.get(
  "/",
  controller.list
);

router.get(
  "/:leadId",
  validate(leadIdSchema),
  controller.one
);

router.put(
  "/:leadId",
  validate(closureSchema),
  controller.save
);

router.post(
  "/:leadId/outcome",
  validate(c4OutcomeSchema),
  controller.outcome
);

export default router;
