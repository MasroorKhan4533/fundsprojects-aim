import { Router } from "express";

import {
  addComment,
  addContact,
  assign,
  audits,
  checkDuplicates,
  comments,
  create,
  deleteContact,
  getOne,
  list,
  remove,
  restore,
  update,
  updateContact,
} from "./lead.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";

import {
  addContactSchema,
  assignLeadSchema,
  commentSchema,
  contactIdSchema,
  createLeadSchema,
  duplicateCheckSchema,
  leadIdSchema,
  listLeadSchema,
  updateContactSchema,
  updateLeadSchema,
} from "./lead.validation.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(listLeadSchema),
  list
);

router.post(
  "/",
  validate(createLeadSchema),
  create
);

router.post(
  "/check-duplicates",
  validate(duplicateCheckSchema),
  checkDuplicates
);

router.get(
  "/:id",
  validate(leadIdSchema),
  getOne
);

router.patch(
  "/:id",
  validate(updateLeadSchema),
  update
);

router.patch(
  "/:id/assign",
  authorize("ADMIN"),
  validate(assignLeadSchema),
  assign
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(leadIdSchema),
  remove
);

router.post(
  "/:id/restore",
  authorize("ADMIN"),
  validate(leadIdSchema),
  restore
);

router.post(
  "/:id/contacts",
  validate(addContactSchema),
  addContact
);

router.patch(
  "/:id/contacts/:contactId",
  validate(updateContactSchema),
  updateContact
);

router.delete(
  "/:id/contacts/:contactId",
  validate(contactIdSchema),
  deleteContact
);

router.post(
  "/:id/comments",
  validate(commentSchema),
  addComment
);

router.get(
  "/:id/comments",
  validate(leadIdSchema),
  comments
);

router.get(
  "/:id/audits",
  authorize("ADMIN"),
  validate(leadIdSchema),
  audits
);

export default router;
