import {
  getDashboard,
} from "./dashboard.service.js";

export const dashboard = async (
  req,
  res
) => {
  res.json({
    success: true,

    dashboard:
      await getDashboard(),
  });
};
