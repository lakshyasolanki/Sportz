import { MATCH_STATUS } from "../types/types";

export const getMatchStatus = (startTime: Date, endTime: Date, now = new Date()): MATCH_STATUS | null => {
  // const start = new Date(startTime);
  // const end = new Date(endTime)

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return null;
  }

  if (startTime > now) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (endTime <= now) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}
