<template>
    <f7-page navbar-through toolbar-through>
        <f7-navbar>
            <f7-nav-left>
                <f7-link @click="onClickCancel">
                    <i class="f7-icons">left</i>
                    <span>取消</span>
                </f7-link>
            </f7-nav-left>
            <div class="title">绘制数据</div>
        </f7-navbar>
        <div class="map-panel">
            <MapDrawPanel v-if="mapload" :mapProps="mapProps"></MapDrawPanel>
        </div>
    </f7-page>
</template>
<script>
import MapDrawPanel from '../../components/upload/map-draw-panel.vue';
import {paths} from '../../../js/constants/Constants';
export default {
    name: "DataMapDraw",
    data(){
        return {
            mapProps: {
                map_id: 'map_upload_draw',
                mapStyle: "amap://styles/d4e9338d74853aa23bedaf367126e113",
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
    },
    methods: {
        onClickCancel(){
            this.$f7Router.back(paths.upload, {force: true})
        }
    }
}
</script>
<style lang="scss" scoped>
.map-panel {
    height: 100%;
    width: 100%;
}
.map-draw-cancel {
    color: #007aff;
}
</style>