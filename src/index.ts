import express from 'express';
import http from 'http';
import { matchRouter } from './routes/matches';
import { attachWebSocketServer } from './ws/server';
import { commentaryRouter } from './routes/commentary';

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app)

app.use(express.json())

const broadcastMatchCreated = attachWebSocketServer(server)
app.locals.broadcastMatchCreated = broadcastMatchCreated;

app.use('/matches', matchRouter)
app.use('/matches/:id/commentary', commentaryRouter)

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0'
    ? `http://localhost:${PORT}`
    : `http://${HOST}:${PORT}`

  console.log(`Server is running on ${baseUrl}`)
  console.log(
    `WebSocketServer is running on ${baseUrl.replace('http', 'ws')}/ws`
  )
})
