function loadData (file1, file2) {
  Promise.all([
    d3.json(file1),
    d3.json(file2)
  ])
  .then(function (data) {
    layOut()

    var cityAreas = parseDataCity(data[1])
    makeLineGraph(data[0], cityAreas)

  });

};

function layOut() {
  var height = 500
  var width = 500

  d3.select("div.layout")
    .append("div")
    .attr("class", "lineGraph")
    .attr("height", height)
    .attr("width", width)
};

function makeLineGraph (data, cityAreas) {
  var begin = makeSelectMenu(data, cityAreas)

  var arrayY = minAndMaxValues(data, begin)
  var height = Number(d3.select("div.lineGraph").attr("height"))
  var width = Number(d3.select("div.lineGraph").attr("width"))

  console.log(begin)
  console.log(Object.keys(Object.values(data[begin[1]])[0][begin[0]]))
  var stack = d3.stack()
    .offSet(d3.stackOffsetExpand)
    .keys(Object.keys(Object.keys(d[begin[0]])[0][begin[1]]))
  console.log(true)
  var stack = stack(Object.values(data[begin[1]]))
  console.log(stack)
  var svg = d3.select("div.lineGraph")
    .append("svg")
      .attr("id", "lineGraph")
      .attr("height", height)
      .attr("width", width);

  var x = d3.scaleBand()
    .domain(Object.key(data[beginValue]))
    .range([0, width]);

  var y = d3.scaleLinear()
    .domain([0, d3.max(array)])
    .range([height, 0])

};

function parseDataCity (data) {
  var areaCodes = {};

  data.features.forEach( function (dp) {
    areaCodes[dp.properties.Gebied] = dp.properties.Gebied_code;
  });

  return areaCodes
};

function minAndMaxValues(data, beginVariables) {
  var array = []
  Object.values(data[beginVariables[1]]).forEach( function (d) {
    array.push(Number(d.bevtotaal))
  });

  return array

};

function makeSelectMenu(data, areas) {
  var otherVar = Object.keys(Object.values(Object.values(data)[0])[0])

  // make select menu for the stadsdeel
  var makeMenuCityArea = d3.select("div.lineGraph")
    .append("select")
    .attr("id", "selectCityArea")
    .on("change", function() {
      console.log(d3.select(this).property("value"))
    });

  makeMenuCityArea.selectAll("option")
    .data(Object.keys(areas).sort())
    .enter()
    .append("option")
    .attr("value", function (d) {
      return areas[d];
    })
    .text(function (d) {
      return d ;
    });

  // make select menu for the section
  var choiceVariable = d3.select("div.lineGraph")
    .append("select")
    .attr("id", "selectVaraible")
    .on("change", function () {
      console.log(d3.select(this).property("value"))
    });

  choiceVariable.selectAll("option")
    .data(otherVar)
    .enter()
    .append("option")
    .attr("value", function (dp) {
      return dp;
    })
    .text(function (dp) {
      return dp;
    });

  return [otherVar[0], Object.values(areas).sort()[0]]
};

loadData("data/bev_amsterdam.json", "data/GEBIEDEN22.json")
