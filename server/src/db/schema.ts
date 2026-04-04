import { pgTable, serial, text, integer, timestamp, pgEnum, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: varchar('sport', { length: 50 }).notNull(),
  homeTeam: varchar('home_team', { length: 100 }).notNull(),
  awayTeam: varchar('away_team', { length: 100 }).notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .references(() => matches.id, { onDelete: 'cascade' })
    .notNull(),
  minute: integer('minute'),
  sequence: integer('sequence').notNull(), // To ensure correct ordering within a minute
  period: varchar('period', { length: 50 }), // e.g., '1st Half', 'Q1'
  eventType: varchar('event_type', { length: 50 }).notNull(), // e.g., 'goal', 'card', 'substitution'
  actor: varchar('actor', { length: 100 }), // The player/person involved
  team: varchar('team', { length: 100 }), // The team the event is for
  message: text('message').notNull(),
  metadata: jsonb('metadata'), // Flexible storage for event-specific data (e.g., coordinates, sub names)
  tags: text('tags').array(), // Searchable tags
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// /**
//  * RELATIONS (Drizzle-level abstractions)
//  */
// export const matchesRelations = relations(matches, ({ many }) => ({
//   commentaries: many(commentary),
// }));
//
// export const commentaryRelations = relations(commentary, ({ one }) => ({
//   match: one(matches, {
//     fields: [commentary.matchId],
//     references: [matches.id],
//   }),
// }));
//
/**
 * TYPES
 */
export type Match = typeof matches.$inferSelect;
export type Commentary = typeof commentary.$inferSelect;
// export type NewMatch = typeof matches.$inferInsert;
// export type NewCommentary = typeof commentary.$inferInsert;
