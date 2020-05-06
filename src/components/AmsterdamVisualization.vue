<template>
    <div>
        <p> VISUALIZATION </p>
    </div>
</template>

<script>
// import * as d3 from "d3";
import geoReferenceData from "../data/GEBIEDEN22.json";
import bevData from "../data/bev_amsterdam.json";

export default {
    data() {
        return {
            loading: false,
            post: null,
            error: null,
            geoReferenceAmsterdam: geoReferenceData,
            dataBevAmsterdam: bevData,
                        
        }
    },
    created() { 

    },
    methods: {
    }
}
</script>