import 'ws'
declare module 'ws' {
  interface WebSocket {
    isAlive: boolean;
  }
}

export enum MATCH_STATUS {
  SCHEDULED = 'scheduled',
  FINISHED = 'finished',
  LIVE = 'live'
}

type PayloadType = 'welcome' | 'match_created'

//Will write the structure of this sending payload to a socket/client
export interface Payload {
  type: PayloadType,
  data?: string
}

