import { WebSocket, WebSocketServer, type RawData } from 'ws';
import type { Payload } from '../types/types';
import type { Server } from 'http';
import type { Commentary, Match } from '../db/schema';

const matchRooms: Map<number, Set<WebSocket>> = new Map()

const subscribe = (matchId: number, socket: WebSocket) => {
  if (!matchRooms.has(matchId)) {
    matchRooms.set(matchId, new Set());
  }

  matchRooms.get(matchId)!.add(socket)
}

const unsubscribe = (matchId: number, socket: WebSocket) => {
  const subscribers = matchRooms.get(matchId);

  if (!subscribers) return

  subscribers.delete(socket)

  if (subscribers.size === 0) {
    matchRooms.delete(matchId);
  }
}

//if user close the browser or there's ghost connection then we can remove that from every subscribed match
const cleanupSubscriptions = (socket: WebSocket) => {
  for (const matchId of socket.subscriptions) {
    unsubscribe(matchId, socket)
  }
}

const broadcastToMatch = (matchId: number, payload: Payload) => {
  const subscribers = matchRooms.get(matchId)
  if (!subscribers || subscribers.size === 0) return

  const message = JSON.stringify(payload);

  for (const client of subscribers) {
    if (client.readyState !== WebSocket.OPEN) continue
    client.send(message)
  }
}

const handleMessage = (socket: WebSocket, data: RawData) => {
  try {
    const parsed = JSON.parse(data.toString())
    const message = parsed as Payload

    if (message.type === 'subscribe' && Number.isInteger(message.matchId)) {
      subscribe(message.matchId, socket)
      socket.subscriptions.add(message.matchId)
      sendJson(socket, { type: 'subscribe', matchId: message.matchId })
      return
    }

    if (message.type === 'unsubscribe' && Number.isInteger(message.matchId)) {
      unsubscribe(message.matchId, socket)
      socket.subscriptions.delete(message.matchId)
      sendJson(socket, { type: 'unsubscribe', matchId: message.matchId })
    }
  } catch (err) {
    sendJson(socket, { type: 'error', message: 'Invalid JSON' })
  }

}

const sendJson = (socket: WebSocket, payload: Payload) => {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload))
}

//maybe there also i need to add a new type/structure of broadcastPayload
const broadcast = (wss: WebSocketServer, payload: Payload) => {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload))
  }
}

export const attachWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024 * 1024,
  })

  wss.on('connection', (socket, request) => {
    socket.isAlive = true;
    socket.on('pong', () => socket.isAlive = true);

    socket.subscriptions = new Set()

    sendJson(socket, { type: 'welcome' })

    socket.on('message', (data) => {
      handleMessage(socket, data)
    })

    socket.on('error', (err) => {
      console.log(err)
      socket.terminate()
    })

    socket.on('close', () => {
      cleanupSubscriptions(socket)
    })
  })

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (!client.isAlive) return client.terminate()

      client.isAlive = false
      client.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(interval))

  //idk what's the type of match here will put later
  const broadcastMatchCreated = (match: Match) => {
    broadcast(wss, { type: 'match_created', data: match })
  }

  const broadcastCommentary = (matchId: number, comment: Commentary) => {
    broadcastToMatch(matchId, { type: 'commentary', matchId, data: comment })
  }

  return { broadcastMatchCreated, broadcastCommentary };
}
