
// hier nog navragen
// loads data
function loadData(name) {
  d3.json(name).then( function(data) {
    loadCityData(data, "data/bev_amsterdam.json")
  });
};

// loads the data
function loadCityData(information, fileName) {
  d3.json(fileName).then( function (data) {
    AdamMap(information, data);
    makeTimeSliderMap(Object.keys(Object.values(data)[0]),
      information, data);

  });
};

// makes the slider for the map
function makeTimeSliderMap(years, dataMap, dataNumbers) {
  const svg = d3.select("svg.amsterdam")
  var dataTime = d3.range(0, (Number(d3.max(years)) - Number(d3.min(years))) )
    .map(function (dp) {
      return new Date(Number(d3.min(years)) + dp, 1, 1)
    });

  let currentVariable = d3.min(years)
  var sliderTime = d3.sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(Number(d3.select("svg.amsterdam").attr("width")) - 50)
    .tickValues(dataTime)
    .tickFormat(d3.timeFormat("%Y"))
    .default(d3.min(years))
    .on('onchange', function (year) {
      d3.select('p#value-time').text(d3.timeFormat('%Y')(year));
      if (Number(d3.timeFormat("%Y")(year)) != currentVariable) {
        currentVariable = Number(d3.timeFormat("%Y")(year))
        AdamMap(dataMap, dataNumbers, currentVariable)
      };
    });

  var rect = svg.append("rect")
    .attr("class", "backgroundSlider");

  var gSlider = svg.append("g")
    .attr("id", "slider")
    .attr("transform", "translate(25, 25)");

  gSlider.call(sliderTime);

  // makes the background for the slider
  rect.attr("width", d3.select("g#slider").node().getBoundingClientRect().width)
    .attr("height", d3.select("g#slider").node().getBoundingClientRect().height + 5)
    .attr("fill", "#F8F8F8")


};

