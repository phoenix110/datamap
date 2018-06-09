<template>
    <div class="map-panel-temp">
        <mapPanelCom ref="upload_map" :mapProps="mapProps" :loading="mapLoading"></mapPanelCom>
        <div class="map-panel-data-choose">
            <f7-link @click.prevent="onPageSkip('/my_data/')" :animate="false">
                <div class="mydata-skip-btn">{{!!dataPg ? dataPg.name : '选择数据'}}</div>
            </f7-link>
        </div>
        <div class="show_map_debug" v-if="!isProd" @click="onShowDebug">
            <i class="icon-wallet"></i>
        </div>
        <div class="map_debug" v-if="showDebug">
            <input type="text" :value="map_debug_api" @change="onChangeDebugApi">
            <textarea cols="30" rows="10" :value="api_body" @change="onChangeDebugBody"></textarea>
            <i class="icon-refresh" @click="getGeoServer"></i>
            <i class="icon-close" @click="onHideDebug"></i>
        </div>
        <div class="map-panel-draw">
            <f7-link @click.prevent="onPageSkip('/map_draw/')" :animate="false">
                <div class="mydraw-skip-btn">
                    <i class="f7-icons skip-icon">forward_fill</i>
                </div>
            </f7-link>
        </div>
        <div class="map-panel-location"></div>
    </div>
</template>
<script>
import mapPanelCom from '../commons/map-panel-comp.vue';
import fetchUtil from '../../../js/utils/fetchUtil';
import queryUrl from '../../../js/utils/queryUrl';
import userUtil from '../../../js/utils/userUtil';
import {getFormulaDFS} from '../../../js/utils/formula_util';
import {model_api_url, map_api_url, headers} from '../../../js/constants/ApiConfig';
import {__PROD__} from '../../../js/dev-config'
import {mapServerPointConfig, mapServerLineConfig, mapServerPolygonConfig} from '../../../js/constants/Constants';
let AMap = window.AMap;
let markerStyle = {
    'point': mapServerPointConfig,
    'line': mapServerLineConfig,
    'polygon': mapServerPolygonConfig,
}

let MapDebugApi = map_api_url;
let MapDebugBody = '';

export default {
    name: "mapPanel",
    props: ['mapProps'],
    data(){
        return{
            isProd: __PROD__,
            dataPg: {},
            map: {},
            mapLoading: false,
            map_debug_api: MapDebugApi,
            api_body: MapDebugBody,
            showDebug: false,
        }
    },
    mounted(){
        this.getGeoServer();
    },
    components: {
        mapPanelCom,
    },
    methods: {
        getMapObject(){
            return this.$refs.upload_map.map;
        },
        onPageSkip(path){
            this.$f7Router.navigate(path);
        },
        getGeoServer(){
            this.dataPg = this.$f7Route.context ? this.$f7Route.context.item : null;
            if(!this.dataPg) return;
            let {dataPg: {ids}, dataPg, isProd, api_body, map_debug_api} = this;
            this.mapLoading = true;
            let params = markerStyle[dataPg.geo_type];
            params = Object.assign({}, params, {"buffer_size": 30});
            params = JSON.stringify(params);
            let url = map_api_url;
            if (!isProd && api_body) {
                params = api_body;
            }
            if (!isProd && map_debug_api) {
                url = map_debug_api;
            }
            if (!ids) return;
            fetchUtil(queryUrl(`${url}customer/${ids}`), {method: 'POST', body: params, headers})
            .then(resp => {
                if(!resp.Status){
                    this.geoPngLoading(resp);
                    this.mapLoading = false;
                }
                else{
                    console.error(resp.Msg);
                    this.mapLoading = false;
                }
            })
            .catch(err => {
                console.error(err);
                this.mapLoading = false;
                this.$f7.dialog.alert("因请求数据量太大，请稍后再试！", "提示")
            })
        },
        geoPngLoading(resp){
            let {dataPg: {ids}, isProd, api_body, map_debug_api} = this;
            let url = map_api_url;
            if (!isProd && map_debug_api) {
                url = map_debug_api;
            }
            let {style, box2d} = resp;
            let mapIns = this.getMapObject();
            this.layer && mapIns.remove(this.layer);
            let user = userUtil.get();
            var layer  = new AMap.TileLayer({
                // 图块取图地址
                getTileUrl: function(x, y, z) {
                    return `${url}${style}/${x}/${y}/${z}.png`;
                },
                zIndex: 120,
                mapNumber:'GIS(2017)508号'
            });
            layer.setMap(mapIns);
            this.layer = layer;
            mapIns.setBounds(new AMap.Bounds([box2d[0], box2d[1]], [box2d[2], box2d[3]]));
        },
        onChangeDebugApi(e) {
            MapDebugApi = e.target.value;
        },
        onChangeDebugBody(e) {
            MapDebugBody = e.target.value;
        },
        onShowDebug() {
            this.showDebug = true;
        },
        onHideDebug() {
            this.showDebug = false;
        }
    }
}
</script>
<style lang="scss">
.map-panel-temp{
    width: 100%;
    height: 100%;
    position: relative;
    .amap-logo,.amap-copyright{
        display: none!important;
    }
    .map-panel-data-choose {
        .link{
            position: absolute;
            top: 25px;
            left: 13px;
            .mydata-skip-btn{
                line-height: 36px;
                text-align: center;
                background-color: white;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                font-family: PingFang SC;
                color: #006CFB;
                box-shadow: 0 2px 4px rgb(155, 155, 155);
                box-sizing: border-box;
                padding: 0 15px;
                max-width: 8em;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
    .map-panel-draw {
        .link {
            position: absolute;
            right: 13px;
            bottom: 85px;
            .mydraw-skip-btn {
                width: 56px;
                line-height: 56px;
                text-align: center;
                background-color: #4191ED;
                border-radius: 50%;
                .skip-icon {
                    font-size: 24px;
                    color: #fff;
                }
            }
        }
    }
    .info-dialog {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        width: 200px;
        height: 90px;
        border-radius: 6px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        .info-dialog-text {
            flex: 1;
            box-sizing: border-box;
            padding: 10px 10px 0 10px;
            .text {
                width: 100%;
                text-align: center;
            }
        }
        .info-dislog-bottom {
            width: 100%;
            line-height: 30px;
            text-align: center;
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
            background-color: #409eff;
            color: #fff;
        }
    }
    .map_debug {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.75);
        input, textarea {
            border: #006CFB 1px solid;
        }
        .icon-refresh {
            position: absolute;
            top: 2px;
            right: 24px;
            cursor: pointer;
        }
        .icon-close {
            position: absolute;
            top: 2px;
            right: 2px;
            cursor: pointer;
        }
    }
    .show_map_debug {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #409eff;
        margin-left: 4px;
        text-align: center;
        line-height: 32px;
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;
        i {
            color: #fff;
        }
    }
}
</style>
