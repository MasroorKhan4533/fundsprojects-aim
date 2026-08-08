import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";

const DUMMY_HASH = bcrypt.hashSync("FundsProjects-Dummy-Password-Only", env.auth.bcryptRounds);

export const hashPassword = (password) => bcrypt.hash(password, env.auth.bcryptRounds);
export const verifyPassword = (password, passwordHash) => bcrypt.compare(password, passwordHash || DUMMY_HASH);
