const express = require('express');
var app = express();

var favicon = require('serve-favicon');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var _ = require('underscore');
var async = require('async');

//TEMP
var request = require('request');
var download = require('image-downloader');
var htmlParser = require('node-html-parser')

var pokedex = require('oakdex-pokedex');
//var sprites = require('oakdex-pokedex-sprites');

app.use(favicon(path.resolve('./images/favicon.ico')));
app.use(express.static(path.resolve('./')));
app.use(bodyParser.json());
app.use(cookieParser());


var typeChart = fs.readFile('./app/types_test.json', 'utf-8', (err, data) => {
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
  fs.readFile(path.resolve('./node_modules/oakdex-pokedex/data/pokemon.json'), 'utf-8', (err, data) => {
    obj = JSON.parse(data);

    console.log("start write")
    obj.Hoopa.variations[0].image_suffix = 'unbound';
    console.log(obj.Hoopa.variations[0]);
    fs.writeFile(path.resolve('./node_modules/oakdex-pokedex/data/pokemon.json'), JSON.stringify(obj), (err) => {
      if(err) throw err;
      res.sendFile(path.resolve('./node_modules/oakdex-pokedex/data/pokemon.json'));
      console.log("done")
    })
  })


});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('view/index.html'));
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

/*
app.get('/getSprites', (req, res) => {
  request('http://play.pokemonshowdown.com/sprites/xyani/', {
    headers: {
      'accept': 'text/html'
    },
    method: "GET"
  }, (err, r, body) => {
    console.log("Got Body");
    var root = htmlParser.parse(body);
    var doc = root.childNodes[0].childNodes[3].childNodes[3].childNodes;
    console.log(doc.length)
    var urls = [];
    for(var i = 7; i <= 2429; i++) {
      if(i%2 != 0) {
        urls.push(doc[i].childNodes[1].childNodes[0].childNodes[0].rawText);
        console.log(doc[i].childNodes[1].childNodes[0].childNodes[0].rawText + " " + i);

        download.image({url: 'http://play.pokemonshowdown.com/sprites/xyani/' + doc[i].childNodes[1].childNodes[0].childNodes[0].rawText, dest: path.resolve('../images/sprites/new')}).catch((err) => {
          console.log(err)
        })
      }
    }

    res.send(urls);
  })
});
*/

app.get('/typechart', (req, res) => {
  res.json(typeChart)
});

app.listen(3000, (err) => {
  if(err) throw err;
  console.log("App started: " + 3000)
});
