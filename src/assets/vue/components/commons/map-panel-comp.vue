<template>
    <div class="map_panel_component">
        <div class="chart_loading_abs" v-if="loading">
            <f7-preloader></f7-preloader>
        </div>
        <div :id="mapProps.map_id" class="full_map" ></div>
    </div>
</template>
<script>
import size from 'lodash/size';
import forEach from 'lodash/forEach'
import {geo_types_map, geoTypesMap, } from '../../../js/constants/Constants';
import coordtransform from 'coordtransform'
import { getCenterLngLat } from '../../../js/utils/mapPanel'
let AMap = window.AMap;
const toolOffset = [-3, 125];
const scaleOffset = [12, 5];
const markerOffset = [-3, 125];
var lastLeftWidth = 0;
export default {
    name: "MapPanelCom",
    props: ['mapProps', 'loading', 'showCover'],
    data(){
        return {
            map: {},
            coverExtra:{},
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
            return map;
        },
       addcoverExtraToMap(coverExtra){
            this.coverExtra  = coverExtra;
            let {geometry} = coverExtra;
            if(!this.map ) return;
            let lnglat = getCenterLngLat(coverExtra);
            if(!lnglat) return;
            let lng = lnglat[0];
            let lat = lnglat[1];
            let pos = coordtransform.wgs84togcj02(lng, lat);
            switch (geometry.type) {
               case geo_types_map.point:
                   this.addMarkValToMap(pos);
                   break;
               case geo_types_map.polygon:
                   this.addPolyToMapExt(pos)
                   break;
               case geo_types_map.line:
                   this.addLineToMapExt(pos);
                   break;
            }
       },
       addMarkValToMap(pos){
           let marker = new AMap.Marker({
               map: this.map,
               position: pos,
               offSet: new AMap.Pixel(0, 0),
               zIndex: 100,
               icon:'./static/images/icon_search_fixed.svg'
           })
           this.map.setCenter(pos);
           this.map.add(marker);
       },

        addLineToMapExt(pos) {
            let pathArr = [];
            forEach(this.coverExtra.geometry.coordinates,(item,index)=>{
                pathArr.push(
                    new AMap.LngLat(item[0],item[1]),
                )
            })
            var polyline = new AMap.Polyline({
                path: pathArr,          //设置线覆盖物路径
                strokeColor: "#4FA7FF", //线颜色
                zIndex:100,
                strokeDasharray: [0, 0, 0, 0],
                strokeOpacity: 1,
                strokeStyle: 'solid',
                strokeWeight: 3,
            });
            this.map.setCenter(pos)
            polyline.show();
            this.map.add(polyline)
        },

        addPolyToMapExt(pos){
            let pathArr = [];
            forEach(this.coverExtra.geometry.coordinates[0],(item,index)=>{
                pathArr.push(
                    item
                )
            });
            var polygen = new AMap.Polygon({
                path: pathArr,          //设置线覆盖物路径
                strokeColor: "#4FA7FF", //线颜色
                zIndex:100,
                strokeOpacity: 1,
                strokeStyle: 'solid',
                strokeWeight: 3,
                fillOpacity: 0.3,
                fillColor: "#4FA7FF" //填充色
            });
            this.map.setCenter(pos)
            this.map.add(polygen)
        },

    }
}
</script>
<style lang="scss" scoped>
.map_panel_component, .full_map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
.map_panel_loading {
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
