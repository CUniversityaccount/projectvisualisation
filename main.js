function loadData(name) {
  d3.json(name).then(function(data) {
    var coordinates = {}

    data.features.forEach( function (dp) {
      coordinates[dp.properties.Gebied] = dp.geometry.coordinates[0]
    })

    makeSvg(coordinates)

  })
}

function makeSvg(coordinates) {
  let minLat = null
  let maxLat = null
  let minLong = null
  let maxLong = null

  // Get the minimum and maximum coordinates
  Object.keys(coordinates).forEach( function (dp) {
    coordinates[dp].forEach( function (coordinate) {
      if (minLat === null || minLat > coordinate[1]) {
        minLat = coordinate[1]
      }

      else if (maxLat === null || maxLat < coordinate[1]) {
        maxLat = coordinate[1]
      }

      if (minLong === null || minLong > coordinate[0]) {
        minLong = coordinate[0]
      }

      else if (maxLong === null || maxLong < coordinate[0]) {
        maxLong = coordinate[0]
      }
    })
  })

  d3.select("body")
    .append("svg")



}
function main() {
  loadData("data/GEBIEDEN23.json")
}

window.onload = function() {
  main()
}
