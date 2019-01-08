function loadWebpageLayout() {
  d3.select("body")
    .append("div")
    .attr("class", "layout")
  var navigationMenu = ["Home", "News", "Contact", "About"]
  var navigation = d3.select("body")
                     .select("div.layout")
                     .append("div")
                     .attr("class", "navigation");

  navigation.selectAll("a")
            .data(navigationMenu)
            .enter()
            .append("a")
            .attr("href", function (dp) {
              return "/" + dp.toLowerCase() + ".html";
            })
            .text(function (dp) {
              return dp
            });
};

function main() {
  loadWebpageLayout()
}

window.onload = function () {
  main()
}
