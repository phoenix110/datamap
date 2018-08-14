<template>
    <div class="map_center">
        <MapPanelCom ref="upload_map" :mapProps="mapProps" :loading="mapLoading"></MapPanelCom>
    </div>
</template>
<script>
import MapPanelCom from '../../commons/map-panel-comp.vue';
import amapUtil from '../../../../js/utils/amapUtil'
import {forEach,filter,pull,find,indexOf,findIndex,slice,difference,assign,size,orderBy,pullAll,keys,cloneDeep,uniq, uniqBy,map,concat,has, merge,get, set, unset, isNaN, flatten, trimStart} from 'lodash'
import {visualization_colors} from '../../../../js/constants/Constants';
import bus from '../../../../js/utils/bus';
let AMap = window.AMap;
const toolOffset = [-3, 125];
const scaleOffset = [12, 5];
const markerOffset = [-3, 125];
var lastLeftWidth = 0;
let icon_type = "icomoon icon-location_1";
const normalOpt = {strokeColor: '#73C3FF', strokeOpacity: 1, strokeWeight: 1,fillColor: '#73C3FF',fillOpacity: 0.35, zIndex: 1};
const activeOpt = {strokeColor: '#1465f7', strokeOpacity: 1, strokeWeight: 2,fillColor: '#1465f7', fillOpacity: 0.5, zIndex: 1
}
const polygonStyle = {
    color:"rgba(59, 102, 233, 1)",
    fillOpacity:0.5,
    strokeDasharray:[0, 0, 0, 0],
    strokeOpacity:1,
    strokeStyle:"solid",
    strokeWeight:1
};
const lineStyle = {
    color:"#FF4FFF",
    strokeDasharray:[0, 0, 0, 0],
    strokeStyle:"solid",
    strokeWeight:1,
}
export default {
    name: "mapCenter",
    props: ['mapProps', 'mapData', 'loading'],
    data(){
        return {
            map: {},
            markers: [],
            cluster: null,
            haveCluster: false,
            mapLoading: this.loading,
        }
    },
    beforeDestroy(){
        size(this.map) ? this.map.clearMap() : null;
        size(this.map) ? this.map.destroy() : null ;
    },
    components: {
        MapPanelCom,
    },
    watch: {
        mapData: function(){
            this.map = this.$refs.upload_map.map;
            // this.addLayerToMap();
        }
    },
    methods: {
        getPanelMap(){
            return this.$refs.upload_map.map;
        },
        addLayerToMap(){
            let {mapData, map} = this;
            switch(mapData.geometry_type){
                case "point": this.addPointCluser(); break;
                case "polygon": this.addPolygonMap(); break;
                case "line": this.addLineMap(); break;
            }
            this.mapLoading = false;
            // bus.$emit("setUploadTabbar", true);
            if(!this.haveCluster){
                this.map.setFitView();
            }
        },
        addPointCluser(){
            this.setMapMarkers();
            let {cluster, markers, map, mapProps: {setZoom, setMapCenter}} = this;
            cluster = new AMap.MarkerClusterer(map, markers, 
            {
                gridSize:80,
                averageCenter: true,
                minClusterSize: 5,
                renderCluserMarker: this.setPointMergeRule
            });
            var {mapData: {data}} = this;
            if(size(data)){
                this.haveCluster = true;
                let len = data.length;
                let coords = data.map(d => d.lnglat);
                let center = coords.reduce((t, n) => {
                    let c1 = t.lnglat;
                    let c2 = n.lnglat;
                    return [t[0]+n[0], t[1]+n[1]]
                }).map(t => t / len);
                map.setZoomAndCenter(6, center);
            }
        },
        setMapMarkers(){
            let {mapData: {data}} = this, markers = [];
            data.map((vl, dx)=>{
                markers.push(new AMap.Marker({
                    position: data[dx]['lnglat'],
                    content: `<i class="${icon_type}" style="color: ${visualization_colors[0]}"></i>`,
                    offset: new AMap.Pixel(-9,-14),
                }))
            });
            this.markers = markers;
        },
        setPointMergeRule(context){
            let count  = this.markers.length;
            var div = document.createElement('div');
            var bgColor = "rgba(32, 150, 243, 60)";
            var fontColor = 'rgba(255, 255, 255, 255)';
            div.style.backgroundColor = bgColor
            var size = Math.round(30 + Math.pow(context.count/count,1/5) * 20);
            div.style.width = div.style.height = size+'px';
            div.style.borderRadius = size/2 + 'px';
            div.innerHTML = context.count;
            div.style.lineHeight = size+'px';
            div.style.color = fontColor;
            div.style.fontSize = '17px';
            div.style.textAlign = 'center';
            context.marker.setOffset(new AMap.Pixel(-size/2,-size/2));
            context.marker.setContent(div)
        },
        addPolygonMap(){
            let {mapData: {data}, map} = this;
            let {color} = polygonStyle, layers = [];
            data.map(t=>{
                let layer = amapUtil.addPolygon(t, {
                    ...normalOpt,
                    ...polygonStyle,
                    strokeColor: color,
                    fillColor: color,
                });
                layers = layers.concat(layer);
            });
            map.add(layers);
            map.setFitView();
        },
        addLineMap(){
            let {mapData: {data}, map} = this;
            let {color} = lineStyle, layers = [];
            data.map(t=>{
                let layer = amapUtil.addPolyline(t, {
                    ...normalOpt,
                    ...lineStyle,
                    strokeColor: color,
                    fillColor: color,
                });
                layers = layers.concat(layer);
            });
            map.add(layers);
            map.setFitView();
        },
    }
}
</script>
<style lang="scss" scoped>
.map_center {
    height: 100%;
    width: 100%;
}
</style>