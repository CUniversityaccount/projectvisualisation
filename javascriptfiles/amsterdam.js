/*
  Writer: Coen Mol
  Subject: Amsterdam visualisation headpage
*/

// loads data
function loadData(city, name) {
  Promise.all([
    d3.json(city),
    d3.json(name)
  ])
  .then( function(data) {
    layOutWebpage()
    AdamMap(data[0], data[1]);
    makeTimeSliderMap(Object.keys(Object.values(data[1])[0]),
      data[0], data[1]);
  });
};

function layOutWebpage() {
  const width = 600;
  const height = 450;

  // makes title
  var head = d3.select("div.layout")
   .append("h1")
   .attr("id", "titleWebpage")
   .text("Visualisation of Amsterdam")

  // makes div
  d3.select("body")
   .select("div.layout")
   .append("div")
     .attr("id", "mapid")
     .attr("class", "amsterdam")

  d3.select("div#mapid")
    .append("svg")
    .attr("class", "amsterdam")
    .attr("width", width)
    .attr("height", height)
      .append("g")
        .attr("class", "zoomIn")
        .attr("value", false);


  // makes the text element to put the area names in
  d3.select("div.layout")
    .select("div#mapid.amsterdam")
    .append("h2")
    .attr("class", "stadsdeel");
};

