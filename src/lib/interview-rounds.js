const getRound = (interview) => Number(interview?.round) || 0;

const getTime = (interview) => {
  const time = new Date(
    interview?.updatedAt || interview?.scheduledAt || interview?.createdAt,
  ).getTime();

  return Number.isFinite(time) ? time : 0;
};

export const getLatestInterview = (interviews = []) => {
  if (!interviews.length) return null;

  const latestRound = interviews.reduce(
    (maxRound, interview) => Math.max(maxRound, getRound(interview)),
    0,
  );
  const latestRoundInterviews = interviews.filter(
    (interview) => getRound(interview) === latestRound,
  );
  const nonCancelledInterviews = latestRoundInterviews.filter(
    (interview) => interview?.status !== "CANCELLED",
  );
  const candidates = nonCancelledInterviews.length
    ? nonCancelledInterviews
    : latestRoundInterviews;

  return candidates.reduce((latest, interview) => {
    if (!latest) return interview;
    return getTime(interview) >= getTime(latest) ? interview : latest;
  }, null);
};

export const getNextRound = (interviews = []) => {
  const latest = getLatestInterview(interviews);
  const latestRound = Number(latest?.round) || 0;

  if (!latest) return 1;
  if (latest.status === "CANCELLED") return latestRound || 1;
  if (latest.status === "COMPLETED" && latest.result === "PASSED") {
    return latestRound + 1;
  }

  return (
    interviews.reduce(
      (maxRound, interview) =>
        Math.max(maxRound, Number(interview?.round) || 0),
      0,
    ) + 1
  );
};

export const getAddRoundLabel = (interviews = []) => {
  if (interviews.length === 0) return "Add Round 1";

  const nextRound = getNextRound(interviews);
  return nextRound ? `Add Round ${nextRound}` : "Add next round";
};
