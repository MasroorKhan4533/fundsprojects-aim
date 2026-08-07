import * as service from "./c2.service.js";

/*
  C2 HTTP controller.
*/

export const list = async (req, res) => {
  res.json({
    success: true,
    leads:
      await service.listC2Leads(),
  });
};

export const one = async (req, res) => {
  res.json({
    success: true,
    ...(await service.getC2(
      req.validated.params.leadId
    )),
  });
};

export const save = async (req, res) => {
  res.json({
    success: true,

    profile:
      await service.saveC2(
        req.validated.params.leadId,
        req.validated.body,
        req.user
      ),
  });
};

export const outcome = async (req, res) => {
  res.json({
    success: true,

    lead:
      await service.setC2Outcome(
        req.validated.params.leadId,
        req.validated.body,
        req.user
      ),
  });
};
