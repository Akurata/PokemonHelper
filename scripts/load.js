
function icon(types) {
  //http://www.tech-recipes.com/rx/39976/photoshop-scale-pixel-art-without-losing-quality/
  var s = "";
  types.forEach((type) => {
    s += "<img src=\"../images/good/test2/" + type + ".png\" class=\"icon\"alt=\"" + type + "\"/>"
  });
  return s;
}

function mainicon(types) {
  var s = "";
  types.forEach((type) => {
    s += "<img src=\"../images/good/test2/Big/" + type.toLowerCase() + ".gif\" class=\"main\" alt=\"" + type + "\"/>"
  });
  return s;
}

//http://play.pokemonshowdown.com/sprites/xyani/
function setSprite(data) {
  //var id = data.national_id.toString();
  var name = data.names.en.replace(/[^\w\s] /g, '').toLowerCase();
  var src = "../images/sprites/new/" + name;
  if(data.image_suffix) src += "-" + data.image_suffix;
  src += ".gif";
  document.getElementById("sprite").alt = data.names.en;
  document.getElementById("sprite").src = src;
}

var wait = {
  start: function() {
    document.getElementById("pokemon_display").classList.add("overlay")
  },
  stop: function() {
      document.getElementById("pokemon_display").classList.remove("overlay");
  }
}

var data = {};
var allAbilities;

function getInfo(name) {
  //wait.start();
  document.getElementById("pokemon_input").value = name;
  //clearChildren(document.getElementById("dropdown"));

  fetch('/pokemon/' + name, {
    headers: {
    "Accept": "application/json"
    },
    credentials: "same-origin",
    method: "GET"
  }).then((res) => {
    res.json().then((data) => {
      var cookieStr = decodeURIComponent(document.cookie).replace(/; /g, ",\"");
      //Parse cookie in firefox
      if(typeof InstallTrigger !== 'undefined') cookieStr = "\"" + cookieStr.replace(/=j/ig, "\"");
      //Parse cookie in chrome
      if(!!window.chrome && !!window.chrome.webstore) cookieStr = "\"" + cookieStr.replace(/=j/ig, "\"");

      console.log("{" + cookieStr + "}");
      allAbilities = JSON.parse("{" + cookieStr + "}");


      this.data = data;
      if(this.data.mega_evolutions.length != 0) {
        this.data.mega_evolutions.forEach((mega) => {
          mega.names = {};
          mega.names.en = mega.mega_stone;
        });
      }
      console.log(data);
      fillPokemon(this.data, allAbilities['Ability']);
    }).then(() => {
      //wait.stop();
    }).catch((err) => {
      save(name).then(() => {
        console.log(err);
        console.log("Cannot get: " + name);
        var error = document.createElement("strong");
        error.innerHTML = "Cannot get: " + name;
        error.id = "error";
        document.getElementById("in").children[0].appendChild(error);
      })
    });
  });
}


function fillPokemon(data, ability) {
  var body = document.getElementById("pokemon_display");
  var typing = typeCheck(data.types);
  setSprite(data);
  body.children[0].children[0].innerHTML = (data.prefix ? data.prefix + " ": "") + data.names.en + (data.suffix ? " " + data.suffix : "");

  fill(body.children[0].children[2], "Variations", data.variations, 'sublabel', 'image_suffix', 'form');
  fill(body.children[0].children[3], "Mega Evolutions", data.mega_evolutions, 'sublabel', 'mega_stone');
  fill(body.children[0].children[4].children[0], "Evolves To", data.evolutions, 'sublabel', 'to', 'evolution');
  fill(body.children[0].children[4].children[1], "Evolves From", data.evolution_from, 'sublabel', 'evolution_from', 'evolution');

  fill(body.children[1], "Type", data.types, 'mainicon');
  fill(body.children[2], "Very Weak to (4x)", typing['4x'], 'icon');
  fill(body.children[3], "Weak to (2x)", typing['2x'], 'icon');
  fill(body.children[4], "Resistant to (<sup>1</sup>&frasl;<sub>2x</sub>)", typing['0.5x'], 'icon');
  fill(body.children[5], "Very Resistant to (<sup>1</sup>&frasl;<sub>4x</sub>)", typing['0.25x'], 'icon');
  fill(body.children[6], "Immune to (0x)", typing['0x'], 'icon');
  fill(body.children[7], "Damaged Normally By (1x)", typing['1x'], 'icon');

  clearChildren(body.children[8]);
  body.children[8].innerHTML = "<hr/><strong>Abilities:</strong>";
  body.children[8].appendChild(document.createElement("ul"));
  ability.forEach((ab, i) => {
    var temp = document.createElement("li");
    temp.innerHTML = ab; //.replace(/[\[\]"]/ig, "")
    body.children[8].children[2].appendChild(temp);
  });
  body.children[8].innerHTML += "<hr/>";

  fillStats(data, body.children[9]);
}



