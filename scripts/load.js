
var typeChart = fetch('/typechart', {
  headers: {
    "Accept": "application/json"
  },
  method: "GET"
}).then((res) => {
  res.json().then((data) => {
    console.log(data)
    typeChart = data;
  })
});


function icon(types) {
  //http://www.tech-recipes.com/rx/39976/photoshop-scale-pixel-art-without-losing-quality/
  var s = "";
  types.forEach((type) => {
    s += "<img src=\"../images/new/test/" + type + ".png\" class=\"icon\"/>"
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
    method: "GET"
  }).then((res) => {
    res.json().then((data) => {
      console.log(data)
      fillPokemon(data)
    })
  })
}

function fillPokemon(data) {
  var body = document.getElementById("pokemon_display");
  var typing = typeCheck(data.types);

  body.children[0].innerHTML = data.names.en;
  body.children[1].innerHTML = "<strong>Type: </strong>" + icon(data.types);

  if(typing.veryWeakTo.length != 0) {
    body.children[2].innerHTML = "<strong>Very Weak to (4x): </strong><span class=\"type\">" + typing.veryWeakTo.join(', ').toUpperCase() + "</span>";
  }

  if(typing.weakTo.length != 0) {
    body.children[3].innerHTML = "<strong>Weak to (2x): </strong>" + icon(typing.weakTo);
  }

  if(typing.resist.length != 0) {
    body.children[4].innerHTML = "<strong>Resistant to (1/2x): </strong>" + icon(typing.resist);
  }

  if(typing.veryResist.length != 0) {
    body.children[5].innerHTML = "<strong>Very Resistant to (1/4x): </strong>" + icon(typing.veryResist);
  }

  if(typing.immuneTo.length != 0) {
    body.children[6].innerHTML = "<strong>Immune to (0x): </strong>" + icon(typing.immuneTo);
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