// makes the slider for the map
function makeTimeSliderMap(years, dataMap, dataNumbers) {
  const svg = d3.select("svg.amsterdam")
  var dataTime = d3.range(0, (Number(d3.max(years)) - Number(d3.min(years))) )
    .map(function (dp) {
      return new Date(Number(d3.min(years)) + dp, 1, 1)
    });

  let currentVariable = d3.min(years);
  const yearStep = 1000 * Math.pow(60, 2) * 24 * 365;

  // makes the slider
  const sliderTime = d3.sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(yearStep)
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

  const population = populationData(cityData)

  // makes the color
  const step = d3.scaleLinear()
   .domain([0, 3])
   .range([Number(d3.min(population)), Number(d3.max(population))]);

  const color = d3.scaleLinear()
    .domain([d3.min(population), step(1), step(2), step(3)])
    .range(["#FFFF99", "orange", "purple", "	#4E2A84"])
    .interpolate(d3.interpolateRgb)

  const projection = d3.geoConicEquidistant()
   .scale(120000)
   .center(adamCentre)
   .translate([width / 2, height / 2]);

  const path = d3.geoPath()
    .projection(projection);

  // Makes mapfile
  if (d3.select("g.zoomIn").attr("value") === "false") {
    var year = d3.min(Object.keys(Object.values(cityData)[2]))

    makeAdamMap(data, cityData, color, path, year)

    // append legend for the population
    makeLegendAmsterdam(color, population)

    navBarInforGraph(cityData["STAD"][year], "STAD");
    makeRatioBarChart(cityData["STAD"][year]);

    var svg = d3.select("svg.amsterdam")
                .select("g.zoomIn");
  }

  // update the Amsterdam Map
  else {
    var svg = d3.select("svg.amsterdam")
                .select("g.zoomIn");

    // updates the graph to the correct data
    let check = false
    svg.selectAll("path.stadsdeel")
      .data(data.features)
      .each(function (dp) {
        if (d3.select(this).attr("click") === "true" && check === false) {
          graphSelection(cityData[dp.properties.Gebied_code][year], cityData, dp)
          check = true
          return;
        };
      });

    if (check === false) {

      // puts back the graph to the original state
      graphSelection(cityData["STAD"][year], cityData, "STAD")
    };
  };

  // fills the area with correct color
  svg.selectAll("path.stadsdeel")
     .data(data.features)
     .attr("fill", function (dp) {
       return fillAdamMap(color, cityData[dp.properties.Gebied_code][year]);
     })
     .on("mouseover", function (dp) {
      if (d3.select(this).attr("click") === "false") {
        d3.select(this)
          .style("cursor", "pointer")
          .attr("fill", "#5F021F")
      };

      d3.select("h2.stadsdeel").text(dp.properties.Gebied)

    })

    // handles mouseout for the map
    .on("mouseout", function (dp) {

      d3.selectAll("path.stadsdeel")
        .attr("fill", function(dp) {
          return fillAdamMap(color,
            cityData[dp.properties.Gebied_code][year]);
        });

      d3.select("h2.stadsdeel").text("")

      // returns the text of the selected district
      d3.selectAll("path.stadsdeel")
        .each(function (dp) {
          if (d3.select(this).attr("click") === "true") {
            d3.select("h2.stadsdeel").text(dp.properties.Gebied)
          };
        });
    })
    .on("click", function(dp) {
      if (d3.select(this).attr("click") === "true") {

        // update  the values of the navigation menu
        navBarInforGraph(cityData["STAD"][year], "STAD");

        zoomOut(svg)

        /* select the correct polygen and fill it.
        makes an extra visualisation */
        d3.selectAll("path.stadsdeel")
          .data(data.features)
          .attr("click", "false")
          .attr("opacity", 1)

        d3.select("h2.stadsdeel")
          .text("");

        // puts back the graph to the city
        graphSelection(cityData["STAD"][year], cityData, dp)
      }
      else {
        zoomIn(dp)

        // update navigation menu
        navBarInforGraph(cityData[dp.properties.Gebied_code][year],
          dp.properties.Gebied_code);

        /* select the correct polygen and fill it.
          makes an extra visualisation */
        d3.selectAll("path.stadsdeel")
          .data(data.features)
          .attr("click", "false")
          .attr("opacity", 0.5)
          .attr("fill", function(dp) {
            return fillAdamMap(color,
              cityData[dp.properties.Gebied_code][year]);
          });

        // updates the text
        d3.select("h2.stadsdeel")
          .text(dp.properties.Gebied);

        d3.select(this)
          .transition()
          .attr("opacity", 1)
          .attr("click", true);

        // updates the graph that is current selected
        graphSelection(cityData[dp.properties.Gebied_code][year], cityData, dp)
      };
    });

  // makes the first barchart
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

function makeAdamMap(data, cityData, color, path, year) {
  d3.select("g.zoomIn")
    .attr("value", true);

  var svg = d3.select("svg.amsterdam")
    .select("g.zoomIn");

  // makes all the polygons
  svg.selectAll("path.stadsdeel")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class", "stadsdeel")
    .attr("d", path)
    .attr("click", false)
    .attr("fill", function (dp) {
      return fillAdamMap(color, cityData[dp.properties.Gebied_code][year]);
    });

  // make a container where the datavisual is put in
  d3.select("body")
    .select("div.layout")
    .append("div")
      .attr("id", "container")
      .attr("class", "areavisual")
};

function zoomOut(svg) {

  // zoom out
  svg.transition()
    .duration(500)
    .attr("transform", "");
};

// select which graph needs to be updated
function graphSelection(areaData, cityData, dp) {

  // checks if the area is not undefined
  if (areaData != undefined) {
    if (d3.select("g#barChart")._groups[0][0] != null) {
      makeRatioBarChart(areaData);
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
    }

    // changes from no data to the selected graph
    else if (d3.select("g#noValue")._groups[0][0] != null &&
      areaData != undefined) {

        // makes a graph of the selectedbutton
        d3.selectAll("button.visual")
          .each(function () {
            const button = d3.select(this)
            if (button.attr("selected") === "true") {
              if (button.attr("id")  === "Ratio") {
                makeRatioBarChart(areaData);
              }
              else if (button.attr("id") === "Age") {
                makePieBev(areaData.Age,
                      areaData.bevtotaal);
              }
              else {
                if (dp != "STAD") {
                   makeTreeAuto(areaData,
                     "background", dp.properties.Gebied_code);
                }
                else {
                  makeTreeAuto(areaData,
                    "background", dp);
                };
              }
            };
          });
    };
  }

  // shows no data
  else {
    noData(undefined)
  };
};

// color function of the map
function fillAdamMap(color, data) {
  if (data != null) {
    return color(data.bevtotaal)
  }
  else {
    return "grey"
  };
};

// makes a list of the population of that year
function populationData(data) {
  var dataList = []

  Object.keys(data).forEach( function (dp) {

    // skips if it is undefined
    if (dp != "STAD" && dp != undefined) {
      Object.keys(data[dp]).forEach( function (year) {
        dataList.push(Number(data[dp][year].bevtotaal))
      });
    };
  });

  return dataList
};

// makes the legend for the headmap
function makeLegendAmsterdam(color, population) {
  var width = parseInt(d3.select("svg.amsterdam").attr("width").substr(0, 3));
  var height = 75;

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
       .attr("height", height - 55)
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

  // append title for the legend
  svg.append("g")
    .attr('transform', "translate(" + (width / 2) + ", 70)")
    .attr("text-anchor", "middle")
    .attr("id", "legendAmsterdam")
    .append("text")
    .text("Population per District (absolute)")

  const legendBar = svg.append("g")
    .attr("id", "undefined")
    .attr("transform", "translate(0, 50)")


  legendBar.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 15)
    .attr("width", 15)
    .attr("fill", "grey")

  legendBar.append("text")
    .attr("x", 20)
    .attr("y", 15)
    .text("Undefined")
};