// makes the Amsterdam map
function AdamMap(data, cityData, year) {

  const width = 600;
  const height = 450;

  // coordinates of Amsterdamcentre
  const adamCentre = [4.9020727, 52.3717204]

  var population = populationData(cityData)

  // makes the color
  var step = d3.scaleLinear()
   .domain([0, 3])
   .range([Number(d3.min(population)), Number(d3.max(population))]);

  var color = d3.scaleLinear()
    .domain([d3.min(population), step(1), step(2)])
    .range(["#CDCDCD", "lightgreen", "#4682B4"])
    .interpolate(d3.interpolateLab);

  var projection = d3.geoConicEquidistant()
   .scale(120000)
   // middle of Amsterdam
   .center(adamCentre)
   .translate([width / 2, height / 2]);

  var path = d3.geoPath()
    .projection(projection);

  // checks if the svg exists
  if (d3.select("svg.amsterdam")._groups[0][0] === null) {

    // makes title
    var head = d3.select("div.layout")
                 .append("h1")
                 .attr("id", "titleWebpage")
                 .text("Visualisatie van Amsterdam")
    console.log(cityData)
    var year = d3.min(Object.keys(Object.values(cityData)[2]))
    console.log(year)
    var svg =   d3.select("body")
      .select("div.layout")
      .append("div")
        .attr("id", "mapid")
        .attr("class", "amsterdam")
        .append("svg")
        .attr("class", "amsterdam")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("class", "zoomIn");

    // append legend for the population
    makeLegendAmsterdam(color, population)

    // makes the text element to put the area names in
    d3.select("div.layout")
      .select("div#mapid.amsterdam")
      .append("p")
      .attr("class", "stadsdeel");

    // makes all the polygons
    svg.selectAll("path.stadsdeel")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "stadsdeel")
      .attr("d", path)
      .attr("click", false)
      .attr("fill", function (dp) {
        console.log(cityData[dp.properties.Gebied_code])
        return fillAdamMap(color, cityData[dp.properties.Gebied_code][year],
          d3.select(this).attr("click"));
      });

    // make a container where the datavisual is put in
    d3.select("body")
      .select("div.layout")
      .append("div")
        .attr("id", "container")
        .attr("class", "areavisual")

    navBarInforGraph(cityData["STAD"][year], "STAD");
    informationGraph(cityData["STAD"][year]);
  }

  // update the Amsterdam Map
  else {

    var svg = d3.select("svg.amsterdam")
                .select("g.zoomIn");

    // updates the graph to the correct data
    var check = false
    svg.selectAll("path.stadsdeel")
      .data(data.features)
      .each(function (dp) {
        if (d3.select(this).attr("click") != "false" && check === false) {
          graphSelection(cityData[dp.properties.Gebied_code][year], cityData, dp)
          check = true
        };
      })

    if (check === false) {

      // puts back the graph to the original state
      graphSelection(cityData["STAD"][year], cityData, "STAD")
    };
  };

  svg.selectAll("path.stadsdeel")
     .data(data.features)
     .attr("fill", function (dp) {
       return fillAdamMap(color, cityData[dp.properties.Gebied_code][year],
         d3.select(this).attr("click"));
     })
     .on("mouseover", function () {
      d3.select(this)
        .style("cursor", "pointer")
        .attr("fill", "pink");
    })
  .on("mouseout", function (dp) {
      if (d3.select(this).attr("click") != "false") {
        d3.select(this)
            .attr("fill", "pink");
      }
    else {
      d3.selectAll("path.stadsdeel")
        .attr("fill", function(dp) {
          return fillAdamMap(color, cityData[dp.properties.Gebied_code][year],
            d3.select(this).attr("click"))
      });
    };
  })
  .on("click", function(dp) {
    if (d3.select(this).attr("click") === "true") {

      // update navigation menu
      navBarInforGraph(cityData["STAD"][year], "STAD");

      // zoom out
      svg.transition()
          .duration(500)
          .attr("transform", "");


      /* select the correct polygen and fill it.
       makes an extra visualisation */
      d3.selectAll("path.stadsdeel")
        .data(data.features)
        .attr("click", "false")
        .attr("fill", function (dp) {
          return fillAdamMap(color,
            cityData[dp.properties.Gebied_code][year],
            d3.select(this).attr("click"))
        });

      d3.select("p.stadsdeel")
        .text("");

      // puts back the graph to the original state
      graphSelection(cityData["STAD"][year], cityData, dp)
    }
    else {
      zoomIn(dp)

      if (cityData[dp.properties.Gebied_code][year] != undefined) {

        // update navigation menu
        navBarInforGraph(cityData[dp.properties.Gebied_code][year],
          dp.properties.Gebied_code);
      };

      /* select the correct polygen and fill it.
        makes an extra visualisation */
      d3.selectAll("path.stadsdeel")
        .data(data.features)
        .attr("click", "false")
        .attr("fill", function (dp) {
            return fillAdamMap(color,
              cityData[dp.properties.Gebied_code][year],
              d3.select(this).attr("click"));
        });

    d3.select(this)
      .attr("fill", "pink")
      .attr("click", true);

    d3.select("p.stadsdeel")
      .text(dp.properties.Gebied);

    graphSelection(cityData[dp.properties.Gebied_code][year], cityData, dp)
  };
});

  navBarInforGraph(cityData["STAD"][year], "STAD");

  // zooms in on the specific area
  function zoomIn(data) {
    var bounds = path.bounds(data)
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .3 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(500)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
  };
};

// select which graph needs to be updated
function graphSelection(areaData, cityData, dp) {
  if (areaData != undefined) {
    if (d3.select("g#barChart")._groups[0][0] != null) {
      informationGraph(areaData);
    }
    else if (d3.select("g#pieChart")._groups[0][0] != null) {
      makePieBev(areaData.Age,
            areaData.bevtotaal);
    }
    else if (d3.select("g#treeMap")._groups[0][0] != null) {
      if (dp != "STAD") {
         makeTreeAuto(areaData,
           "background", dp.properties.Gebied_code);
      }
      else {
        makeTreeAuto(areaData,
          "background", dp);
      };
    };
  };
};


// color function of the map
function fillAdamMap(color, data, element) {
  if (data != null && element != "true") {
    return color(data.bevtotaal)
  }
  else if (data === undefined && element != "true") {
    return "grey"
  }
  else {
    return "pink"
  };
}

// makes a list of the population of that year
function populationData(data) {
  var dataList = []

  Object.keys(data).forEach( function (dp) {
    try {
      if (dp != "STAD") {
        Object.keys(data[dp]).forEach( function (year) {
          dataList.push(Number(data[dp][year].bevtotaal))
        });
      };
    }
    catch(err) {
    };
  });

  return dataList
};

