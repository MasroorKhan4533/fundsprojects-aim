import fs from "fs/promises";
import path from "path";

import Document from "./document.model.js";

import {
  requireLead,
  requireLeadEditAccess,
} from "../leads/lead.service.js";

export const listDocuments =
  async (leadId) => {
    await requireLead(leadId);

    return Document.findAll({
      where: {
        leadId,
      },

      order: [
        [
          "createdAt",
          "DESC",
        ],
      ],
    });
  };

export const createUrlDocument =
  async (
    leadId,
    payload,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    return Document.create({
      leadId,

      stageContext:
        payload.stageContext ||
        "C1",

      documentType:
        payload.documentType ||
        "OTHER",

      title:
        payload.title,

      storageType:
        "URL",

      externalUrl:
        payload.externalUrl,

      uploadedById:
        currentUser.id,
    });
  };

export const createFileDocument =
  async (
    leadId,
    payload,
    file,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    if (!file) {
      const error =
        new Error(
          "File is required"
        );

      error.status = 400;

      throw error;
    }

    return Document.create({
      leadId,

      stageContext:
        payload.stageContext ||
        "C1",

      documentType:
        payload.documentType ||
        "OTHER",

      title:
        payload.title ||
        file.originalname,

      storageType:
        "LOCAL",

      filePath:
        `/uploads/${file.filename}`,

      originalName:
        file.originalname,

      mimeType:
        file.mimetype,

      fileSize:
        file.size,

      uploadedById:
        currentUser.id,
    });
  };

export const deleteDocument =
  async (
    leadId,
    documentId,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    const document =
      await Document.findOne({
        where: {
          id: documentId,
          leadId,
        },
      });

    if (!document) {
      const error =
        new Error(
          "Document not found"
        );

      error.status = 404;

      throw error;
    }

    if (
      document.storageType ===
        "LOCAL" &&
      document.filePath
    ) {
      const localPath =
        path.resolve(
          document.filePath.replace(
            /^\//,
            ""
          )
        );

      await fs
        .unlink(localPath)
        .catch(() => {});
    }

    await document.destroy();
  };
