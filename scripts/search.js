
var names;
fetch('/names', {
  headers: {
    "Accept": "text/html"
  },
  method: "GET"
}).then((res) => {
  res.json().then((data) => {
    names = data;
  });
});

function clearChildren(obj) {
  while(obj.hasChildNodes()) {
    obj.removeChild(obj.childNodes[0]);
  }
}

function input(obj, event) {
  var search = obj.children[0].children[0];
  var text = new RegExp(search.value, "gi");

  clearChildren(obj.children[1]);

  names.forEach((name) => {
    if(name.search(text) != -1) {
      var temp = document.createElement('li');
      temp.innerHTML = name;
      temp.classList.add("suggest");
      obj.children[1].appendChild(temp);
    }
  });
}

var memory = [];
function back() {
  if(memory.length > 1) {
    memory.pop();
    getInfo(memory[memory.length-1]);
  }
  console.log(memory);
}

function save(name) {
  memory.push(name);
  console.log(memory);
  return new Promise((resolve, reject) => {
    resolve();
  });
}


document.addEventListener('click', (event) => {
  if(event.target.classList.value === "suggest") {
    save(event.target.innerHTML).then(getInfo(event.target.innerHTML));
  }else {
    clearChildren(document.getElementById("dropdown"));
  }
  if(event.target.id == 'pokemon_input') {
    input(document.getElementById("in"));
  }
  if(event.target.classList[0] == "variant") {
    fillVariant(event.target.classList, event.target.innerHTML.toLowerCase());
  }
});

document.addEventListener('keyup', (event) => {
  if(event.key === 'Escape') {
    clearChildren(obj.children[1]);
  }else if(event.key === 'Enter') {
    var search = document.getElementById("pokemon_input").value.substring(0, 1).toUpperCase() + document.getElementById("pokemon_input").value.substring(1).toLowerCase();
    memory.push(search);
    getInfo(search);
  }else {
    input(document.getElementById("in"))
  }

});
