import * as service from "./c1.service.js";

export const list = async (
  req,
  res
) => {
  res.json({
    success: true,
    leads:
      await service.listC1Leads(),
  });
};

export const summary = async (
  req,
  res
) => {
  res.json({
    success: true,
    ...(await service.getSummary(
      req.validated.params
        .leadId
    )),
  });
};

export const profile = async (
  req,
  res
) => {
  res.json({
    success: true,

    profile:
      await service.saveProfile(
        req.validated.params
          .leadId,

        req.validated.body,

        req.user
      ),
  });
};

export const activity = async (
  req,
  res
) => {
  res.status(201).json({
    success: true,

    activity:
      await service.createActivity(
        req.validated.params
          .leadId,

        req.validated.body,

        req.user
      ),
  });
};

export const followUp = async (
  req,
  res
) => {
  res.status(201).json({
    success: true,

    followUp:
      await service.createFollowUp(
        req.validated.params
          .leadId,

        req.validated.body,

        req.user
      ),
  });
};

export const updateFollowUp =
  async (
    req,
    res
  ) => {
    res.json({
      success: true,

      followUp:
        await service.updateFollowUp(
          req.validated.params
            .leadId,

          req.validated.params
            .followUpId,

          req.validated.body,

          req.user
        ),
    });
  };

export const outcome = async (
  req,
  res
) => {
  res.json({
    success: true,

    lead:
      await service.setOutcome(
        req.validated.params
          .leadId,

        req.validated.body,

        req.user
      ),
  });
};

export const reopen = async (
  req,
  res
) => {
  res.json({
    success: true,

    lead:
      await service.reopenC1(
        req.validated.params
          .leadId,

        req.validated.body
          .reason,

        req.user
      ),
  });
};

export const timeline = async (
  req,
  res
) => {
  res.json({
    success: true,

    timeline:
      await service.getTimeline(
        req.validated.params
          .leadId
      ),
  });
};