// makes the legend for the headmap
function makeLegendAmsterdam(color, population) {
  var width = parseInt(d3.select("svg.amsterdam").attr("width").substr(0, 3));
  var height = 50;

  const svg = d3.select("div#mapid.amsterdam")
                .append("svg")
                .attr("id", "amsterdamLegenda")
                .attr("width", width)
                .attr("height", height);

  var svgDefs = svg.append("defs")
  var legend = svgDefs.append("svg:linearGradient")
                      .attr("id", "gradient")
                      .attr("x1", "0%")
                      .attr("y1", "100%")
                      .attr("x2", "100%")
                      .attr("y2", "100%")
                      .attr("spreadMethod", "pad");

  var minPop = d3.min(population)
  var maxPop = d3.max(population)

  // append stops
  legend.selectAll("stop")
        .data([
        {offset: "0%", color: color(minPop)},
        {offset: "25%", color: color(((25/100) * (maxPop - minPop)) + minPop)},
        {offset: "50%", color: color(((50/100) * (maxPop - minPop)) + minPop)},
        {offset: "75%", color: color(((75/100) * (maxPop - minPop)) + minPop)},
        {offset: "100%", color: color(maxPop)},
        ])
        .enter()
        .append("stop")
        .attr("offset", function (d) { return d.offset })
        .attr("stop-color", function (d) { return d.color })
        .attr("stop-opacity", 1);

  // append rectangle
  svg.append("rect")
       .attr("width", width)
       .attr("height", height - 30)
       .style("fill", "url(#gradient)")
       .attr("transform", "translate(0, 10)");

  var y = d3.scaleLinear()
            .range([width, 0])
            .domain([d3.max(population), d3.min(population)]);

  var yAxis = d3.axisBottom()
                .scale(y)

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,30)")
    .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("axis title");

};

// makes navigation for the barChart
function navBarInforGraph(data, stadsdeel) {

  var navElements = Object.keys(data)
  var height = 50;
  var width = 400;
  var index = null;
  if (d3.select("div.barNavigation#container")._groups[0][0] == null) {
    var div = d3.select("div.areavisual")
                .append("div")
                  .attr("class", "barNavigation")
                  .attr("id", "container")
                  .attr("height", height)
                  .attr("width", width);

    Object.keys(data).forEach( function (dp) {
      if (dp.includes("bev")) {
        index = navElements.indexOf(dp)
      };
    });
    navElements.splice(index, 1)
    div.selectAll("button.visual")
        .data(navElements)
        .enter()
          .append("button")
            .attr("class", "visual")
            .style("width", Math.round((1/3) * width) + "px" )
            .style("height", height + "px")
            .style("float", "left")
            .attr("key", function (dp) { return dp })
            .attr("selected", "false")
            .text(function (dp) {
               return dp.charAt(0).toUpperCase() + dp.substr(1, 10)
             })
            .on("click", function (dp) {
              d3.selectAll("button.barChart").attr("selected", "false")
              if (d3.select(this).attr("selected") === "false") {
                d3.selectAll("button.visual")
                  .attr("selected", "false")

                d3.select(this)
                  .attr("selected", "true")

                if (dp === navElements[0]) {
                  makePieBev(data[dp], data.bevtotaal);
                }
                else if (dp === navElements[1]) {
                  informationGraph(data)
                }
                else if (dp === navElements[2]) {
                  makeTreeAuto(data, dp, stadsdeel);
                };
              }
            });
  }
  else {

    d3.selectAll("button.visual")
    .data(navElements)
    .on("click", function (dp) {
      d3.selectAll("button.barChart").attr("selected", "false")
      if (d3.select(this).attr("selected") === "false") {
        d3.selectAll("button.visual")
          .attr("selected", "false")

        d3.select(this)
          .attr("selected", "true")

        if (dp === navElements[0]) {
          makePieBev(data[dp], data.bevtotaal);
        }
        else if (dp === navElements[1]) {
          informationGraph(data);
        }
        else if (dp === navElements[2]) {

          makeTreeAuto(data, dp, stadsdeel);
        };
      }
    });
  };
};

