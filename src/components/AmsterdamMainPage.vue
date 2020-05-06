<template>
    <div id="mainpage">
    <b-navbar type="dark" variant="dark">
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item href="#">Home</b-nav-item>
            </b-navbar-nav>
            </b-collapse>
    </b-navbar>
    <AmsterdamVisualization></AmsterdamVisualization>
    </div>
</template>

<script>
import AmsterdamVisualization from './AmsterdamVisualization.vue' 

export default {
    components: {
        AmsterdamVisualization
    }
}
</script>