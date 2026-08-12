export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const normalizeMobile = (value) => {
  const raw = String(value || "").trim();
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  return `${hasPlus ? "+" : ""}${digits}`;
};

export const normalizeUserId = (value) => String(value || "").trim().toUpperCase();

export const isEmailLike = (value) => String(value || "").includes("@");
export const isMobileLike = (value) => /^\+?[0-9\s()-]{8,20}$/.test(String(value || "").trim());
