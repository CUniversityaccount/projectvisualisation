// loads data
function loadData(name) {
  d3.json(name).then( function(data) {
    var coordinates = {};

    // parse the data to the correct format
    data.features.forEach( function (dp) {
      if (dp.geometry.coordinates.length > 1) {
        var tempArray = [];
        dp.geometry.coordinates.forEach(function (dp) {
          tempArray.push(dp[0]);
        });
        coordinates[dp.properties.Gebied] = {coordinates: tempArray, gebiedCode: dp.properties.Gebied_code};
      }

      else {
      coordinates[dp.properties.Gebied] = {coordinates: dp.geometry.coordinates, gebiedCode: dp.properties.Gebied_code};
      };
    });

    // makeDropdown("data/bev_amsterdam.json")
    var information = makeSvg(coordinates)
    loadCityData(information, "data/bev_amsterdam.json")
  });
};

// makes the dropdown menu
function makeDropdown(name) {
  d3.json(name).then(function (data) {
   var dropdown = d3.select('body')
                    .select('div.layout')
                    .append("select")


  });
}

function loadCityData(information, fileName) {
  d3.json(fileName).then( function (data) {
    makeMap(information, data)
    // informationGraph(data[maxYear]);
  });
}

// makes a svg to visualize Amsterdam
function makeSvg(coordinates) {

  let minLat = null
  let maxLat = null
  let minLong = null
  let maxLong = null

  // get the extremes in the datasets
  Object.keys(coordinates).forEach( function (dp) {
    coordinates[dp]["coordinates"].forEach( function (polygon) {

      polygon.forEach( function (coordinate) {
        if (minLat === null || minLat > coordinate[1]) {
          minLat = coordinate[1]
        }
        else if (maxLat === null || maxLat < coordinate[1]) {
          maxLat = coordinate[1]
        };

        if (minLong === null || minLong > coordinate[0]) {
          minLong = coordinate[0]
        }
        else if (maxLong === null || maxLong < coordinate[0]) {
          maxLong = coordinate[0]
        };

      });
    });
  });

  var minAndMax = {minlat: minLat, maxlat: maxLat, minlong: minLong, maxlong: maxLong}

  // Make the container where the amsterdam file is putted
  d3.select("body")
    .select("div.layout")
    .append("div")
      .attr("id", "container")
      .attr("class", "amsterdam")
      .append("svg")
      .attr("class", "amsterdam")
      .attr("width", "600px")
      .attr("viewBox", "-7.5 -2.5 100 70")
      .attr("preserveAspectRatio", "xMidYMid meet");

  return {data: coordinates, extremes: minAndMax}
};

// makes the Amsterdam map
function makeMap(data, cityData) {

    var year = d3.max(Object.keys(cityData[Object.keys(cityData)[0]]))
    var population = []

    Object.keys(cityData).forEach( function (dp) {
      try {
        if (dp != "STAD") {
          population.push(cityData[dp][year].bevtotaal)
        }
      }
      catch(err) {
      };
    });

    // makes the color
    var step = d3.scaleLinear()
                 .domain([1, 3])
                 .range([d3.min(population), d3.max(population)]);

    var color = d3.scaleLinear()
                  .domain([step(1), step(2), step(3)])
                  .range(["white", "#87cefa", "#b22222"])
                  .interpolate(d3.interpolateLab);

    const ratioLat = data.extremes["maxlat"] - data.extremes["minlat"]
    const ratioLong = data.extremes["maxlong"] - data.extremes["minlong"]

    // makes svg file for the map
    var svg = d3.select("body")
                .select("div.layout")
                .select("svg.amsterdam");

    // append legend
    makeLegendAmsterdam(color, population)

    // makes the text element to put the area names in
    d3.select("div.layout")
      .select("div#container.amsterdam")
       .append("p")
       .attr("class", "stadsdeel");

    // makes all the polygons
    svg.selectAll("polygon.stadsdeel")
       .data(Object.keys(data.data))
       .enter()
       .append("polygon")
       .attr("class", "stadsdeel")
       .attr("click", false)
       .attr("fill", function (d) {
                      if (cityData[data.data[d].gebiedCode][year] != null) {
                        return color(cityData[data.data[d].gebiedCode][year].bevtotaal)
                      }
                      else {
                        return "grey"
                      }
                    })
       .attr("points", function(dp) {

         // calculates the coordinates in the canvas
          var string = ""
          data.data[dp].coordinates.forEach( function (d) {
            d.forEach( function (coordinate) {
              var percLong = 100 * (1 - ratioLat) * (coordinate[0] - data.extremes["minlong"]) / (data.extremes["maxlong"] - data.extremes["minlong"]);
              var percLat =  100 * (1 - ratioLong) * (1 - (coordinate[1] - data.extremes["minlat"]) / (data.extremes["maxlat"] - data.extremes["minlat"]));
              string = string + percLong + "," + percLat + " ";
            });
          });
          return string

        })
        .on("click", function(dp) {
          if (d3.select(this).attr("click") === "true") {

            // select the correct polygen and fill it.
            // makes an extra visualisation
            d3.selectAll("polygon.stadsdeel")
              .data(Object.keys(data.data))
              .attr("click", "false")
              .attr("fill", function (d) {
                             if (cityData[data.data[d].gebiedCode][year] != null) {
                               return color(cityData[data.data[d].gebiedCode][year].bevtotaal)
                             }
                             else {
                               return "grey"
                             }
                           })

            d3.select("p.stadsdeel")
              .text("");

            // change the graph to the original state
            informationGraph(cityData["STAD"][year])
          }
          else {
            // select the correct polygen and fill it.
            // makes an extra visualisation
            d3.selectAll("polygon.stadsdeel")
              .data(Object.keys(data.data))
              .attr("click", "false")
              .attr("fill", function (d) {
                             if (cityData[data.data[d].gebiedCode][year] != null) {
                               return color(cityData[data.data[d].gebiedCode][year].bevtotaal)
                             }
                             else {
                               return "grey"
                             }
                           })

              d3.select(this)
                .attr("fill", "orange")
                .attr("click", true);

              d3.select("p.stadsdeel")
                .text(dp);

              if (cityData[data.data[dp].gebiedCode][year] != undefined) {
                informationGraph(cityData[data.data[dp].gebiedCode][year]);
              }
              else {
                informationGraph(cityData["STAD"][year])
              }
            };
        });

        // make a container where the datavisual is put in
        d3.select("body")
          .select("div.layout")
          .append("div")
          .attr("id", "container")
          .attr("class", "areavisual")

      navBarInforGraph(cityData["STAD"][year])
      informationGraph(cityData["STAD"][year])
};

