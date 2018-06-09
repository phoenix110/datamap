<template>
    <div class="map_panel_component">
        <div class="chart_loading_abs" v-if="loading">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div :id="mapProps.map_id" class="full_map"></div>
    </div>
</template>
<script>
import size from 'lodash/size';
let AMap = window.AMap;
const toolOffset = [-3, 125];
const scaleOffset = [12, 5];
const markerOffset = [-3, 125];
var lastLeftWidth = 0;
export default {
    name: "mapPanelCom",
    props: ['mapProps', 'loading'],
    data(){
        return {
            map: {},
        }
    },
    mounted(){
        this.map = this.initMap();
    },
    methods: {
        initMap(){
            let {mapStyle, mapCenter, map_id, zoom, zooms, scrollWheel, userLocation} = this.mapProps;
            let map = new AMap.Map(map_id, {
                resizeEnable: false,
                center: userLocation ? mapCenter : undefined,
                zoom: userLocation ? zoom : undefined,
                mapStyle,
                scrollWheel,
                // zooms,
            });
            this.map = map;
            console.log('map', map, this.mapProps);
            return map;
        },
    }
}
</script>
<style lang="scss" scoped>
.map_panel_component, .full_map {
    width: 100%;
    height: 100%;
    position: relative;
}
.map_panel_loading {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 500;
    background-color: rgba(0, 0, 0, 0.2);
    .loading-icon{
        width: 50px;
        height: 50px;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }
}
</style>