// makes navigation for the barChart
function navBarInforGraph(data, stadsdeel) {
  if (data != undefined) {
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
    const properWord = ["Age groups", "Sexes", "Ethnic groups"]

      // makes the visual area
      d3.select("div#container.areavisual")
                    .append("svg")
                      .attr("id", "visual")
                      .attr("height", 400)
                      .attr("width", 400)
                      .attr("padding", 5);

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
              .attr("id", function (dp) { return dp })
              .attr("selected", "false")
              .text(function (dp, i) {
                return properWord[i];
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
                    makeRatioBarChart(data)
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
            .style("background-color", null)

          d3.select(this)
            .attr("selected", "true")
            .style("background-color", "darkgrey")

          if (dp === navElements[0]) {
            makePieBev(data[dp], data.bevtotaal);
          }
          else if (dp === navElements[1]) {
            makeRatioBarChart(data);
          }
          else if (dp === navElements[2]) {
            makeTreeAuto(data, dp, stadsdeel);
          };
        }
      });
    };
  }
  else {
    d3.selectAll("button.visual")
    .on("click", function () {
      noData(d3.select(this))
    })
  }
};

// make a piechart of the population (ages)
function makePieBev(data) {
  const svg = d3.select("svg#visual");
  var height = parseInt(svg.attr("height"))
        width = parseInt(svg.attr("width"))
        thickness = 60
        radius = (Math.max(height, width) - 100) / 2;

  // makes the color scheme
  const color = d3.scaleLinear()
    .domain([0, Object.keys(data).length])
    .interpolate(d3.interpolateRgb)
    .range(["darkgrey", "	#7C0A02"])


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

    // remove existing chart
    d3.select("svg#visual")
      .selectAll("g")
      .remove();

    var g = svg.append("g")
                .attr("id", "pieChart")
                .attr("transform", "translate(" + (width/2) + ", " + (height/2)  + ")");


    // make donut chart
    var path = g.selectAll("path")
      .data(pie(Object.keys(data)))
      .enter()
      .append("g")
      .append("path")
        .attr("id", "pi")
        .attr("d", arc)
        .attr("fill", function (d,i) { return color(i) });

    // make legend
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

  // Dit update in een aparte functie
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
          return "People: " + data[d]
        });

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

  // changes the string to a float
  const groupPopulation = Object.values(sourceData[dp]);
  groupPopulation.forEach( function (d, i) {
    groupPopulation[i] = Number(d)
  });

  const names = ["Antilleans", "Dutch", "Morrocans", "Non-western",
    "Surinameses", "Turks", "Western"];

  const color = TreeMapColor(["#568203", "#D8BFD8", "#9F8170",
      "#F8DE7E", "#fc8eac", "#FFE5B4", "#FA8072"], Object.keys(sourceData[dp]));

  let data = parseTreeData(stadsdeel, sourceData, dp);

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

    title.append("text")
      .attr("dy", 15)
      .attr("dx", Number(d3.select("svg#visual").attr("width")) / 2)
      .attr("text-anchor", "middle")
      .text("Ethnic groups in Amsterdam")

    const treemap = svg.attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(50, 25)")
      .attr("id", "treeMap");

    var rect = treemap.selectAll("g#rect")
      .data(descendants)
      .enter()
      .append("g")
      .attr("id", "rect")
      .attr("transform", function (d) {
        return "translate(" + d.x0 + ", " + d.y0 + ")";
      })

    // Draw the rectangles on the webpage
    rect.append("rect")
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .attr("fill", function (d, i) {
        if (d.parent === null) {
            return "#F8F8F8"
        }
        else {
          return color[d.data.name]
        };
      });

    // append text in the rectangles
    rect.append("text")
      .attr("x", function (d) {
        return (d.x1 - d.x0) / 2;
      })
      .attr("y", function(d) {
        return (d.y1 - d.y0) / 2;
      })
      .attr("text-anchor", "middle")
      .text(function (d) {

        // will set the correct coordinates
        if ((d.y1 - d.y0) > 10  && (d.value / sourceData.bevtotaal) != 1
          && (d.x1 - d.x0) > 10 )  {
          var percentage = parseInt((d.value / sourceData.bevtotaal) * 1000) /10;
          return percentage + "%";
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
            currentDataLength = dataLength;
            dataLength = dataLength + 110;
          };

          return "translate(" + currentDataLength + ", " + (((i % 2) * dataHeight) + height - 65) + ")";
        });

      // makes the rectangles for legend
      legendBar.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 15)
        .attr("width", 15)
        .attr("fill", function (d) {
          return color[d];
        })
        .attr("stroke", "black");

      // appends text for legend
      legendBar.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(function (d, i) {
          return names[i]
        });

  }
  else {
    updateTreeMap(rect, descendants, sourceData.bevtotaal, color)
  };

  // append the rectangles
  svg.select("g#treeMap")
     .selectAll("g#rect")
     .data(descendants)
     .on("mouseover", function (d) {

       // returns the absolute value if the mouse hover
       d3.select(this)
          .select("text")
          .attr("fill", "white")
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
           .attr("fill", "	#960018")
       };

     })
     .on("mouseout", function (d, i) {

       // updates the text back to original
       d3.select(this)
          .select("text")
          .attr("fill", "black")
          .text(function () {

            /* set the text in the correct place and with the correct values */
            if ((d.y1 - d.y0) > 10  && (d.value / sourceData.bevtotaal) != 1
              && (d.x1 - d.x0) > 10 )  {
              var percentage = parseInt((d.value / sourceData.bevtotaal)
               * 1000) /10;
              return percentage + "%"
            };
          });

      // returns the correct color
       if (d.parent != null) {
         d3.select(this)
          .select("rect")
          .attr("fill", function () {
            if (d.parent === null) {
              return "#F8F8F8"
            }
            else {
              return color[d.data.name]
            };
          });
        };
    });
};

