
var effectiveness = [2, 0.5, 0];
function typeCheck(types) {
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
        //console.log({"type": type, "effect": effect, "val": val, "temp_at_val": temp[val]})
      })
    })
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
