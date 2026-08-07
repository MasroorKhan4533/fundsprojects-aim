import * as service from "./target.service.js";

export const list = async (
  req,
  res
) => {
  res.json({
    success: true,
    targets:
      await service.listTargets(),
  });
};

export const save = async (
  req,
  res
) => {
  res.json({
    success: true,

    target:
      await service.saveTarget(
        req.validated.body,
        req.user
      ),
  });
};

export const remove = async (
  req,
  res
) => {
  await service.deleteTarget(
    req.validated.params.id
  );

  res.json({
    success: true,
  });
};
