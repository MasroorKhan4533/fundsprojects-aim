import crypto from "crypto";
import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    cb(
      null,
      `${crypto.randomUUID()}${extension}`
    );
  },
});

export const upload = multer({
  storage,

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },
});
