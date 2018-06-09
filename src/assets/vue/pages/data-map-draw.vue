<template>
    <f7-page navbar-through toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回"></f7-link>
            </f7-nav-left>
            <div class="title">新建地块</div>
        </f7-navbar>
        <div class="map-panel">
            <MapDrawPanel v-if="mapload" :mapProps="mapProps"></MapDrawPanel>
        </div>
    </f7-page>
</template>
<script>
import MapDrawPanel from '../components/upload/map-draw-panel.vue';
export default {
    name: "DataMapDraw",
    data(){
        return {
            mapProps: {
                map_id: 'map_upload',
                mapStyle: "amap://styles/light",
                mapCenter: [121.3866647443, 31.1500060413],
                zoom: 9,
                setMapCenter: [110.3866647443, 34.1500060413],
                setZoom: 4,
                zooms: [4, 18],
                scrollWheel: true,
                userLocation: true,
            },
            mapload: false,
        }
    },
    mounted(){
        let timer = setTimeout(()=>{
            clearTimeout(timer);
            this.mapload = true;
        }, 400)
    },
    components: {
        MapDrawPanel,
    }
}
</script>
<style lang="scss" scoped>
.map-panel {
    height: 100%;
    width: 100%;
}
</style>