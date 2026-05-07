export const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFERED",
  "ACCEPTED",
  "OFFER_DECLINED",
  "REJECTED",
  "GHOSTED",
];

export const TERMINAL_APPLICATION_STATUSES = [
  "ACCEPTED",
  "OFFER_DECLINED",
  "REJECTED",
  "GHOSTED",
];

export const isTerminalApplicationStatus = (status) =>
  TERMINAL_APPLICATION_STATUSES.includes(String(status || "").toUpperCase());

export const APPLICATION_STATUS_LABELS = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  OFFERED: "Offered",
  ACCEPTED: "Accepted",
  OFFER_DECLINED: "Offer Declined",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
};

export const getApplicationStatusLabel = (status, fallback = status) =>
  APPLICATION_STATUS_LABELS[String(status || "").toUpperCase()] || fallback;