// makes a piechart of the population (ages)
function makePieBev(data) {

  const svg = d3.select("svg#visual");
  var height = parseInt(svg.attr("height"))
        width = parseInt(svg.attr("width"))
        thickness = 60
        radius = (Math.max(height, width) - 100) / 2;
        color = d3.scaleOrdinal(d3.schemeCategory10);

  // makes a block of the svg
  svg.attr('height', Math.max(width, height))
    .attr('width', Math.max(width, height));

  width = Math.max(width, height)
  height = Math.max(width, height)

  var arc = d3.arc()
              .innerRadius(radius - thickness)
              .outerRadius(radius)
              .padAngle(0.02);

  var pie = d3.pie()
              .value(function(d) { return data[d] })
              .sort(null);

  if (d3.select("g#pieChart")._groups[0][0] === null) {

    // removes existing chart
    d3.select("svg#visual")
      .selectAll("g")
      .remove();

    var g = svg.append("g")
                .attr("id", "pieChart")
                .attr("transform", "translate(" + (width/2) + ", " + (height/2)  + ")");


    // makes donut chart
    var path = g.selectAll("path")
      .data(pie(Object.keys(data)))
      .enter()
      .append("g")
      .append("path")
        .attr("id", "pi")
        .attr("d", arc)
        .attr("fill", function (d,i) { return color(i) });

    //makes legend
    var dataHeight = 25;
    var dataLength = 80;

    let legendBar = svg.selectAll("g#legendBar")
      .data(Object.keys(data))
      .enter()
      .append("g")
        .attr("id", "legendBar")
        .attr("transform", function (d, i) {
          if (i < 3) {
            return "translate(0, " + (i * dataHeight) + ")"
          }
          else {
            return "translate(" + dataLength + ", "
              + ((i % 3) * dataHeight) + ")"
          };
        });

    // makes the rectangles
    legendBar.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 20)
      .attr("width", 20)
      .attr("fill", function (d, i) {
        return color(i);
      })
      .attr("stroke", "black");

    // appends text
    legendBar.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .text(function (d) {

        // formats the text to the correct format
        if (d.toLowerCase().includes("plus")) {
          return d.substring(3, 5) + "+"
        }
        else if (d.includes("0_") && d.includes("17")) {
          return "<" + d.substring(5)
        }
        else {
          var string = d
          string = string.replace(/_/g, "-")
          return string.substring(3)

        };
      });

  }
  else {

    // updates donut chart
    d3.select("g#pieChart")
      .selectAll("path#pi")
      .data(pie(Object.keys(data)))
      .transition()
      .attr("d", arc)
      .attr("fill", function (d,i) { return color(i) })

  };

  d3.select("g#pieChart")
    .selectAll("path#pi")
    .data(Object.keys(data))
    .on("mouseover", function (d) {

      // adds text
      d3.select("svg#visual")
        .append("g")
        .attr("id", "textPie")
        .attr("transform", "translate(" + (width / 2) +", " + (height / 2) + ")")
        .append("text")
        .attr("text-anchor", "middle")
        .text(function () {
          return "Aantal mensen: " + data[d]
        })

      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", "2px")
    })
    .on("mouseout", function (d) {
      d3.select("svg#visual")
        .select("g#textPie")
        .remove()

      d3.select(this)
        .style("stroke", null)
    });
};

