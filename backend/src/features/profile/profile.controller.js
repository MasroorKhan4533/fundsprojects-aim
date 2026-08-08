import { sendSuccess } from "../../core/http/response.js";
import { getMyProfile } from "./profile.service.js";

export const getMyProfileController = async (req, res) => sendSuccess(res, {
  data: { profile: await getMyProfile(req.user) },
});
