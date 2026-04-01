import { WebSocket, WebSocketServer } from 'ws';
import type { Payload } from '../types/types';
import type { Server } from 'http';

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

    sendJson(socket, { type: 'welcome' })

    socket.on('error', (err) => console.log(err))
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
  const broadcastMatchCreated = (match: string) => {
    broadcast(wss, { type: 'match_created', data: match })
  }


  return broadcastMatchCreated;
}