function makeLegendAmsterdam(color, population) {
  var width = parseInt(d3.select("svg.amsterdam").attr("width").substr(0, 3));
  var height = 50;

  const svg = d3.select("div#container.amsterdam")
                .append("svg")
                .attr("id", "amsterdamLegenda")
                .attr("width", width + 25)
                .attr("height", height);

  var svgDefs = svg.append("defs")
  var legend = svgDefs.append("svg:linearGradient")
                      .attr("id", "gradient")
                      .attr("x1", "0%")
                      .attr("y1", "100%")
                      .attr("x2", "100%")
                      .attr("y2", "100%")
                      .attr("spreadMethod", "pad");

  // append stops
  legend.selectAll("stop")
        .data([
        {offset: "0%", color: color(d3.min(population))},
        {offset: "25%", color: color((25/100) * d3.max(population))},
        {offset: "50%", color: color((50/100) * d3.max(population))},
        {offset: "75%", color: color((75/100) * d3.max(population))},
        {offset: "100%", color: color(d3.max(population))},
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
function navBarInforGraph(data) {
  console.log(data)
  var height = 50;
  var width = 400;
  var index = null;
  var navElements = Object.keys(data)

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

  div.selectAll("a.barChart")
      .data(navElements)
      .enter()
        .append("button")
          .attr("class", "barChart")
          .style("width", Math.round((1/3) * width) + "px" )
          .style("height", height + "px")
          .style("float", "left")
          .attr("key", function (dp) { return dp })
          .text(function (dp) { return dp.charAt(0).toUpperCase() + dp.substr(1, 10) });


};

function informationGraph(data) {
  const stack = d3.stack().offset(d3.stackOffsetExpand);
  var stackData = stack.keys(Object.keys(data.general))([data.general])
  const height = 100;
  const width = 300;

  var y = d3.scaleBand()
            .rangeRound([0, height])
            .domain(["1"]);

  var x = d3.scaleLinear()
            .domain([0, data.bevtotaal])
            .range([0, width]);

  var z = d3.scaleLinear()
            .range(["#87ceeb", "#FFB6C1"]);

  if (d3.selectAll("svg#barChart")._groups[0].length === 0) {
    const svg = d3.select("div#container.areavisual")
                  .append("svg")
                    .attr("id", "barChart")
                    .attr("height", height + 50)
                    .attr("width", width + 100)
                    .attr("padding", 5);

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
            .attr("width", function(d) { return (x(d[1] * Number(data.bevtotaal)) - x(d[0] * Number(data.bevtotaal)))})
            .attr("transform", "translate(50, 0)")
            .on("mouseover", handeleMouseOverGraph)
            .on("mouseout", handleMouseOutGraph);

       // append xAxis
       d3.select("svg#barChart").append("g")
          .attr("class", "xAxis")
          .attr("transform", "translate(50, " + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

       // append yAxis
       d3.select("svg#barChart").append("g")
          .attr("transform", "translate(50, 0)")
          .attr("class", "yAxis")
          .call(d3.axisLeft(y));

       d3.select("svg#barChart").append("g")
         .attr("transform", "translate(" + (width + 50) + ", 0)")
         .attr("class", "yAxis")
         .call(d3.axisRight(y));

       // remove tick
       d3.selectAll("g.yAxis")
         .selectAll("g.tick")
         .remove();
  }

  // will change the value in the bargraph
  else {
     const svg = d3.selectAll("svg#barChart")
             g = d3.select("g#barChart")

     var serie = g.selectAll("g.series").data(stackData)

     // change the bar with a good transition
     serie.selectAll("rect.bar").data(function (d)  { return d })
          .transition()
          .attr("x", function (d) { return x(d[0] * Number(data.bevtotaal))})
          .attr("y", y("1"))
          .attr("height", y.bandwidth())
          .attr("width", function(d) { return (x(d[1] * Number(data.bevtotaal)) - x(d[0] * Number(data.bevtotaal)))})

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
  d3.select("svg#barChart")
    .selectAll("text#percPopulation")
    .selectAll("tspan")
    .remove()

  d3.select("svg#barChart")
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
  d3.select("svg#barChart")
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
