import { Router } from "express";
import { createCommentarySchema, listCommentaryQuerySchema, matchIdParamsSchema } from "../validation/commentary";
import { db } from "../db/db";
import { commentary } from "../db/schema";
import { desc, eq } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true })

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
  const paramsResult = matchIdParamsSchema.safeParse(req.params)
  if (!paramsResult.success) {
    return res.status(400).json({ error: 'Invalid match ID', details: paramsResult.error.issues })
  }

  const queryResult = listCommentaryQuerySchema.safeParse(req.query)
  if (!queryResult.success) {
    return res.status(400).json({ error: 'Invalid query parameters', details: queryResult.error.issues })
  }

  try {
    const { id: matchId } = paramsResult.data
    const { limit = 10 } = queryResult.data

    const safeLimit = Math.min(limit, MAX_LIMIT)

    const results = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(safeLimit)

    res.status(200).json({ data: results });
  } catch (err) {
    console.log('Failed to list commentary:', err)
    res.status(500).json({ error: 'Failed to list commentary.', details: err })
  }
})

commentaryRouter.post('/', async (req, res) => {
  const paramsResult = matchIdParamsSchema.safeParse(req.params)
  if (!paramsResult.success) {
    return res.status(400).json({ error: 'Invalid match ID.', details: paramsResult.error.issues })
  }

  const bodyResult = createCommentarySchema.safeParse(req.body)
  if (!bodyResult.success) {
    return res.status(400).json({ error: 'Invalid commentary payload.', details: bodyResult.error.issues })
  }

  const { ...rest } = bodyResult.data
  try {
    const [matchCommentary] = await db
      .insert(commentary)
      .values({
        matchId: paramsResult.data.id,
        ...rest
      }).returning()

    const broadcastCommentary = req.app.locals.broadcastCommentary
    broadcastCommentary && broadcastCommentary(matchCommentary?.matchId, matchCommentary)

    res.status(201).json({ data: matchCommentary })
  } catch (err) {
    console.log('Failed to create commentary:', err)
    res.status(500).json({ error: 'Failed to create commentary.', details: err })
  }
})
