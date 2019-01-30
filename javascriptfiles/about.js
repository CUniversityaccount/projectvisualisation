function makeText() {
  const layout = d3.select("div.layout")

  layout.append("p")
    .attr("id", "upper");

  const text = layout.append("div")
        .attr("id", "text");

  text.append("h1")
    .attr('id', "title")
    .text("About the visualisation")

  const paragraph = text.append("pre")
    .text("This is a visualisation about the population in Amsterdam. \n"
     + "People can see the between the changing population from 2005 until 2017 \n"
     + "This was made for the course Minor Project by the Unversity of Amsterdam")

  text.append("h2")
    .text("Different visualisations")

  text.append('pre')
    .text("There two pages that will show different visualisations \n"
    + "On the home page there will be shown a conic equidimensional projection of Amsterdam \n"
    + "You can click on the different districts in Amsterdam. Each district will show different \n"
    + "data of the age groups, etnic groups and sex ratio of the city. the different options \n"
    + "can be chosen with the help of on the right side buttons. A different year between 2005 \n"
    + "and 2017 can be selected on the slider on the left side on the webpage.")

  text.append("br")

  text.append("pre")
    .text("The second visualisation will show data in an area chart, so people can see \n"
    + "the change of Amsterdam between 2005 and 2018. You choose between the different \n"
    + "districts and topics. You also can see the absolute changes and the perecentage changes \n"
    + "with the help of the button");



};

setTimeout(makeText, 50)
