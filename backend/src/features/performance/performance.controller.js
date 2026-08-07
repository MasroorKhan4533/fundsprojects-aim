import {
  getPerformance,
} from "./performance.service.js";

export const list = async (
  req,
  res
) => {
  res.json({
    success: true,

    performance:
      await getPerformance(),
  });
};
