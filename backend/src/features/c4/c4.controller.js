import * as service from "./c4.service.js";

/*
  C4 HTTP controller.
*/

export const list = async (req, res) => {
  res.json({
    success: true,
    leads:
      await service.listC4Leads(),
  });
};

export const one = async (req, res) => {
  res.json({
    success: true,
    ...(await service.getC4(
      req.validated.params.leadId
    )),
  });
};

export const save = async (req, res) => {
  res.json({
    success: true,

    closure:
      await service.saveClosure(
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
      await service.setC4Outcome(
        req.validated.params.leadId,
        req.validated.body,
        req.user
      ),
  });
};