// makes a tree map
function makeTreeAuto(sourceData , dp, stadsdeel) {

  const svg = d3.select("svg#visual")

  const values = Object.values(sourceData[dp]);
  values.forEach( function (d, i) {
    values[i] = Number(d)
  });

  const color = d3.scaleLinear()
                  .domain([0, Object.keys(sourceData[dp]).length])
                  .range(["lightgrey", "green"]);

  let data = parseTreeData(stadsdeel, sourceData, dp)

  const height = width = Math.max(parseInt(svg.attr("height")),
    parseInt(svg.attr("width")));

  const layout = d3.treemap()
                   .size([width - 100, height - 100])
                   .padding(3);

  var root = d3.hierarchy(data).sum( function (d) { return d.size });
  var descendants = root.descendants();
  layout(root);

  if (d3.select("g#treeMap")._groups[0][0] === null) {

    // removes existing chart
    d3.select("svg#visual")
      .selectAll("g")
      .remove();

    // append title
    var title = svg.append("g")
      .attr("id", "title")

    title.append("rect")
      .attr("width", width)
      .attr("height", 50)
      .attr("fill", "#F8F8F8")

    title.append("text")
      .attr("dy", 20)
      .attr("dx", 150)
      .text("Communities")

    const treemap = svg.attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(50, 50)")
      .attr("id", "treeMap");

    var rect = treemap.selectAll("g#rect")
                        .data(descendants)
                        .enter()
                        .append("g")
                        .attr("id", "rect")
                        .attr("transform", function (d) {
                          return "translate(" + d.x0 + ", " + d.y0 + ")"
                        })

    // Draw on screen
    rect.append("rect")
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .attr("fill", function (d, i) {
          if (d.parent === null) {
              return "#F8F8F8"
          }
          else {
            return color(i)
          };
        });

    // append text
    rect.append("text")
      .attr("dx", 4)
      .attr("dy", 14)
      .text(function (d) {
        if ((d.y1 - d.y0) > 10  && (d.value / sourceData.bevtotaal) != 1
          && (d.x1 - d.x0) > 10 )  {
          var percentage = parseInt((d.value / sourceData.bevtotaal) * 1000) /10
          return percentage + "%"
        }
        else {
          return ""
        };
      });

    // append legend
    let dataHeight = 25;
    let dataLength = 0;

    let legendBar = svg.selectAll("g#legendTree")
      .data(Object.keys(sourceData[dp]))
      .enter()
      .append("g")
        .attr("id", "legendTree")
        .attr("transform", function (d, i) {
          if ((i % 2) === 0) {
            currentDataLength = dataLength
            dataLength = dataLength + 90
          }

          return "translate(" + currentDataLength + ", " + (((i % 2) * dataHeight) + height - 40) + ")"
        });

      // makes the rectangles for legend
      legendBar.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 15)
        .attr("width", 15)
        .attr("fill", function (d, i) {
          return color(i);
        })
        .attr("stroke", "black");

      // appends text for legend
      legendBar.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(function (d) {
          return d[3] + d.substring(4).toLowerCase()
        });

  }
  else {

    // update the placement of the rectangles
    var rect = svg.select("g#treeMap")
      .selectAll("g#rect")
      .data(descendants)
      .transition()
      .attr("transform", function (d) {
        return "translate(" + d.x0 + ", " + d.y0 + ")"
      });

    //update the size of the rectangles
    rect.select("rect")
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .attr("fill", function(d, i) {
        if (d.parent === null) {
            return "#F8F8F8"
          }
          else {
            return color(i)
          };
        });

    // update text
    rect.select("text")
      .text(function (d) {
        if ((d.y1 - d.y0) > 10  && (d.value / sourceData.bevtotaal) != 1
          && (d.x1 - d.x0) > 25 ) {
          var percentage = parseInt((d.value / sourceData.bevtotaal) * 1000) /10
          return percentage + "%"
        }
        else {
          return ""
        };
      });
  };

  // append the rectangles
  svg.select("g#treeMap")
     .selectAll("g#rect")
     .data(descendants)
     .on("mouseover", function (d) {

       // returns the absolute value
       d3.select(this)
          .select("text")
          .text(function () {
            if ((d.y1 - d.y0) > 10  && (d.value / sourceData.bevtotaal) != 1
              && (d.x1 - d.x0) > 10 )  {
              return d.value
            }
            else {
              return ""
            };
          });

      // fill the hovered rectangle in pink
       if (d.parent != null) {
         d3.select(this)
           .select("rect")
           .attr("fill", "pink")
       };

     })
     .on("mouseout", function (d, i) {

       // updates the text back to original
       d3.select(this)
          .select("text")
          .text(function () {
            if ((d.y1 - d.y0) > 10  && (d.value / sourceData.bevtotaal) != 1
              && (d.x1 - d.x0) > 10 )  {
              var percentage = parseInt((d.value / sourceData.bevtotaal) * 1000) /10
              return percentage + "%"
            }
            else {
              return ""
            };
          });

      // returns the correct color
       if (d.parent != null) {
         d3.select(this)
          .select("rect")
           .attr("fill", function () { if (d.parent === null) {
                 return "#F8F8F8"
        }
        else {
          return color(i)
        };
      });
     };
    });
};

// change the data format for the treemap
function parseTreeData(stadsdeel, data, dp) {
  let parseData = {name: "STAD", children: []}

  Object.entries(data[dp]).forEach( function (d) {
    parseData.children.push({ name: d[0], size: Number(d[1]) })
  });

  return parseData
};

