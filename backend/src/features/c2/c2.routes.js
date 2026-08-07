import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";

import * as controller from "./c2.controller.js";

import {
  c2OutcomeSchema,
  c2ProfileSchema,
  leadIdSchema,
} from "./c2.validation.js";

/*
  C2 API routes.
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
  validate(c2ProfileSchema),
  controller.save
);

router.post(
  "/:leadId/outcome",
  validate(c2OutcomeSchema),
  controller.outcome
);

export default router;
