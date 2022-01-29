<template>
  <div>
    <p>VISUALIZATION</p>
    <svg class="amsterdam" :width="width" :height="height" />
  </div>
</template>

<script>
import { select } from "d3-selection";
import { geoPath, geoConicEquidistant } from "d3-geo";
export default {
  data() {
    return {
      width: 600,
      height: 400,
      adamCentre: [4.9020727, 52.3717204],
    };
  },
  mounted() {
    this.drawSVG();
  },
  computed: {},
  methods: {
    drawSVG() {
      const projection = geoConicEquidistant()
        .scale(120000)
        .center(this.adamCentre)
        .translate([this.width / 2, this.height / 2]);

      const path = geoPath().projection(projection);

      let svg = select("svg.amsterdam");
      console.log(svg);
      console.log("test");

      let { features } = this.$store.state.amsterdamArea;
      svg
        .selectAll("path.stadsdeel")
        .data(features)
        .enter()
        .append("path")
        .attr("class", "city-part")
        .attr(
          "id",
          (cityPart) =>
            `${cityPart.properties.Gebied_code} ${cityPart.properties.Gebied}`
        )
        .attr("d", path)
        .attr("stroke", "black")
        .on("click", (e) => {
          console.log(e);
        });
    },
  },
};
</script>