// makes the barChart for the difference in men and women (biological)
function informationGraph(data) {
  const stack = d3.stack().offset(d3.stackOffsetExpand);
  var stackData = stack.keys(Object.keys(data.Ratio))([data.Ratio])
  const height = 150;
  const width = 300;

  var y = d3.scaleBand()
            .rangeRound([0, height])
            .domain(["1"]);

  var x = d3.scaleLinear()
            .domain([0, data.bevtotaal])
            .range([0, width]);

  var z = d3.scaleLinear()
            .range(["#87ceeb", "#FFB6C1"]);

  // checks if there isnt already an area for visualisation
  if (d3.selectAll("svg#visual")._groups[0].length === 0) {
    const svg = d3.select("div#container.areavisual")
                  .append("svg")
                    .attr("id", "visual")
                    .attr("height", 400)
                    .attr("width", width + 100)
                    .attr("padding", 5);

  };

  // checks if the graph already exists
  if (d3.selectAll("g#barChart")._groups[0].length === 0) {

    // removes existing chart
    d3.select("svg#visual")
      .selectAll("g")
      .remove();

    const svg = d3.select("svg#visual")

    g = svg.append("g")
           .attr("id", "barChart");

    var serie = g.selectAll(".series")
                  .data(stackData)
                  .enter()
                    .append("g")
                    .attr("class", "series")
                    .attr("fill", function(d, i) { return z(i) })
                    .attr("key", function (d) { return d.key });

     serie.selectAll(".series")
          .data( function(d) { return d })
          .enter()
          .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return x(d[0] * Number(data.bevtotaal))})
            .attr("y", y("1"))
            .attr("height", y.bandwidth())
            .attr("width", function(d) {
              return (x(d[1] * Number(data.bevtotaal))
              - x(d[0] * Number(data.bevtotaal)))})
            .attr("transform", "translate(50, 0)")
            .on("mouseover", handeleMouseOverGraph)
            .on("mouseout", handleMouseOutGraph);

       // append xAxis
       d3.select("svg#visual").append("g")
          .attr("class", "xAxis")
          .attr("transform", "translate(50, " + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

       // remove tick
       d3.selectAll("g.yAxis")
         .selectAll("g.tick")
         .remove();

      // makes legend
      var offSet = 100;
      var dataL = 20;

      let legendBar = svg.selectAll("g#legendBar")
        .data(stackData)
        .enter()
        .append("g")
          .attr("id", "legendBar")
          .attr("transform", function (d, i) {
            if (i === 0) {
              return "translate(50, " + (height + 50) + ")"
            }
            else {
              return "translate(" +
                (Number(d3.select("svg#visual").attr("width")) * 0.5)
                + ", " + (height + 50) + ")"
             }
          });

      // makes the rectangles
      legendBar.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 20)
        .attr("width", 20)
        .attr("fill", function (d, i) {
          return z(i);
        })
        .attr("stroke", "black");

      // appends text
      legendBar.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(function (d, i) {
          return (d.key[3] + d.key.substring(4).toLowerCase())
        });
  }

  // will change the value in the bargraph
  else {
     const svg = d3.selectAll("svg#visual")
             g = d3.select("g#barChart")

     var serie = g.selectAll("g.series").data(stackData)

     // change the bar with a good transition
     serie.selectAll("rect.bar").data(function (d)  { return d })
          .transition()
          .attr("x", function (d) { return x(d[0] * Number(data.bevtotaal))})
          .attr("y", y("1"))
          .attr("height", y.bandwidth())
          .attr("width", function(d) { return (x(d[1] * Number(data.bevtotaal))
            - x(d[0] * Number(data.bevtotaal)))});

      // change the x axis
      d3.select("g.xAxis")
        .transition()
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", ".35em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");
    };
};

function handleMouseOutGraph (d, i) {
  d3.select("svg#visual")
    .selectAll("text#percPopulation")
    .selectAll("tspan")
    .remove()

  d3.select("svg#visual")
    .selectAll("text#percPopulation")
    .remove()
};

function handeleMouseOverGraph (d, i) {
  var width = 300
  var height = 100
  var population = Object.values(d.data)
  var totPopulation = 0

  population.forEach( function (dp) {
    totPopulation = totPopulation + parseInt(dp)
  });

  var perc = -1 * ( d[0] - d[1] )
  var xPlace = ((d[0] + d[1]) / 2) * width
  var yPlace = height / 2

  // adds total population of women and man
  d3.select("svg#visual")
    .append("text")
    .attr("text-allign", "center")
    .attr("id", "percPopulation")
      .append("tspan")
        .attr("x", xPlace + 25)
        .attr("y", yPlace)
        .text((Math.round(perc * 1000) / 10) + "%");

  // adds percentage women and man
  d3.select("text#percPopulation")
    .append("tspan")
      .attr("x", xPlace - 12.5)
      .attr("y", yPlace - 25)
      .text("Population: " + Math.round(totPopulation * perc));

};

loadData("data/GEBIEDEN22.json")
