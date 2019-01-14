function loadMap(data) {
var width = 480,
    height = 500;



var projection = d3.geoMercator()
                   .scale(75000)
                   // middle of Amsterdam
                   .center([4.9020727, 52.3717204])
                   .translate([width / 2, height / 2]);

var path = d3.geoPath()
              .projection(projection);

var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)


d3.json(data).then( function (map) {
  console.log(map)
  svg.selectAll("path.land")
      .data(map.features)
      .enter()
      .append("path")
        .attr("class", "land")
        .attr("d", path)
        .style("fill", "black")
        .style("stroke", "black")
        .style("stroke-width", "2px")
})
};

window.onload = function () {
  loadMap("data/GEBIEDEN22.json")


}
