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
    var information = makeSvg(coordinates)

    makeMap(information)
  });
};

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
function makeMap(data) {
  const ratioLat = data.extremes["maxlat"] - data.extremes["minlat"]
  const ratioLong = data.extremes["maxlong"] - data.extremes["minlong"]

  var svg = d3.select("body")
              .select("div.layout")
              .select("svg.amsterdam");

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
     .attr("fill", "pink")
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

          // refers it back to its original state
          d3.select(this)
            .attr("click", false)
            .attr("fill", "pink");
          d3.select("p.stadsdeel")
            .text("");

          d3.select("div#container.areavisual")
            .selectAll("svg")
            .remove();
        }
        else {

            // select the correct polygen and fill it.
            // makes an extra visualisation
            d3.selectAll("polygon.stadsdeel")
              .attr("click", "false")
              .attr("fill", "pink");

            d3.select(this)
              .attr("fill", "orange")
              .attr("click", true);

            d3.select("p.stadsdeel")
              .text(dp);

            loadCityData("data/bev_amsterdam.json", data.data[dp]);
          };
      });

      // make a container where the datavisual is put in
      d3.select("body")
        .select("div.layout")
        .append("div")
        .attr("id", "container")
        .attr("class", "areavisual")
};

function informationGraph(data) {
  const stack = d3.stack().offset(d3.stackOffsetExpand);
  var stackData = stack.keys(Object.keys(data.general))([data.general])
  const height = 300;
  const width = 300;

  const svg = d3.select("div#container.areavisual")
                .append("svg")
                .attr("id", "barchart")

        g = svg.append("g").attr("id", "barchart")

  var y = d3.scaleBand()
            .rangeRound([0, height])
            .domain(["1"]);

  var x = d3.scaleLinear()
            .domain([0, data.BEVTOTAAL])
            .range([0, width]);

  var z = d3.scaleLinear()
            .range(["#87ceeb", "#FFB6C1"]);

  var serie = g.selectAll(".series")
               .data(stackData)
               .enter()
               .append("g")
               .attr("class", "series")
               .attr("fill", function(d, i) { return z(i) })
               .attr("key", function (d) { return d.key });

  serie.selectAll(".series")
       .data( function(d) { console.log(d)
                            return d })
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr("x", function (d) { return x(d[0] * Number(data.BEVTOTAAL)) })
       .attr("y", y("1"))
       .attr("height", y.bandwidth())
       .attr("width", function(d) { return x(d[1] * Number(data.BEVTOTAAL)) - x(d[0] * Number(data.BEVTOTAAL))})


  // append xAxis
  svg.append("g")
     .attr("class", "xAxis")
     .attr("transform", "translate(0, " + height + ")")
     .call(d3.axisBottom(x));

  // append yAxis
  svg.append("g")
     .attr("transform", "translate(0,0)")
     .attr("class", "yAxis")
     .call(d3.axisLeft(y));


  var z = d3.scaleOrdinal()
            .range(["pink", "blue"]);




}

function loadCityData(fileName, name) {

  d3.json(fileName).then( function (data) {
    var data = data[name.gebiedCode]

    var maxYear = d3.max(Object.keys(data));

    informationGraph(data[maxYear]);
  });

}

loadData("data/GEBIEDEN22.json")
