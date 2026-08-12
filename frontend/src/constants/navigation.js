export const WORKSPACE_NAV_ITEMS = [
  {
    key: "aim-master",
    label: "AIM Master",
    shortLabel: "AIM",
    to: "/app/aim-master",
    icon: "dashboard",
    title: "AIM Master Dashboard",
    subtitle: "A single operational view from lead entry to customer closure.",
  },
  {
    key: "targets",
    label: "Target Sheet",
    shortLabel: "Targets",
    to: "/app/targets",
    icon: "target",
    title: "Target Sheet",
    subtitle: "Date-wise CTA, stage and revenue targets with actual achievement.",
  },
  {
    key: "a-master-leads",
    label: "A — Master Leads",
    shortLabel: "A",
    to: "/app/a-master-leads",
    icon: "building",
    title: "A — Master Lead Data",
    subtitle: "Capture each company once and store it as the permanent lead directory.",
  },
  {
    key: "i-c1-c2",
    label: "I — C1 & C2",
    shortLabel: "I",
    to: "/app/i-c1-c2",
    icon: "message",
    title: "I — C1 & C2 Interaction",
    subtitle: "Work directly from the lead table with email, WhatsApp, call, C1 and C2 actions.",
  },
  {
    key: "m-c3-c4",
    label: "M — C3 & C4",
    shortLabel: "M",
    to: "/app/m-c3-c4",
    icon: "deal",
    title: "M — C3 & C4 Closure",
    subtitle: "Work directly from qualified leads with solution, proposal, negotiation and closure actions.",
  },
  {
    key: "profile",
    label: "My Profile",
    shortLabel: "Profile",
    to: "/app/profile",
    icon: "user",
    title: "My Profile",
    subtitle: "Personal performance, targets, pipeline, commission and upcoming work.",
  },
];

export const ADMIN_NAV_ITEMS = [
  {
    key: "user-management",
    label: "User Management",
    to: "/app/admin/users",
    icon: "users",
    title: "User Management",
    subtitle: "Review registration requests, manage roles and secure account access.",
  },
];

export const getNavigationMeta = (pathname) => {
  const items = [...WORKSPACE_NAV_ITEMS, ...ADMIN_NAV_ITEMS];
  return items.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)) ?? WORKSPACE_NAV_ITEMS[0];
};
