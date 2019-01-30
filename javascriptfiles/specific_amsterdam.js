
// Loads the data in
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
  var height = 600
  var width = 600

  const layout = d3.select("div.layout")

  layout.append("div")
    .attr("class", "lineGraph")
    .attr("height", height)
    .attr("width", width)

  layout.append("p")
    .attr("id", "upper")
};

function makeLineGraph (data, cityAreas) {
  var begin = makeSelectMenu(data, cityAreas)
  makeButton(data, cityAreas)
  const years = parseYears(Object.keys(data[begin[0]]))

  var arrayY = minAndMaxValues(data, begin)
  var height = Number(d3.select("div.lineGraph").attr("height"));
  var width = Number(d3.select("div.lineGraph").attr("width"));

  var dataGraph = parseDataGraph(data, begin);
  const stack = d3.stack().offset(d3.stackOffsetExpand);
  const color = colorChose(begin[1], Object.values(data))

  var stackData = stack.keys(Object.keys(dataGraph[0]))(dataGraph)

  var svg = d3.select("div.lineGraph")
    .append("svg")
      .attr("id", "lineGraph")
      .attr("height", height)
      .attr("width", width);

  const x = d3.scaleTime()
    .domain([d3.min(years), d3.max(years)])
    .range([0, width - 200]);

  const y = d3.scaleLinear()
    .domain([0, formatScript(d3.max(arrayY))])
    .range([height - 200, 0])

  const area = d3.area()
      .x(function (d, i) { return x(years[i]) })
      .y0(function (d, i) {
        return y(d[0] * arrayY[i]);
      })
      .y1(function (d, i) { return y(d[1] * arrayY[i]); })
      .curve(d3.curveBasis);

  // makes a new canvas for the layer
  var layerGroups = svg.append("g")
    .attr("id", "graph")
    .attr("value", begin[1])
    .attr("transform", "translate(50, 50)")
    .attr("height", height - 200)
    .attr("width", width - 200)

  // makes the graph
  layerGroups.selectAll("path")
    .data(stackData)
    .enter()
    .append("path")
    .attr("d", area)
    .attr("class", function (d) {
      return d.key
    })
    .attr("fill", function (d, i) {
      return color(i)
    })
    .on("mouseover", function (d, i) {
      d3.selectAll("path")
        .attr("opacity", 0.50);

      d3.select(this)
        .attr("opacity", null);
    })
    .on("mouseout", function (d, i) {
      d3.selectAll("path")
        .attr("opacity", null)
    });

  // calls X axis
  d3.select("svg#lineGraph")
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(50, " + (height - 150) + ")")
    .call(d3.axisBottom(x))



  // call Y axis
  d3.select("svg#lineGraph")
    .append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate(50, 50)")
    .call(d3.axisLeft(y))

  // make legend
  let dataHeight = 25;

  const legendBar = svg.selectAll("g#legendBar")
    .data(stackData)
    .enter()
    .append("g")
    .attr("id", "legendBar")
      .attr('transform', function (d, i) {
        return "translate(" + (width - 100) + ", " + (dataHeight * i) + ")";
      });

  // makes the rectangels for the legendBar
  legendBar.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 20)
    .attr("width", 20)
    .attr("fill", function (d, i) {
      return color(i)
    });

  // append text for the legend
  legendBar.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text(function (d, i) {
      let text = formatText(d, i, begin[1])
      return text
    });

};

function formatText(d, i, value) {
  if (value === "background") {
    const names = ["Antilleans", "Dutch", "Morrocans", "Non-western",
      "Surinameses", "Turks", "Western"];
    return names[i]
  }

  // formats the text to the correct format
  if (d.key.toLowerCase().includes("plus")) {
    return d.key.substring(3, 5) + "+"
  }
  else if (d.includes("0_") && d.includes("17")) {
    return "<" + d.key.substring(5)
  }
  else {
    var string = d.key
    string = string.replace(/_/g, "-")
    return string[3] + string.substring(4).toLowerCase()

  };
};

