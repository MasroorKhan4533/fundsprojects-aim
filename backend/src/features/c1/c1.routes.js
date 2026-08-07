import { Router } from "express";

import * as controller from "./c1.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";

import {
  activitySchema,
  followUpSchema,
  followUpUpdateSchema,
  leadIdSchema,
  outcomeSchema,
  profileSchema,
  reopenSchema,
} from "./c1.validation.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  controller.list
);

router.get(
  "/:leadId",
  validate(leadIdSchema),
  controller.summary
);

router.put(
  "/:leadId/profile",
  validate(profileSchema),
  controller.profile
);

router.post(
  "/:leadId/activities",
  validate(activitySchema),
  controller.activity
);

router.post(
  "/:leadId/follow-ups",
  validate(followUpSchema),
  controller.followUp
);

router.patch(
  "/:leadId/follow-ups/:followUpId",
  validate(
    followUpUpdateSchema
  ),
  controller.updateFollowUp
);

router.post(
  "/:leadId/outcome",
  validate(outcomeSchema),
  controller.outcome
);

router.post(
  "/:leadId/reopen",
  authorize("ADMIN"),
  validate(reopenSchema),
  controller.reopen
);

router.get(
  "/:leadId/timeline/all",
  validate(leadIdSchema),
  controller.timeline
);

export default router;