function updateTreeMap(rectangles, descendants, totalPopulation, color) {

    const svg = d3.select("svg#visual")

    // update the placement of the rectangles
    const rect = svg.select("g#treeMap")
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
            return color[d.data.name]
          };
        });

    // update text
    rect.select("text")
      .attr("x", function (d) {
        return (d.x1 - d.x0) / 2;
      })
      .attr("y", function(d) {
        return (d.y1 - d.y0) / 2;
      })
      .text(function (d) {
        if ((d.y1 - d.y0) > 10  && (d.value / totalPopulation) != 1
          && (d.x1 - d.x0) > 25 ) {
          var percentage = parseInt((d.value / totalPopulation) * 1000) /10;
          return percentage + "%"
        }
        else {
          return ""
        };
      });
};

function TreeMapColor(color, keys) {
  let dict = {};

  color.forEach( function (dp, i) {
    dict[keys[i]] = dp
  })

  return dict;
}
// change the data format for the treemap
function parseTreeData(stadsdeel, data, dp) {
  let parseData = {name: "STAD", children: []}

  Object.entries(data[dp]).forEach( function (d) {
    parseData.children.push({ name: d[0], size: Number(d[1]) })
  });

  return parseData
};

// makes the barChart for the difference in men and women (biological)
function makeRatioBarChart(data) {

  // make the button selected
  if (d3.select("button#Ratio").attr("selected") === "false" ) {
    d3.selectAll("button").attr("selected", "false")

    d3.select("button#Ratio")
      .attr("selected", true)
      .style("background-color", "grey");
  };

  const stack = d3.stack().offset(d3.stackOffsetNone);
  const stackData = stack.keys(Object.keys(data.Ratio))([data.Ratio])
  const height = 150;
  const width = 300;

  const y = d3.scaleBand()
            .rangeRound([0, height])
            .domain(["1"]);

  const x = d3.scaleLinear()
            .domain([0, data.bevtotaal])
            .range([0, width]);

  const color = d3.scaleLinear()
            .range(["#87ceeb", "#FFB6C1"]);

  // checks if the graph already exists
  if (d3.selectAll("g#barChart")._groups[0].length === 0) {


    // removes existing chart
    d3.select("svg#visual")
      .selectAll("g")
      .remove();

    const svg = d3.select("svg#visual")

    // append title
    svg.append("g")
      .attr("id", "tileBarChart")
      .attr("transform", "translate(100, 25)")
      .append("text")
      .text("Ratio between Women and Men")

    g = svg.append("g")
           .attr("id", "barChart")
           .attr("transform", "translate(0, 50)");

    const serie = g.selectAll(".series")
                  .data(stackData)
                  .enter()
                    .append("g")
                    .attr("class", "series")
                    .attr("fill", function(d, i) { return color(i) })
                    .attr("key", function (d) { return d.key });

     serie.selectAll(".series")
          .data( function(d) { return d })
          .enter()
          .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return x(d[0])})
            .attr("y", y("1"))
            .attr("height", y.bandwidth())
            .attr("width", function(d) {
              return (x(d[1])
              - x(d[0]))})
            .attr("transform", "translate(50, 0)")
            .on("mouseover", handeleMouseOverGraph)
            .on("mouseout", handleMouseOutGraph);

       // append xAxis
       svg.append("g")
          .attr("class", "xAxis")
          .attr("transform", "translate(50, " + (height + 50) + ")")
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
              return "translate(50, " + (height + 100) + ")"
            }
            else {
              return "translate(" +
                (Number(d3.select("svg#visual").attr("width")) * 0.5)
                + ", " + (height + 100) + ")"
             }
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
        .text(function (d, i) {
          return (d.key[3] + d.key.substring(4).toLowerCase())
        });
  }

  // will change the value in the bargraph
  else {
    updateRatio(stackData, x, y)
  };
};