function fill(element, title, data, type, label, variation) {
  var field = "<strong>" + title + ": </strong>";
  if(data) {
    if(data != null && data.length != 0) {
      if(type == 'mainicon') {
        field += mainicon(data);
        element.innerHTML = data.length != 0 ? element.innerHTML = field : element.innerHTML = "";
      }

      if(type == 'icon') {
        field += icon(data);
        element.innerHTML = data.length != 0 ? element.innerHTML = field : element.innerHTML = "";
      }

      if(type == 'sublabel') {
        if(!variation) {
          variation = "";
        }
        if(Array.isArray(data)) {
          var id = label ? label : data.names.en;
          data.forEach((item, index) => {
            field += "<span class=\"variant " + variation + "\">" + (item[label] ? item[label] : item.names.en) + "</span>";
            if(index != data.length - 1) {
              field += ", "
            }
          });
          element.innerHTML = field;
        }else {
          field += "<span class=\"variant " + variation + "\">" + data + "</span>";
          element.innerHTML = field;
        }
      }
    }else {
      element.innerHTML = ""
    }
  }else {
    element.innerHTML = ""
  }
}

function fillVariant(list, name) {
  var returnData = JSON.parse(JSON.stringify(data));
  if(list[1] == "form") {
    var variant;
    if(data.variations.length > 1) {
      variant = data.variations[data.variations.map((e) => {return e.image_suffix ? e.image_suffix : e.names.en}).indexOf(name)];
    }else {
      variant = data.variations[0];
    }

    //returnData.names.en = toProper(name);
    returnData.types = variant.types;
    if(variant.abilities) {
      returnData.abilities = variant.abilities;
    }
    returnData.variations = data.variations;
    returnData.mega_evolutions = [];
    returnData.base_stats = variant.base_stats;
    returnData.evolution_from = data.names.en;
    if(variant.image_suffix) {
      returnData.image_suffix = variant.image_suffix;
      returnData.suffix = toProper(variant.image_suffix);
    }
    console.log(returnData);
    save(this.data.names.en).then(fillPokemon(returnData, allAbilities.Ability));
  }else if(list[1] == "evolution") { //It's an evolution
    save(toProper(name)).then(getInfo(toProper(name)));
  }else { //It's gotta be a mega
    var mega = data.mega_evolutions[data.mega_evolutions.map((e) => {return e.mega_stone}).indexOf(toProper(name))];
    console.log(data.names.en)
    //returnData.names.en  = "Mega " + data.names.en;
    returnData.types = mega.types;
    returnData.abilities = mega.ability;
    returnData.variations = [];
    returnData.mega_evolutions = data.mega_evolutions;
    returnData.base_stats = mega.base_stats;
    if(mega.image_suffix) {
      returnData.image_suffix = mega.image_suffix;
      returnData.suffix = mega.image_suffix.charAt(mega.image_suffix.length-1).toUpperCase();
    }else {
      returnData.image_suffix = 'mega';
    }
    returnData.evolution_from = data.names.en;
    returnData.prefix = "Mega";
    console.log(returnData)
    save(data.names.en).then(fillPokemon(returnData, allAbilities['MegaAbility']));
  }
}

function fillStats(data, body) {
  if(data.base_stats) {
    var stat_total = data.base_stats.hp + data.base_stats.atk + data.base_stats.def + data.base_stats.sp_atk + data.base_stats.sp_def + data.base_stats.speed;

    body.children[0].children[0].innerHTML = "<strong>HP:</strong> " + data.base_stats.hp;
      body.children[0].children[1].value = data.base_stats.hp;

    body.children[1].children[0].innerHTML = "<strong>ATK:</strong> " + data.base_stats.atk;
      body.children[1].children[1].value = data.base_stats.atk;

    body.children[2].children[0].innerHTML = "<strong>DEF:</strong> " + data.base_stats.def;
      body.children[2].children[1].value = data.base_stats.def;

    body.children[3].children[0].innerHTML = "<strong>SpAtk:</strong> " + data.base_stats.sp_atk;
      body.children[3].children[1].value = data.base_stats.sp_atk;

    body.children[4].children[0].innerHTML = "<strong>SpDef:</strong> " + data.base_stats.sp_def;
      body.children[4].children[1].value = data.base_stats.sp_def;

    body.children[5].children[0].innerHTML = "<strong>Speed:</strong> " + data.base_stats.speed;
      body.children[5].children[1].value = data.base_stats.speed;

    document.getElementById("total").innerHTML = "<strong>Total:</strong> " + stat_total;
  }
}



/*
function typeCheck(types) {
  var overall = {
    veryWeakTo: [],
    weakTo: [],
    resist: [],
    veryResist: [],
    immuneTo: []
  }
  overall.weakTo = typeChart[types[0]].weakTo;
  overall.resist = typeChart[types[0]].resist;
  overall.immuneTo = typeChart[types[0]].immuneTo;
  if(types[1]) {
    typeChart[types[1]].weakTo.forEach((item, index) => {
      if(overall.weakTo.indexOf(item) == -1) {
        if(overall.immuneTo.indexOf(item) == -1) { //Immunity check
          overall.weakTo.push(item);
        }
      }else {
        overall.weakTo.splice(index, 1);
        overall.veryWeakTo.push(item);
      }
    });
    typeChart[types[1]].resist.forEach((item, index) => {
      //Filter for uniqueness
      if(overall.resist.indexOf(item) == -1) {
        if(overall.immuneTo.indexOf(item) == -1) { //Immunity check
          if(overall.weakTo.indexOf(item) == -1) {
            overall.resist.push(item);
          }else {
            overall.weakTo.splice(overall.weakTo.indexOf(item), 1);
          }
        }
      }else {
        overall.resist.splice(overall.resist.indexOf(item), 1);
        overall.veryResist.push(item);
      }
    });
  }
  return overall;
}
*/
