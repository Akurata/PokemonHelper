
var names;
var typeChart;

window.onload = function() {
  wait.start();
  fetch('/typechart', {
    headers: {
      "Accept": "application/json"
    },
    method: "GET"
  }).then((res) => {
    res.json().then((data) => {
      typeChart = data;
    });
  });

  fetch('/names', {
    headers: {
      "Accept": "text/html"
    },
    method: "GET"
  }).then((res) => {
    res.json().then((data) => {
      names = data;
    }).then(() => {
      save('1').then(getInfo(1));
      document.getElementById('pokemon_input').value = '';
      wait.stop();
    });
  });

  document.getElementById("pokemon_input").addEventListener('focus', (event) => {
    input(document.getElementById("in"));
  });
  document.getElementById("pokemon_input").addEventListener('blur', (event) => {
    clearChildren(document.getElementById("dropdown"));
  });

  document.getElementById("pokemon_input").oninput = function() {
    input(document.getElementById("in"));
  }
}

window.onrefresh = function() {
  wait.start();
}

function clearChildren(obj) {
  selected = -1;
  while(obj.hasChildNodes()) {
    obj.removeChild(obj.childNodes[0]);
  }
  return new Promise((resolve, reject) => {
    resolve();
  })
}

function input(obj, event) {
  var search = obj.children[0].children[0];
  var text = new RegExp(search.value, "gi");

  clearChildren(obj.children[1]).then(() => {
    names.forEach((name, index) => {
      if(name.search(text) != -1) {
        var temp = document.createElement('li');
        temp.innerHTML = name;
        temp.classList.add("suggest");
        temp.tabindex = index;
        obj.children[1].appendChild(temp);
      }
    });
  })
}

var selected = -1;
function select(key) {
  var name = document.getElementById("pokemon_input");
  var list = document.getElementById("dropdown");
  if(list.hasChildNodes) {
    if(key === 'ArrowUp') {
      if(selected > 0) {
        list.children[selected].classList.remove("selected");
        selected--;
        list.children[selected].classList.add("selected");
      }
    }else if(key === 'ArrowDown') {
      if(selected <= list.children.length) {
        if(list.children[selected]) list.children[selected].classList.remove("selected");
        selected++;
        list.children[selected].classList.add("selected");
      }
    }
  }
  name.value = list.children[selected].innerHTML;
}


var memory = [];
function back() {
  if(document.getElementById("error")) {
    document.getElementById("error").parentElement.removeChild(document.getElementById("error"));
  }
  if(memory.length > 1) {
    memory.pop();
    getInfo(memory[memory.length - 1]);
  }
}

function save(name) {
  if(names.indexOf(toProper(name)) != -1 || name <= 802) {
    if(name.indexOf(' ') != -1) {
      name = name.substring(name.lastIndexOf(' ') + 1);
    }
    if(memory[memory.length-1] !== name) {
      memory.push(name);
    }
  }
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function toProper(s) {
  if(s) {
    var string = s.split('');
    string[0] = string[0].toUpperCase();
    for(var i = 1; i < string.length; i++) {
      if(string[i] == ' ' || string[i] == '-') {
        string[i+1] = string[i+1].toUpperCase();
      }
    }
    return string.join('');
  }else {
    return false;
  }
}

document.addEventListener('mousedown', (event) => {
  if(event.target.classList.value === "suggest") {
    save(event.target.innerHTML).then(getInfo(event.target.innerHTML));
  }

  if(event.target.classList[0] == "variant") {
    fillVariant(event.target.classList, event.target.innerHTML.toLowerCase());
  }
});

document.addEventListener('keyup', (event) => {
  if(event.key === 'Escape') {
    clearChildren(document.getElementById("dropdown"));
  }else if(event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    select(event.key);
  }else if(event.key === 'Enter') {
    var search = toProper(document.getElementById("pokemon_input").value);
    save(search).then(getInfo(search));
  }
});
