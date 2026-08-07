import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";

import * as controller from "./c3.controller.js";

import {
  c3OutcomeSchema,
  commercialSchema,
  leadIdSchema,
  solutionSchema,
} from "./c3.validation.js";

/*
  C3 API routes.
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

router.post(
  "/:leadId/solutions",
  validate(solutionSchema),
  controller.solution
);

router.put(
  "/:leadId/commercial",
  validate(commercialSchema),
  controller.commercial
);

router.post(
  "/:leadId/outcome",
  validate(c3OutcomeSchema),
  controller.outcome
);

export default router;
