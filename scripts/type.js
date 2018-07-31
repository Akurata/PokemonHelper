
var effectiveness = [2, 0.5, 0];
function typeCheck(types) {
  //setBackground(types)
  var temp = {};
  var overall = {
    '0.25x': [],
    '0.5x': [],
    '0x': [],
    '1x': [],
    '2x': [],
    '4x': []
  };
  types.forEach((type) => {
    effectiveness.forEach((effect) => {
      typeChart[type][effect].forEach((val) => {
        if(temp[val] != undefined) {
          temp[val] = temp[val] * effect;
        }else {
          temp[val] = effect;
        }
      });
    });
  });
  for(var type in typeChart) {
    if(temp[type.toLowerCase()] == undefined) {
      temp[type.toLowerCase()] = 1;
    }
  }
  for(var type in temp) {
    overall[temp[type] + 'x'].push(type);
  }
  return overall;
}


function setBackground(types) {
  var type = types[0];
  var color;
  switch(type) {
    case "Bug": color = "#dfff80"; break;
    case "Dark": color = "#999999"; break;
    case "Dragon": color = "#b380ff"; break;
    case "Electric": color = "#ffff99"; break;
    case "Fairy": color = "#ffccff"; break;
    case "Fighting": color = "#ff8080"; break;
    case "Fire": color = "#ff9999"; break;
    case "Flying": color = "#b3f0ff"; break;
    case "Ghost": color = "#b366ff"; break;
    case "Grass": color = "#c6ecc6"; break;
    case "Ground": color = "#ffd9b3"; break;
    case "Ice": color = "#ccffff"; break;
    case "Normal": color = "#f1e7da"; break;
    case "Poison": color = "#f0c2e0"; break;
    case "Psychic": color = "#ffb3d9"; break;
    case "Rock": color = "#ecd9c6"; break;
    case "Steel": color = "#d1d1e0"; break;
    case "Water": color = "#b3ccff"; break;
  }
  document.body.style.backgroundColor = color;
}
