import * as service from "./document.service.js";

export const list = async (
  req,
  res
) => {
  res.json({
    success: true,

    documents:
      await service.listDocuments(
        req.params.leadId
      ),
  });
};

export const createUrl = async (
  req,
  res
) => {
  res.status(201).json({
    success: true,

    document:
      await service.createUrlDocument(
        req.params.leadId,
        req.body,
        req.user
      ),
  });
};

export const uploadFile = async (
  req,
  res
) => {
  res.status(201).json({
    success: true,

    document:
      await service.createFileDocument(
        req.params.leadId,
        req.body,
        req.file,
        req.user
      ),
  });
};

export const remove = async (
  req,
  res
) => {
  await service.deleteDocument(
    req.params.leadId,
    req.params.documentId,
    req.user
  );

  res.json({
    success: true,
    message:
      "Document deleted",
  });
};
