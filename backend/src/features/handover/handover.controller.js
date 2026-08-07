import * as service from "./handover.service.js";

export const list = async (
  req,
  res
) => {
  res.json({
    success: true,

    handovers:
      await service.listHandovers(),
  });
};

export const create = async (
  req,
  res
) => {
  res.status(201).json({
    success: true,

    handover:
      await service.createHandover(
        req.validated.params.leadId,
        req.user
      ),
  });
};

export const update = async (
  req,
  res
) => {
  res.json({
    success: true,

    handover:
      await service.updateHandover(
        req.validated.params.id,
        req.validated.body,
        req.user
      ),
  });
};
