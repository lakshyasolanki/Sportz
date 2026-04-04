import 'ws'
import type { Commentary, Match } from '../db/schema';
declare module 'ws' {
  interface WebSocket {
    isAlive: boolean;
    subscriptions: Set<number>;
  }
}

export enum MATCH_STATUS {
  SCHEDULED = 'scheduled',
  FINISHED = 'finished',
  LIVE = 'live'
}

// type PayloadType = 'welcome' | 'match_created' | 'error' | 'subscribe' | 'unsubscribe' | 'commentary'

export type Payload = { type: 'welcome' }
  | { type: 'error', message: string }
  | { type: 'match_created', data: Match }
  | { type: 'subscribe', matchId: number }
  | { type: 'unsubscribe', matchId: number }
  | { type: 'commentary', matchId: number, data: Commentary }

// export interface Payload {
//   type: PayloadType,
//   matchId?: number,
//   data?: string
// }

