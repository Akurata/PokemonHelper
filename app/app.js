const express = require('express');
var app = express();

var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var _ = require('underscore');

var pokedex = require('oakdex-pokedex');

app.use(express.static(path.resolve('../')));
app.use(bodyParser.json());

var typeChart = fs.readFile('types.json', 'utf-8', (err, data) => {
  if(err) throw err;
  typeChart = JSON.parse(data);
});


var nameList = [];
pokedex.allPokemon((pokemon) => {
  pokemon.forEach((item) => {
    nameList.push(item.names.en);
  })
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('../view/index.html'));
});

app.get('/names', (req, res) => {
  res.send(nameList);
});

app.get('/pokemon/:pokemon', (req, res) => {
  pokedex.findPokemon(req.params.pokemon, (item) => {
    res.send(item);
  });
});

app.get('/typechart', (req, res) => {
  res.json(typeChart)
});

app.listen(3000, (err) => {
  if(err) throw err;
  console.log("App started: " + 3000)
});
