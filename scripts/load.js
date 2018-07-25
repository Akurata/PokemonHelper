
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
    s += "<img src=\"../images/good/test2/Big/" + type + ".gif\" class=\"main\"/>"
  });
  return s;
}


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

      console.log(allAbilities)
      console.log(data)

      this.data = data;

      fillPokemon(this.data, allAbilities['Ability'])
    });
  });
}
var data = {};
var allAbilities;

function fillPokemon(data, ability) {
  console.log(ability)
  var body = document.getElementById("pokemon_display");
  var typing = typeCheck(data.types);

  body.children[0].children[0].innerHTML = data.names.en;

  fill(body.children[0].children[1], "Variations", data.variations, 'sublabel', 'image_suffix');
  fill(body.children[0].children[2], "Mega Evolutions", data.mega_evolutions, 'sublabel', 'mega_stone');

  fill(body.children[1], "Type", data.types, 'mainicon');
  fill(body.children[2], "Very Weak to (4x)", typing.veryWeakTo, 'icon');
  fill(body.children[3], "Weak to (2x)", typing.weakTo, 'icon');
  fill(body.children[4], "Resistant to (1/2x)", typing.resist, 'icon');
  fill(body.children[5], "Very Resistant to (1/4x)", typing.veryResist, 'icon');
  fill(body.children[6], "Immune to (0x)", typing.immuneTo, 'icon');


  clearChildren(body.children[7]);
  body.children[7].innerHTML = "<hr/><strong>Abilities:</strong>";
  body.children[7].appendChild(document.createElement("ul"));
  ability.forEach((ab, i) => {
    var temp = document.createElement("li");
    temp.innerHTML = ab.replace(/[\[\]"]/ig, "")
    body.children[7].children[2].appendChild(temp);
  });

}



function fill(element, title, data, type, label) {
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
    if(data.length != 0) {
      data.forEach((item, index) => {
        field += "<span class=\"variant\">" + item[label].substring(0, 1).toUpperCase() + item[label].substring(1) + "</span>";
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

function fillVariant(evo) {
  var mega = data.mega_evolutions[data.mega_evolutions.map((e) => {return e.mega_stone}).indexOf(evo)];
  mega.names = {
    en: "Mega " + data.names.en
  }


  var megaData = this.data;
  megaData.names.en  = "Mega " + data.names.en;
  megaData.types = mega.types;
  megaData.abilities = mega.ability;
  megaData.variations = [];
  megaData.mega_evolutions = [];


  console.log(mega)
  fillPokemon(megaData, allAbilities['MegaAbility']);
}


function typeCheck(types) {
  var overall = {
    veryWeakTo: [],
    weakTo: [],
    resist: [],
    veryResist: [],
    immuneTo: []
  }

  overall.weakTo = typeChart[types[0]]['weakTo'];
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
