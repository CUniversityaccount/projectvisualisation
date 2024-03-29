function loadWebpageLayout() {
  var mainUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"))
  d3.select("body")
    .append("div")
    .attr("class", "layout")
  var navigationMenu = ["Home", "Specific", "About"]
  var navigation = d3.select("body")
                     .select("div.layout")
                     .append("div")
                     .attr("class", "navigation");

  navigation.selectAll("a")
            .data(navigationMenu)
            .enter()
            .append("a")
            .attr("href", function (dp) {
              return window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + "/" + dp.toLowerCase() + ".html";
            })
            .text(function (dp) {
              if (dp === "Specific") {
                return dp + " info"
              }
              else { return dp }

            });
};

function main() {
  loadWebpageLayout()
}

window.onload = function () {
  main()
}
