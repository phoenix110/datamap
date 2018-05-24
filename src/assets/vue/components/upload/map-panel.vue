<template>
    <div class="component-map-panel">
        <div :id="map_id" class="full-map"></div>
        <f7-link @click.prevent="onSkipMyData" :animate="false">
            <div class="selectCity-btn">{{currentCity}}</div>
        </f7-link>
        <!-- <div class="selectCity-btn" @click="cityChoose">{{currentCity}}</div> -->
    </div>
</template>
<script>
let AMap = window.AMap;
const toolOffset = [-3, 125];
const scaleOffset = [12, 5];
const markerOffset = [-3, 125];
var lastLeftWidth = 0;
export default {
    name: "mapPanel",
    props: ['mapProps'],
    data(){
        return{
            map_id: this.mapProps.map_id,
            map: '',
            toolBar: '',
            currentCity: '上海市',
            cityId: 1,
        }
    },
    mounted(){
        let map = this.initMap();
        // this.addMarker(map);
    },
    methods: {
        initMap(){
            let {mapStyle, mapCenter, map_id, zoom, scrollWheel, userLocation} = this.mapProps;
            let map = new AMap.Map(map_id, {
                resizeEnable: false,
                center: !userLocation ? mapCenter : undefined,
                zoom: !userLocation ? zoom : undefined,
                mapStyle,
                scrollWheel,
            });
            map.setMapStyle(mapStyle);
            let toff = new AMap.Pixel(...[toolOffset[0]+lastLeftWidth, toolOffset[1]])
            this.toolBar = new AMap.ToolBar({
                offset: toff,
                position: 'LB',
                liteStyle: true
            });
            map.setZoomAndCenter(zoom, mapCenter);
            this.map = map;
            return map;
        },
        cityChoose(id){
            this.$f7router.load({url: 'city-choose'});
            // this.$f7Router.loadPage({url: "/chart_detail/vault_type/chart/vault_id/hs1281/"})
        },
        onSkipMyData(){
            this.$f7Router.navigate('/my_data/');
        },
    }
}
</script>
<style lang="scss">
.component-map-panel{
    width: 100%;
    height: 100%;
    position: absolute;
    .full-map{
        height: 100%;
    }
    .amap-logo,.amap-copyright{
        display: none!important;
    }
    .link{
        position: absolute;
        top: 25px;
        left: 13px;
        .selectCity-btn{
            // width: 70px;
            line-height: 36px;
            text-align: center;
            background-color: white;
            border-radius: 8px;
            font-size: 14px;
            font-family: PingFang SC;
            color: #006CFB;
            box-shadow: 0 2px 4px rgb(155, 155, 155);
            box-sizing: border-box;
            padding: 0 15px;
        }
    }
}
</style>