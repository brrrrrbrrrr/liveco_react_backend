const express = require('express');
const app = express();
const corsOptions = require('./config/corsConfig');
const cors = require('cors');
const resto = require('./resto_list');
const port = 8001;

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello World !');
});

app.get('/api/resto', (req, res) => {
  let { limit, name } = req.query;
  console.log(req.query);
  if (!limit || limit > resto.length || isNaN(limit)) limit = resto.length;
  if (!name) name = '';
  const tempArray = resto
    .filter((item) => item.name.includes(name))
    .slice(0, limit);
  res.json(tempArray);
});

app.get('/api/resto/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const detail = resto.find((item) => item.id === id);
  if (detail) res.json(detail);
  else res.sendStatus(404);
});

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});

module.exports = app;
