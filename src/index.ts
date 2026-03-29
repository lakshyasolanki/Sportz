import express from 'express';

const app = express();
const port = process.env.PORT;

app.use(express.json())

app.get('/', (req, res) => {
  console.log('Match list')
})

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})
