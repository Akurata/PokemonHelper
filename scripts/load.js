
var typeChart = fetch('/typechart', {
  headers: {
    "Accept": "application/json"
  },
  method: "GET"
}).then((res) => {
  res.json().then((data) => {
    typeChart = data;
  })
});


function icon(types) {
  //http://www.tech-recipes.com/rx/39976/photoshop-scale-pixel-art-without-losing-quality/
  var s = "";
  types.forEach((type) => {
    s += "<img src=\"../images/good/test2/" + type + ".png\" class=\"icon\"/>"
  });
  return s;
}

function mainicon(types) {
  var s = "";
  types.forEach((type) => {
    s += "<img src=\"../images/good/test2/Big/" + type.toLowerCase() + ".gif\" class=\"main\"/>"
  });
  return s;
}


function setSprite(data) {
  var id = data.national_id.toString();
  if(id.length == 1) {
    id = "00" + id;
  }else if(id.length == 2) {
    id = "0" + id;
  }

  var src = "../images/sprites/" + id;
  if(data.image_suffix) src += "-" + data.image_suffix;
  src += ".png";
  document.getElementById("sprite").src = src;
}



var data = {};
var allAbilities;

function getInfo(name) {
  document.getElementById("pokemon_input").value = name;
  clearChildren(document.getElementById("dropdown"));

  fetch('/pokemon/' + name, {
    headers: {
    "Accept": "application/json"
    },
    credentials: "same-origin",
    method: "GET"
  }).then((res) => {
    res.json().then((data) => {
      var cookieStr = decodeURIComponent(document.cookie).replace(/; /g, ",\"");
      cookieStr = cookieStr.replace(/=j/ig, "\"")
      allAbilities = JSON.parse("{\"" + cookieStr + "}");

      console.log("TRUE DATA")
      console.log(data);
      this.data = data;

      fillPokemon(this.data, allAbilities['Ability'])
    }).catch((err) => {
      console.log(err)
      console.log("Cannot get: " + name);
    });
  });
}


function fillPokemon(data, ability) {
  var body = document.getElementById("pokemon_display");
  var typing = typeCheck(data.types);
  setSprite(data);

  body.children[0].children[0].innerHTML = data.names.en;

  fill(body.children[0].children[2], "Variations", data.variations, 'sublabel', 'image_suffix', 'form');
  fill(body.children[0].children[3], "Mega Evolutions", data.mega_evolutions, 'sublabel', 'mega_stone');

  fill(body.children[1], "Type", data.types, 'mainicon');
  fill(body.children[2], "Very Weak to (4x)", typing.veryWeakTo, 'icon');
  fill(body.children[3], "Weak to (2x)", typing.weakTo, 'icon');
  fill(body.children[4], "Resistant to (<sup>1</sup>&frasl;<sub>2x</sub>)", typing.resist, 'icon');
  fill(body.children[5], "Very Resistant to (<sup>1</sup>&frasl;<sub>4x</sub>)", typing.veryResist, 'icon');
  fill(body.children[6], "Immune to (0x)", typing.immuneTo, 'icon');

  clearChildren(body.children[7]);
  body.children[7].innerHTML = "<hr/><strong>Abilities:</strong>";
  body.children[7].appendChild(document.createElement("ul"));
  ability.forEach((ab, i) => {
    var temp = document.createElement("li");
    temp.innerHTML = ab; //.replace(/[\[\]"]/ig, "")
    body.children[7].children[1].appendChild(temp);
  });
  body.children[7].innerHTML += "<hr/>";

  fillStats(data, body.children[8]);

}



function fill(element, title, data, type, label, variation) {
  var field = "<strong>" + title + ": </strong>";

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
    if(data.length != 0) {
      data.forEach((item, index) => {
        field += "<span class=\"variant " + variation + "\">" + item.names.en.substring(0, item.names.en.indexOf(' ') == -1 ? item.names.en.length : item.names.en.indexOf(' ')) + "</span>";
        if(index != data.length - 1) {
          field += ", "
        }
      });
      element.innerHTML = field;
    }else {
      element.innerHTML = "";
    }
  }
}

function fillVariant(list, name) {
  var returnData = JSON.parse(JSON.stringify(data));

  if(list[1] == "form") {
    console.log(toProper(name))
    var variant = data.variations[data.variations.map((e) => {return e.names.en.substring(0, e.names.en.indexOf(' ') == -1 ? e.names.en.length : e.names.en.indexOf(' '))}).indexOf(toProper(name))];
    console.log(variant)
    returnData.names.en = toProper(name) + " " + data.names.en;
    returnData.types = variant.types;
    if(variant.abilities) {
      returnData.abilities = variant.abilities;
    }
    returnData.variations = data.variations;
    returnData.mega_evolutions = [];
    returnData.base_stats = variant.base_stats;
    returnData.image_suffix = variant.image_suffix;

    console.log(returnData);
    console.log(this.data)
    save(this.data.names.en).then(fillPokemon(returnData, allAbilities.Ability));
  }else { //It's gotta be a mega
    console.log(toProper(name));
    var mega = data.mega_evolutions[data.mega_evolutions.map((e) => {return e.mega_stone}).indexOf(toProper(name))];

    returnData.names.en  = "Mega " + data.names.en;
    returnData.types = mega.types;
    returnData.abilities = mega.ability;
    returnData.variations = [];
    returnData.mega_evolutions = [];
    returnData.base_stats = mega.base_stats;
    if(mega.image_suffix) {
      returnData.image_suffix = mega.image_suffix;
    }else {
      returnData.image_suffix = 'mega';
    }

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

  if(types[1] != undefined) {

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

      //Check if weakness is being resisted


    });
  }
  return overall;
}
