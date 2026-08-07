import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { upload } from "../../middlewares/upload.js";

import * as controller from "./document.controller.js";

const router = Router({
  mergeParams: true,
});

router.use(authenticate);

router.get(
  "/",
  controller.list
);

router.post(
  "/url",
  controller.createUrl
);

router.post(
  "/upload",
  upload.single("file"),
  controller.uploadFile
);

router.delete(
  "/:documentId",
  controller.remove
);

export default router;
