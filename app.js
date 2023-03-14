require('dotenv').config();
const express = require('express');
const app = express();
const connection = require('./db-config');
const corsOptions = require('./config/corsConfig');
const cors = require('cors');
const resto = require('./resto_list');
const port = 8001;

app.use(cors(corsOptions));
//Utilisation des middlewares pour récupérer le JSON du body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*Connexion à la base de données */
connection.connect((err) => {
  if (err) {
    console.log('error connecting DB : ' + err.stack);
  } else {
    console.log('DB connected as id ' + connection.threadId);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World !');
});

//Routes pour les restaurants
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

//Route pour les animaux
app.get('/api/animals', (req, res) => {
  //Récupération de tous les animaux de la table
  connection.query('SELECT * FROM animals', (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    } else res.json(result);
  });
});

app.get('/api/animals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.sendStatus(422);
  }
  connection.query('SELECT * FROM animals WHERE id=?', [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    } else {
      if (result.length === 0) return res.sendStatus(404);
      else return res.json(result[0]);
    }
  });
});

app.post('/api/animals', (req, res) => {
  const { name, picture, description } = req.body;
  console.log(req.body);
  //Vérifier si les données sont correctes
  //On enregistre dans la base de données

  connection.query(
    'INSERT INTO animals (name, picture, description,zone_id) VALUES (?,?,?,1)',
    [name, picture, description],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      const id = result.insertId;
      const newAnimal = {
        name,
        picture,
        description,
        id,
      };
      return res.status(201).json(newAnimal);
    }
  );
});

app.put('/api/animals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  connection.query(
    'UPDATE animals SET ? WHERE id=?',
    [req.body, id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      return res.sendStatus(204);
    }
  );
});

app.delete('/api/animals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  connection.query('DELETE FROM animals WHERE id=?', [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    } else {
      return res.sendStatus(204);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});

module.exports = app;

/*
id=y;
SELECT * FROM x WHERE id=? [id]
=>SELECT * FROM x WHERE id=y
id=0 OR 1;
SELECT * FROM x WHERE id=0 OR 1

SELECT * FROM x WHERE id='0 OR 1'

id=0 OR 1;
SELECT * FROM x WHERE id=id
=>SELECT * FROM x WHERE id=0 OR 1

formulaire : user,password

SELECT user, password, rights FROM user WHERE username=user
user=0 or 1
=>SELECT user, password, rights FROM user WHERE username=0 OR 1
=>Tous les utilisateurs
SELECT user, password, rights FROM user WHERE username=?,[user]
=>SELECT user, password, rights FROM user WHERE username='0 OR 1'

user=toto
SELECT user, password, rights FROM user WHERE username='toto'
user=toto, rights=1
SELECT user, password, rights FROM user WHERE username=? and rights=?,[user,rights]
\ =>\\
const url='http://localhost:8001/api/animals';
axios
.post(url,{name:'loup',description:'',picture:'abcd'})
.then()
.catch()


*/