function updateGraph(data, updateValues) {
  const color = colorChose(updateValues[1], Object.values(data))

  let height = Number(d3.select("g#graph").attr("height"))
  let width = Number(d3.select("g#graph").attr("width"))
  const years = Object.keys(data[updateValues[0]])

  const x = d3.scaleLinear()
    .domain([Number(d3.min(years)), Number(d3.max(years))])
    .range([0, width]);

  let popArray = minAndMaxValues(data, updateValues)
  const y = d3.scaleLinear()
    .range([height, 0])

  const area = d3.area()
      .x(function (d, i) { return x(years[i]) })
      .curve(d3.curveBasis);

  if (d3.select("button").text() === "Percentage") {
    y.domain([0, formatScript(d3.max(popArray))])

    area.y0(function (d, i) {
            return y(d[0] * popArray[i]);
          })
          .y1(function (d, i) { return y(d[1] * popArray[i]); })

    d3.select("g.yAxis")
      .transition()
      .call(d3.axisLeft(y))
  }
  else {
    y.domain([0, 100])

    area.y0(function (d, i) {
      return y(d[0] * 100);
    })
    .y1(function (d, i) { return y(d[1] * 100) })

    d3.select("g.yAxis")
      .transition()
      .call(d3.axisLeft(y))

  };

  const dataGraph = parseDataGraph(data, updateValues);

  const stack = d3.stack().offset(d3.stackOffsetExpand);

  const stackData = stack.keys(Object.keys(dataGraph[0]))(dataGraph)

  if (d3.select("g#graph").attr("value") === updateValues[1]) {

    // updates the graph
    d3.select("g#graph")
      .selectAll("path")
      .data(stackData)
      .transition()
      .attr("class", function (d) {
        return d.key
      })
      .attr("d", area)
  }
  else {

    // makes new path
    d3.select("g#graph")
      .selectAll("path")
      .remove()

    // makes the graph
    var layers = d3.select("g#graph")
      .attr("value", updateValues[1])

    layers.selectAll("path")
      .data(stackData)
      .enter()
      .append("path")
      .attr("d", area)
      .attr("class", function (d) {
        return d.key
      })
      .attr("fill", function (d, i) {
        return color(i)
      })
      .on("mouseover", function (d, i) {
        d3.selectAll("path")
          .attr("opacity", 0.50);

        d3.select(this)
          .attr("opacity", null);
      })
      .on("mouseout", function (d, i) {
        d3.selectAll("path")
          .attr("opacity", null)
      });

    // updates the legend
    d3.selectAll("g#legendBar")
      .remove();

    // make legend
    let dataHeight = 25;
    height = Number(d3.select("svg#lineGraph").attr("height"))
    width = Number(d3.select("svg#lineGraph").attr("width"))

    const legendBar = d3.select("svg#lineGraph")
      .selectAll("g#legendBar")
      .data(stackData)
      .enter()
      .append("g")
      .attr("id", "legendBar")
        .attr('transform', function (d, i) {
          return "translate(" + (width - 100) + ", " + (dataHeight * i) + ")";
        });

    // makes the rectangels for the legendBar
    legendBar.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 20)
      .attr("width", 20)
      .attr("fill", function (d, i) {
        return color(i)
      });

    // append text for the legend
    legendBar.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text(function (d, i) {
        let text = formatText(d, i, updateValues[1])
        return text
      });

  };
};

function colorChose(select, data) {
  const keys = Object.values(data[0])[0]

  if (select === "Age") {
    // makes the color scheme
    var color = d3.scaleLinear()
      .domain([0, Object.keys(keys[select]).length])
      .interpolate(d3.interpolateRgb)
      .range(["darkgrey", "	#7C0A02"]);
  }
  else if (select === "Ratio") {
    var color = d3.scaleLinear()
              .range(["#87ceeb", "#FFB6C1"]);
  }
  else {
    const colors = ["#568203", "#D8BFD8", "#9F8170",
      "#F8DE7E", "#fc8eac", "#FFE5B4", "#FA8072"]

    var color = d3.scaleLinear()
      .domain(Array.from({length: colors.length}, (v, k) => k))
      .range(colors)
  };
  return color
};

// parse the years
function parseYears (years) {

  years.forEach( function (dp, i) {
    years[i] = new Date(Number(dp), 1 ,1);
  });

  return years
}

// format the correct number
function formatScript (number) {
  var digits = number.toString().length - 1
  const multi = Math.pow(10, digits)
  let newNumber = Math.ceil(number / multi) * multi

  return newNumber
};

// Get the area codes with the correct area names
function parseDataCity (data) {
  var areaCodes = {};

  data.features.forEach( function (dp) {
    areaCodes[dp.properties.Gebied] = dp.properties.Gebied_code;
  });

  return areaCodes
};

function minAndMaxValues(data, begin) {
  var array = []
  Object.values(data[begin[0]]).forEach( function (d) {
    array.push(Number(d.bevtotaal))
  });

  return array

};

// parse the correct data for the graph
function parseDataGraph(data, area) {
  var array = []

  Object.values(data[area[0]]).forEach( function (dp) {
    array.push(dp[area[1]])
  });

  return array
};

// makes the menu where you can select the menu
function makeSelectMenu(data, areas) {
  let otherVar = Object.keys(Object.values(Object.values(data)[0])[0])
  otherVar.splice(-1)

  // makes a div for the navigationMenu
  const div = d3.select("div.lineGraph")
    .append("div")
    .attr("id", "selectMenu");

  // make select menu for the stadsdeel
  var makeMenuCityArea = div
    .append("div")
      .attr("class", "selectMenu")
    .append("select")
    .attr("id", "selectCityArea")
    .on("change", function() {
      updateGraph(data, [d3.select(this).property("value"),
      d3.select("select#selectVariable").property("value")])
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
  var choiceVariable = div
    .append("div")
      .attr("class", "selectMenu")
    .append("select")
    .attr("id", "selectVariable")
    .on("change", function () {
      updateGraph(data, [d3.select("select#selectCityArea").property("value"),
      d3.select(this).property("value") ])
    });

  choiceVariable.selectAll("option")
    .data(otherVar)
    .enter()
    .append("option")
    .attr("value", function (dp) {
      return dp;
    })
    .text(function (dp) {
      return dp[0].toUpperCase() + dp.substr(1);
    });

  return [areas[Object.keys(areas).sort()[0]], otherVar[0]]
};

// makes a button
function makeButton(data, area) {

  // makes an button
  d3.select("div#selectMenu")
    .append("button")
    .text("Percentage")
    .on("click", function () {
      if (d3.select(this).text() === "Percentage") {
        d3.select(this).text("Absoluut")
      }
      else {
        d3.select(this).text("Percentage")
      };
      updateGraph(data, [d3.select("select#selectCityArea").property("value"),
        d3.select("select#selectVariable").property("value")])
    });
}


loadData("data/bev_amsterdam.json", "data/GEBIEDEN22.json")
