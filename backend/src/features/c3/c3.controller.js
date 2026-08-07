import * as service from "./c3.service.js";

/*
  C3 HTTP controller.
*/

export const list = async (req, res) => {
  res.json({
    success: true,
    leads:
      await service.listC3Leads(),
  });
};

export const one = async (req, res) => {
  res.json({
    success: true,
    ...(await service.getC3(
      req.validated.params.leadId
    )),
  });
};

export const solution = async (req, res) => {
  res.json({
    success: true,

    solution:
      await service.saveSolution(
        req.validated.params.leadId,
        req.validated.body,
        req.user
      ),
  });
};

export const commercial = async (req, res) => {
  res.json({
    success: true,

    commercial:
      await service.saveCommercial(
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
      await service.setC3Outcome(
        req.validated.params.leadId,
        req.validated.body,
        req.user
      ),
  });
};
