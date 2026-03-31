import express from 'express';
import { matchRouter } from './routes/matches';

const app = express();
const port = process.env.PORT;

app.use(express.json())

app.get('/', (req, res) => {
  console.log('Match list')
})

app.use('/matches', matchRouter)

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})