// update the sexes barchart
function updateRatio(data, x, y) {
  const svg = d3.selectAll("svg#visual")
          g = d3.select("g#barChart")

  const serie = g.selectAll("g.series").data(data)

  // change the bar with a good transition
  serie.selectAll("rect.bar").data(function (d)  { return d })
       .transition()
       .attr("x", function (d) { return x(d[0])})
       .attr("y", y("1"))
       .attr("height", y.bandwidth())
       .attr("width", function(d) {
         return (x(d[1]) - x(d[0]))
       });

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

// handles mouse over for the barchart
function handleMouseOutGraph () {
  d3.select("svg#visual")
    .selectAll("text#percPopulation")
    .selectAll("tspan")
    .remove()

  d3.select("svg#visual")
    .selectAll("text#percPopulation")
    .remove()
};

// handles mouse out for the barchart
function handeleMouseOverGraph (d) {
  var width = 300
  var height = 100
  var population = Object.values(d.data)
  var totPopulation = 0

  // changes the array values from string to values
  population.forEach( function (dp) {
    totPopulation = totPopulation + parseInt(dp)
  });

  var perc = (d[1] - d[0]) / totPopulation
  var xPlace = ((d[0] + ((d[1] - d[0]) / 2))/ totPopulation) * width
  var yPlace = height / 2

  // adds total population of women and man
  d3.select("svg#visual")
    .append("text")
    .attr("text-allign", "center")
    .attr("id", "percPopulation")
      .append("tspan")
        .attr("x", xPlace + 25)
        .attr("y", yPlace + 50)
        .text((Math.round(perc * 1000) / 10) + "%");

  // adds percentage women and man
  d3.select("text#percPopulation")
    .append("tspan")
      .attr("x", xPlace - 12.5)
      .attr("y", yPlace + 25)
      .text("Population: " + Math.round(totPopulation * perc));
};

// When the data is undefined
function noData(button) {

  // If the user uses the button while the data is undefined, else skip
  if (button != undefined) {
    // Interactive button change
    d3.selectAll("button.visual")
      .attr("selected", "false")
      .style("background-color", null)

    button.attr("selected", "true")
      .style("background-color", "darkgrey");
    };

  const height = Number(d3.select("svg#visual").attr("height"))
  const width = Number(d3.select("svg#visual").attr("width"))

  let svg = d3.select("svg#visual")

  svg.selectAll("g").remove();

  svg.append("g")
    .attr("id", "noValue")
    .attr("height", height)
    .attr("width", width)
    .append("text")
      .text("No Data")
      .attr("x", height / 2)
      .attr("y", width / 2);
};

loadData("data/GEBIEDEN22.json", "data/bev_amsterdam.json")
