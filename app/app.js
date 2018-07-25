const express = require('express');
var app = express();

var favicon = require('serve-favicon');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var _ = require('underscore');
var async = require('async');

var pokedex = require('oakdex-pokedex');

app.use(favicon(path.resolve('../images/favicon.ico')));
app.use(express.static(path.resolve('../')));
app.use(bodyParser.json());
app.use(cookieParser());


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

pokedex.findAbility("Contrary", (data) => {

});


app.get('/', (req, res) => {
  res.sendFile(path.resolve('../view/index.html'));
});

app.get('/names', (req, res) => {
  res.send(nameList);
});

app.get('/pokemon/:pokemon', (req, res) => {
  var abi = [];
  var megaAbi = [];

  pokedex.findPokemon(req.params.pokemon, (item) => {
    async.forEachOf(item.abilities, (ab, i, callback) => {
      console.log(ab.name)
      pokedex.findAbility(ab.name, (ability) => {
        abi.push("<b><u>" + ab.name + "</u></b>: " + ability.descriptions.en);
        callback();
      });
    }, () => {

      if(item.mega_evolutions.length != 0) {
        async.forEachOf(item.mega_evolutions, (ab, i, callback) => {
          pokedex.findAbility(ab.ability, (mability) => {
            megaAbi.push("<b><u>" + mability.names.en + "</u></b>: " + mability.descriptions.en);
            callback();
          });
        }, () => {
          res.cookie("Ability", abi);
          res.cookie("MegaAbility", megaAbi);
          res.send(item);
        });
      }else {
        res.cookie("Ability", abi);
        res.send(item);
      }
    })
  });
});


app.get('/typechart', (req, res) => {
  res.json(typeChart)
});

app.listen(3000, (err) => {
  if(err) throw err;
  console.log("App started: " + 3000)
});
