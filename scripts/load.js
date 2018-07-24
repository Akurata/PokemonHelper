
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
  console.log(typing)

  body.children[0].innerHTML = data.names.en;
  body.children[1].innerHTML = "<strong>Type: </strong>" + data.types.join(', ');

  //2: Very Weak to
  //3: Weak to
  //4: Resistant to
  //5: Very Resistant to
  //6: Immune to
  if(typing.veryWeakTo.length != 0) {
    body.children[2].innerHTML = "<strong>Very Weak to: </strong>" + typing.veryWeakTo.join(', ');
  }

  if(typing.weakTo.length != 0) {
    body.children[3].innerHTML = "<strong>Weak to: </strong>" + typing.weakTo.join(', ');
  }

  if(typing.resist.length != 0) {
    body.children[4].innerHTML = "<strong>Resistant to: </strong>" + typing.resist.join(', ');
  }

  if(typing.veryResist.length != 0) {
    body.children[5].innerHTML = "<strong>Very Resistant to: </strong>" + typing.veryResist.join(', ');
  }

  if(typing.immuneTo.length != 0) {
    body.children[6].innerHTML = "<strong>Immune to: </strong>" + typing.immuneTo.join(', ');
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
        overall.weakTo.push(item);
      }else {
        overall.weakTo.splice(index, 1);
        overall.veryWeakTo.push(item);
      }

    });

    typeChart[types[1]].resist.forEach((item, index) => {

      //Filter for uniqueness
      if(overall.resist.indexOf(item) == -1) {
        if(overall.immuneTo.indexOf(item) == -1) { //Immunity check
          overall.resist.push(item);
        }
      }else {
        overall.resist.splice(overall.resist.indexOf(item), 1);
        overall.veryResist.push(item);
      }

      //Check if weakness is being resisted
      if(overall.weakTo.indexOf(item) != -1) {
        overall.weakTo.splice(overall.weakTo.indexOf(item), 1);
      }

    });
  }
  return overall;
}
