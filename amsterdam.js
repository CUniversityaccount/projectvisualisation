function loadData(name) {
  d3.json(name).then(function(data) {
    var coordinates = {};

    // Parse the data
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

function makeSvg(coordinates) {

  let minLat = null
  let maxLat = null
  let minLong = null
  let maxLong = null

  // Get the minimum and maximum coordinates
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
    .append("svg")
    .attr("class", "amsterdam")
    .attr("width", "600px")
    .attr("viewBox", "-7.5 -2.5 100 70")
    .attr("preserveAspectRatio", "xMidYMid meet");

  return {data: coordinates, extremes: minAndMax}
};

// Makes the amsterdam map
function makeMap(data) {
  const ratioLat = data.extremes["maxlat"] - data.extremes["minlat"]
  const ratioLong = data.extremes["maxlong"] - data.extremes["minlong"]

  var svg = d3.select("body")
              .select("div.layout")
              .select("svg.amsterdam");

  // Make the text element for the countries
  d3.select("div.layout")
    .select("div#container")
     .append("p")
     .attr("class", "stadsdeel");



    // make all the polygons
     svg.selectAll("polygon.stadsdeel")
        .data(Object.keys(data.data))
        .enter()
        .append("polygon")
        .attr("class", "stadsdeel")
        .attr("click", false)
        .attr("fill", "pink")
        .attr("points", function(dp) {
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
        .on("click", function() {
          if (d3.select(this).attr("click") === "true") {
            d3.select(this)
              .attr("click", false)
              .attr("fill", "pink");
          }
          else {
            d3.selectAll("polygon.stadsdeel")
              .attr("click", "false")
              .attr("fill", "pink");

            d3.select(this)
              .attr("fill", "orange")
              .attr("click", true)
            };
        })
        .on("mouseover", function (dp) {
          d3.select("p.stadsdeel")
            .text(dp)
        })
        .on("mouseout", function () {
          d3.select("p.stadsdeel")
            .text("");

        });

};

loadData("data/GEBIEDEN22.json")
