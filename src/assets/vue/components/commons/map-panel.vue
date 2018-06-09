<template>
    <div class="component_map_panel">
        <div class="layer-loading" v-if="!loaded">
            <div class="chart_loading">
                <f7-preloader></f7-preloader>
                <span class="ml5">努力加载中...</span>
            </div>
        </div>
        <div class="full_abs">
            <div :id="mapProps.map_id" class="map_draw"></div>
        </div>
    </div>
</template>
<script>
import {model_api_url, headers, paramFake, static_map_url} from '../../../js/constants/ApiConfig';
import {sh as defaultCity} from '../../../js/constants/cityInfo'
import fetchUtil from '../../../js/utils/fetchUtil';
let AMap = window.AMap;
const toolOffset = [-3, 125];
const scaleOffset = [12, 5];
const markerOffset = [-3, 125];
var lastLeftWidth = 0;
export default {
    name: "map-panel",
    props: ['mapData', 'loaded'],
    data(){
        return {
            mapProps: {
                map_id: 'map_panel_1',
                // mapStyle: "amap://styles/d65140aa79f193e1cd49a4142a54fb94",
                // mapStyle: "amap://styles/normal",
                mapStyle: "amap://styles/light",
                mapCenter: defaultCity.center,
                zoom: 10,
                zoom: [4,18],
                scrollWheel: true,
                userLocation: true,
            },
            satellite: {},
            map: {},
        }
    },
    watch: {
        mapData: function(){
            this.$emit('initMapOther', this.map);
        },
    },
    mounted(){
        this.map = this.initMap();
        if(this.mapData){
            this.$emit('initMapOther', this.map);
        }
    },
    methods: {
        initMap(){
            let {mapStyle, mapCenter, map_id, zoom, zooms, scrollWheel} = this.mapProps;
            let map = new AMap.Map(map_id, {
                resizeEnable: false,
                center: mapCenter,
                mapStyle,
                zooms: zooms,
                scrollWheel,
            });
            let toff = new AMap.Pixel(...[toolOffset[0]+lastLeftWidth, toolOffset[1]])
            this.toolBar = new AMap.ToolBar({
                offset: toff,
                position: 'LB',
                liteStyle: true
            });
            this.map = map;
            return map;
        },
    }
}
</script>
<style lang="scss" scoped>
.component_map_panel {
    width: 100%;
    height: 100%;
    position: relative;
    .full_abs {
        height: 100%;
        .map_draw {
            height: 100%;
        }
    }
    .layer-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        background-color: rgba(0, 0, 0, 0.2);
        .preloader {
            width: 20px;
            height: 20px;
        }
        .ml5 {
            font-size: 14px;
            margin-left: 10px;
        }
    }
}
</style>