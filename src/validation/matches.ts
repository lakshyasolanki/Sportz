import z from "zod";

// const isoDateString = z
//   .string()
//   .refine((val) => !isNaN(Date.parse(val)), {
//     message: "Invalid ISO date string"
//   })
//   .transform((val) => new Date(val));
export const createMatchSchema = z.object({
  sport: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional()
})

export const listMatchesSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional()
})

