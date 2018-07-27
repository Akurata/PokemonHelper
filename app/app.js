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
//var sprites = require('oakdex-pokedex-sprites');

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

pokedex.findAbility("Contrary", (data) => {});

app.get('/data-update', (req, res) => {
  var obj = {};
  console.log("start read")
  fs.readFile(path.resolve('../node_modules/oakdex-pokedex/data/pokemon.json'), 'utf-8', (err, data) => {
    obj = JSON.parse(data);

    console.log("start write")

    fs.writeFile(path.resolve('../node_modules/oakdex-pokedex/data/pokemon.json'), JSON.stringify(obj), (err) => {
      if(err) throw err;
      res.sendFile(path.resolve('../node_modules/oakdex-pokedex/data/pokemon.json'));
      console.log("done")
    })
  })


});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('../view/index.html'));
});

app.get('/names', (req, res) => {
  res.send(nameList);
});

app.get('/pokemon/:pokemon', (req, res) => {
  var abi = [];
  var variAbi = [];
  var megaAbi = [];

  pokedex.findPokemon(req.params.pokemon, (item) => {
    if(item) {
      async.forEachOf(item.abilities, (ab, i, callback) => {
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
          }, (err) => {
            if(err) console.err(err);
            res.cookie("Ability", abi);
            res.cookie("MegaAbility", megaAbi);
            res.send(item);
            res.end();
          });
        }else {
          res.cookie("Ability", abi);
          res.send(item);
          res.end();
        }
      })
    }else {
      console.log(new Date().toLocaleTimeString() + " - " + req.params.pokemon + " is not found.")
      res.end();
    }
  });
});


app.get('/typechart', (req, res) => {
  res.json(typeChart)
});

app.listen(3000, (err) => {
  if(err) throw err;
  console.log("App started: " + 3000)
});
