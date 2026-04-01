import type { Request, Response } from "express";
import { Router } from "express";
import { createMatchSchema, listMatchesSchema } from "../validation/matches";
import { db } from "../db/db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";
import { desc } from "drizzle-orm";

export const matchRouter = Router()

matchRouter.get('/', async (req: Request, res: Response) => {
  const { data, success, error } = listMatchesSchema.safeParse(req.body)
  const MAX_LIMIT = 100;

  if (!success) {
    res.status(400).json({ error: 'Invalid payload', detail: JSON.stringify(error) })
  }

  const limit = Math.min(data?.limit ?? 50, MAX_LIMIT)
  try {
    const list = await db
      .select()
      .from(matches)
      .orderBy((desc(matches.createdAt)))
      .limit(limit)

    res.status(201).json({ data: list })
  } catch (e) {
    res.status(500).json({ error: 'Failed to list matches', detail: JSON.stringify(e) })
  }
})


matchRouter.post('/', async (req: Request, res: Response) => {
  const { data, success, error } = createMatchSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({ error: 'Invalid payload', detail: JSON.stringify(error) })
  }

  const { startTime, endTime, homeScore, awayScore } = data;
  const matchStatus = getMatchStatus(startTime, endTime);

  if (!matchStatus) {
    return res.status(400).json({ error: 'Invalid Time' })
  }

  try {
    const [match] = await db
      .insert(matches)
      .values({
        ...data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: matchStatus,
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
      })
      .returning()

    //if there's match created the broadcast will happen in which we share the match with every connected client
    if (req.app.locals.broadcastMatchCreated) {
      req.app.locals.broadcastMatchCreated(match)
    }

    res.status(201).json({ data: match })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create match', detail: JSON.stringify(e) })
  }
})
