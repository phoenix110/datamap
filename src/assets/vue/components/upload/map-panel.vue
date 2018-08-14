<template>
    <div class="map-panel-temp">
        <div class="map-panel-temp-search" v-show="searchEnable">
            <div class="map-search-history" v-if="searchContent.length===0">
                <div class="history-text">搜索历史</div>
                <ul>
                    <li v-for="(vl, dx) in searchHistoryList" :key="dx">
                        <f7-link @click.prevent="dataListCallBack(vl)">{{vl.itemData ? vl.itemData.name : ""}}</f7-link>
                    </li>
                </ul>
            </div>
            <GeoPositionList :positionList="positionList" 
                :listStatus="listStatus" 
                :detailsList="detailsList"
                :dataPg="dataPg" 
                :searchContent="searchContent" 
                @dataListCallBack="dataListCallBack" 
                :feedsCount="commentFeedsCount" 
                :loading="loading"
                v-else>
            </GeoPositionList>
        </div>
        <div class="map-panel-temp-show" v-show="!searchEnable">
            <div class="map-panel-temp-map">
                <MapPanelCom ref="upload_map" :mapProps="mapProps" :loading="mapLoading"></MapPanelCom>
                <div class="map-panel-data-choose">
                    <f7-link @click.prevent="onPageSkip('/my_data/')" :animate="false">
                        <div class="mydata-skip-btn">{{!!dataPg.name ? dataPg.name : '选择数据'}}</div>
                    </f7-link>
                </div>
                <div class="map-panel-opera" :style="{'bottom': pageStatus===2 ? '72px' : ''}">
                    <div class="map-panel-draw" v-if="pageStatus === 1 && !currentPointInfo.data_type">
                        <f7-link @click.prevent="onPageSkip('/map_draw/')" :animate="false">
                            <div class="mydraw-skip-btn">
                                <i class="skip-icon"></i>
                            </div>
                        </f7-link>
                    </div>
                    <f7-link class="map-panel-location" @click.prevent="onClickLocation">
                        <f7-preloader v-if="positionLoading"></f7-preloader>
                        <i v-else class="f7-icons position-icon">navigation_fill</i>
                    </f7-link>
                </div>
                <!-- 地图数据上传功能 -->
                <div class="map-draw-progress" v-if="pageStatus === 2">
                    <div class="progress-panel-operate">
                        <div class="cancel-btn" @click="onClickStepBtn('cancel')">{{cancelText}}</div>
                        <div class="next-btn" @click="onClickStepBtn('next')">{{nextText}}</div>
                    </div>
                </div>
                <!-- ********************* -->
            </div>
            <transition name="map-panel">
                <div class="map-panel-point-info" v-if="!!currentPointInfo.data_type">
                    <div class="panel-header line-split">
                        <span @click="onCloseTemplate">关闭</span>
                    </div>
                    <div class="panel-content">
                        <div class="panel-content-title">
                            <span class="title-text">{{currentPointInfo.name}}</span>
                            <f7-link @click.prevent="skipDetailPage">
                                <i class="f7-icons" v-if="currentPointInfo.data_type === 'detail'">right</i>
                            </f7-link>
                        </div>
                        <div class="panel-content-descript" v-if="currentPointInfo.data_type === 'position'">{{currentPointInfo.district}}</div>
                        <div class="panel-content-info" v-else>
                            <span class="panel-content-info-com">{{getCountInfo('text_comment')}}条评论</span>
                            <span class="panel-content-info-picture">{{getCountInfo('image_comment')}}张照片</span>
                            <span class="panel-content-info-date">{{getCountInfo('update_time')}}</span>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
import MapPanelCom from "../commons/map-panel-comp.vue";
import GeoPositionList from "./normal/geo-position-list.vue";
import fetchUtil from "../../../js/utils/fetchUtil";
import queryUrl from "../../../js/utils/queryUrl";
import userUtil from "../../../js/utils/userUtil";
import { getFormulaDFS } from "../../../js/utils/formula_util";
import { getCenterLngLat } from "../../../js/utils/mapPanel";
import bus from "../../../js/utils/bus";
import cloneDeep from "lodash/cloneDeep";
import coordtransform from "coordtransform";
import size from "lodash/size";
import {
  model_api_url,
  map_api_url,
  headers
} from "../../../js/constants/ApiConfig";
import { __PROD__ } from "../../../js/dev-config";
import {
  mapServerPointConfig,
  mapServerLineConfig,
  mapServerPolygonConfig,
  paths,
  GlobalKeys
} from "../../../js/constants/Constants";
import global from "../../../js/utils/global";
let AMap = window.AMap;
let markerStyle = {
  point: mapServerPointConfig,
  line: mapServerLineConfig,
  polygon: mapServerPolygonConfig
};

let MapDebugApi = map_api_url;
let MapDebugBody = "";

export default {
    name: "mapPanel",
    props: ["mapProps", "searchEnable", "searchContent"],
    components: {
        MapPanelCom,
        GeoPositionList
    },
    data() {
        return {
            isProd: __PROD__,
            dataPg: {},
            mapLoading: false,
            map_debug_api: MapDebugApi,
            api_body: MapDebugBody,
            showDebug: false,
            layer: {},
            positionLoading: false,
            searchHistoryList: [],
            placeSearch: {},
            positionList: [],
            detailsList: [],
            commentFeedsCount: {},
            commentFeeds: {},
            listStatus: "omit",
            currentPointInfo: {},
            selectMarker: {},
            center: [110.3866647443, 34.1500060413],
            user: {},
            loading: false,

        //地图数据上传
            pageStatus: 1, //控制页面功能，1：数据包地图展示；2：绘图上传
            cancelText: "撤销",
            nextText: "下一步",
            explainText: "拖动地图改变位置，单机地图在地图上绘制区域",
            polygonArr:  [],
            polygonLnglatList: [],
            polygon: null,
            polygonEditor: null,
            lnglatList: {},
            deleteMarkerObj: {},
            initialLnglat: [],
            addMarkerIndex: 0,
            upStep: 1,
            stepList: [{value: 1, text: '绘制地块'}, {value: 2, text: '填写信息'}],
            draw_type: 'polygon',
            pointMarker: {},
        };
    },
    mounted() {
        bus.$on("dataListPageBack", (item, pageStatus) => {
            if(pageStatus === 2){
                let {layer, mapIns} = this;
                this.dataPg = item;
                this.pageStatus = pageStatus;
                bus.$emit("listenerUploadTabbarStatus", false);
                this.clearMap();
                this.addDrawClickEvent();
                this.setDataSelectHistory(item);
            }
            else this.dataListPageBack(item);
        });
        this.user = userUtil.get();
        this.mapIns = this.getMapObject();
        let context = this.$f7Route.context;
        if (context && !context.type) {
            if(!!context.pageStatus){
                this.pageStatus = context.pageStatus;
                bus.$emit("listenerUploadTabbarStatus", false);
                this.addDrawClickEvent();
            }
            else
                this.dataListPageBack(this.$f7Route.context.item);
        } else {
            let item = this.getDataSelectHistory();
            if (!!item) {
                if (context && context.type === "detail") this.dataListPageBack(item, "skip");
                else this.dataListPageBack(item);
            }
            if (context && !!context.type) {
                this.dataListCallBack(context);
            }
        }
        this.createPlaceSearch();
    },
    beforeDestroy() {
        bus.$off("dataListPageBack", this.dataListPageBack);
    },
    watch: {
        searchContent: function(newVl, oldVl) {
            if (size(newVl)) {
                this.mapDataQuery(newVl);
                this.placeSearch.search(newVl);
                this.loading = true;
            } else {
                this.positionList = [];
            }
        },
        searchEnable: function(newVl, oldVl) {
            if (newVl) {
                let user_id = this.user && this.user.id;
                let historyList = this.getLocalStroge(GlobalKeys.location_search_history + user_id);
                if (size(historyList)) {
                    this.searchHistoryList = JSON.parse(historyList);
                } else {
                    this.searchHistoryList = [];
                }
            } else {
                this.searchHistoryList = [];
            }
        }
    },
    methods: {
        getMapObject() {
            if (this.$refs.upload_map) {
                return this.$refs.upload_map.map;
            }
        },
        onPageSkip(path) {
            let { dataPg, mapIns, layer, pageStatus } = this;
            if (path === "/my_data/") {
                this.$f7Router.navigate(path, {
                context: { item: dataPg, pageStatus: pageStatus }
                });
            } else {
                if (size(dataPg)) {
                    this.pageStatus = 2;
                    bus.$emit("listenerUploadTabbarStatus", false);
                    size(layer) && mapIns.remove(layer);
                    this.addDrawClickEvent();
                } else {
                    this.$f7.dialog.confirm(
                        "进入绘制页面前，需要先选取数据包，是否立即前往？",
                        "提示",
                        () => {
                            this.$f7Router.navigate(paths.my_data, {
                                context: {
                                    item: dataPg,
                                    pageStatus: 2,
                                }
                            });
                        }
                    );
                    this.$$(".dialog-button")[0].innerHTML = "取消";
                    this.$$(".dialog-button-bold")[0].innerHTML = "确定";
                }
            }
        },
        dataListPageBack(vl, skip) {
            this.dataPg = vl;
            let mapIns = this.mapIns;
            this.setDataSelectHistory(vl);
            if (mapIns && this.layer) {
                mapIns.remove(this.layer);
                if (size(vl)) {
                this.getGeoServer(skip);
                }
            }
        },
        getGeoServer(skip) {
            if (!size(this.dataPg)) return;
            let {
                dataPg: { ids },
                dataPg,
                isProd,
                api_body,
                map_debug_api,
                mapIns
            } = this;
            this.mapLoading = true;
            let params = markerStyle[dataPg.geo_type];
            params = JSON.stringify(params);
            let url = map_api_url;
            if (!isProd && api_body) {
                params = api_body;
            }
            if (!isProd && map_debug_api) {
                url = map_debug_api;
            }
            if (!ids) return;
            fetchUtil(queryUrl(`${url}customer/${ids}/postgis`, { srs: "gcj02" }), {
                method: "POST",
                body: params,
                headers
            })
            .then(resp => {
            if (!resp.Status) {
                this.geoPngLoading(resp);
                this.mapLoading = false;
                if (!!skip) mapIns.setZoomAndCenter(16, this.center);
            } else {
                console.error(resp);
                this.mapLoading = false;
                if (resp.status == 400) {
                try {
                    let err = JSON.parse(resp.text);
                    if (err.code == 1) {
                    this.$f7.dialog.alert(err.error, "提示");
                    } else {
                    this.$f7.dialog.alert("请求失败", "提示");
                    }
                } catch (err) {
                    this.$f7.dialog.alert("请求失败", "提示");
                }
                } else {
                this.$f7.dialog.alert(resp.Msg, "提示");
                }
            }
            })
            .catch(err => {
            console.error(err);
            this.mapLoading = false;
            this.$f7.dialog.alert("因请求数据量太大，请稍后再试！", "提示");
            });
        },
        geoPngLoading(resp) {
            let { dataPg: { ids }, isProd, api_body, map_debug_api, mapIns } = this;
            let url = map_api_url;
            if (!isProd && map_debug_api) {
                url = map_debug_api;
            }
            let { style, box2d } = resp;
            this.layer && mapIns.remove(this.layer);
            var layer = new AMap.TileLayer({
                // 图块取图地址
                getTileUrl: function(x, y, z) {
                return `${url}${style}/${x}/${y}/${z}.png?cache=false`;
                },
                zIndex: 120,
                mapNumber: "GS(2018)1709",
                detectRetina: false
            });
            layer.setMap(mapIns);
            this.layer = layer;
            mapIns.setBounds(
                new AMap.Bounds([box2d[0], box2d[1]], [box2d[2], box2d[3]])
            );
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
        },
        getCurrentPosition(mapIns) {
            let _this = this;
            AMapPlugin.getCurrentPosition(
                function(data) {
                // alert('data'+JSON.stringify(data));
                let { latitude, longitude } = data;
                _this.customMarker && mapIns.remove(_this.customMarker);
                _this.customMarker = new AMap.Marker({
                    position: new AMap.LngLat(longitude, latitude),
                    offset: new AMap.Pixel(-12, -12), //相对于基点的位置
                    icon: new AMap.Icon({
                    //复杂图标
                    size: new AMap.Size(23, 23), //图标大小
                    image: "http://webapi.amap.com/theme/v1.3/markers/n/loc.png" //大图地址
                    })
                });
                mapIns.add(_this.customMarker);
                mapIns.setZoomAndCenter(15, [longitude, latitude]);
                _this.positionLoading = false;
                },
                function(err) {
                // alert("err" + JSON.stringify(err));
                _this.$f7.dialog.alert("地图定位失败!", "提示");
                _this.positionLoading = false;
                }
            );
        },

        switchToSettings() {
            let { platform } = device;
            if (platform && platform.toLowerCase() === "ios") {
                cordova.plugins.diagnostic.switchToSettings();
            } else {
                cordova.plugins.diagnostic.switchToLocationSettings();
            }
        },

        chargeLocationSetting(mapIns) {
            let { platform } = device;
            let _this = this;
            console.log("chargeLocationSetting:,,,,,,");
            let chechFunc =
                platform && platform.toLowerCase() === "android"
                ? cordova.plugins.diagnostic.isGpsLocationEnabled
                : cordova.plugins.diagnostic.isLocationEnabled;
            chechFunc(
                status => {
                console.log("status:" + status);
                if (status) {
                    _this.getCurrentPosition(mapIns);
                } else {
                    _this.showGoSettingDialog();
                }
                },
                err => {
                console.log("err:" + JSON.stringify(err));
                _this.showGoSettingDialog();
                }
            );
        },

        showGoSettingDialog() {
            let _this = this;
            let dialog = this.$f7.dialog.create({
                title: "提示",
                content: "需要开启存储及定位权限, 请到系统设置界面手动开启!",
                buttons: [
                    { text: "取消" },
                    {
                        text: "设置",
                        onClick: () => {
                        _this.switchToSettings();
                        }
                    }
                ]
            });
            dialog.open();
            _this.positionLoading = false;
        },

        onClickLocation() {
            let { mapIns, positionLoading } = this;
            let _this = this;
            if (positionLoading) return;
            let { platform } = device;
            if (platform && platform.toLowerCase() === "ios") {
                _this.positionLoading = true;
                _this.chargeLocationSetting(mapIns);
            } else if (platform && platform.toLowerCase() === "android") {
                _this.positionLoading = true;
                var permissions = cordova.plugins.permissions;
                permissions.requestPermissions(
                [
                    permissions.WRITE_EXTERNAL_STORAGE,
                    permissions.ACCESS_COARSE_LOCATION
                ],
                function(status) {
                    console.log("status: " + JSON.stringify(status));
                    if (status.hasPermission) {
                    _this.chargeLocationSetting(mapIns);
                    } else {
                    _this.showGoSettingDialog();
                    }
                },
                err => {
                    console.log("status err: " + JSON.stringify(status));
                    _this.showGoSettingDialog();
                }
                );
            } else {
                _this.positionLoading = true;
                mapIns.plugin("AMap.Geolocation", function() {
                _this.geolocation && mapIns.removeControl(_this.geolocation);
                let geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                    convert: true,
                    showButton: false,
                    showMarker: true,
                    showCircle: true,
                    panToLocation: true,
                    zoomToAccuracy: true
                });
                mapIns.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, "complete", () => {
                    _this.positionLoading = false;
                }); //返回定位信息
                AMap.event.addListener(geolocation, "error", () => {
                    _this.$f7.dialog.alert("地图定位失败!", "提示");
                    _this.positionLoading = false;
                });
                _this.geolocation = geolocation;
                });
            }
        },
        createPlaceSearch() {
            let _this = this;
            AMap.plugin("AMap.Autocomplete", function() {
                let placeSearch = new AMap.Autocomplete({
                datatype: "poi"
                });
                placeSearch.on("complete", e => {
                _this.getGeoLocation(e);
                });
                _this.placeSearch = placeSearch;
            });
        },
        getGeoLocation(e) {
            this.positionList = size(e.tips) ? e.tips : [];
        },
        mapDataQuery(value) {
            let { dataPg } = this;
            if (!size(dataPg)) return;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                fetchUtil(
                queryUrl(`${model_api_url}query`, {
                    source: "customer",
                    object_type: dataPg.name,
                    q: value,
                    geometry_type: dataPg.geo_type,
                    page_num: 0,
                    page_size: 10
                }),
                { method: "GET", headers }
                )
                .then(resp => {
                    if (value === this.searchContent) {
                    this.detailsList = resp.result || [];
                    this.getFeedsCount("batch");
                    this.loading = false;
                    }
                })
                .catch(err => {
                    console.log("enter mapDataQuery: err: ", err);
                    if (value === this.searchContent) {
                    this.detailsList = [];
                    this.loading = false;
                    }
                });
            }, 300);
        },
        getFeedsCount(type) {
            let { detailsList, currentPointInfo } = this,
                path = "";
            if (type === "single") {
                if (!size(currentPointInfo)) return;
                path = `${
                currentPointInfo.id
                }/count?types=text_comment,image_comment&action=all&update_time=true`;
            } else if (type === "batch") {
                if (!size(detailsList)) return;
                let idList = [];
                if (detailsList.length > 3) {
                idList.push(detailsList[0].id);
                idList.push(detailsList[1].id);
                idList.push(detailsList[2].id);
                } else {
                detailsList.map((vl, dx) => {
                    idList.push(vl.id);
                });
                }
                let num = idList.join(",");
                path = `count?reference_ids=${num}&types=text_comment,image_comment&action=all&update_time=true`;
            }
            fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/${path}`), {
                method: "GET",
                headers
            }).then(resp => {
                if (!resp.Status) {
                if (type === "single") this.commentFeeds = resp.result;
                else this.commentFeedsCount = resp.result;
                } else {
                this.commentFeedsCount = {};
                this.commentFeeds = {};
                }
            });
        },
        getCountInfo(type) {
            let { commentFeeds } = this;
            if (type === "update_time") {
                return commentFeeds[type] ? commentFeeds[type] : "暂无";
            } else {
                return commentFeeds[type] ? commentFeeds[type] : 0;
            }
        },
        dataListCallBack(context) {
            this.$emit("panelCallBack", false);
            this.currentPointInfo = Object.assign(context.itemData, {
                data_type: context.type
            });
            this.createSelectMarker();
            if (context.type === "detail") this.getFeedsCount("single");
        },
        setDataSelectHistory(value) {
            let user_id = this.user && this.user.id;
            this.setLocalStorage(GlobalKeys.data_select_history + user_id, value);
        },
        getDataSelectHistory() {
            let user_id = this.user && this.user.id;
            return this.getLocalStroge(GlobalKeys.data_select_history + user_id);
        },
        createSelectMarker() {
            let { currentPointInfo, selectMarker, mapIns } = this;
            if (size(selectMarker)) {
                mapIns.remove(selectMarker);
            }
            let lnglat =
                currentPointInfo.data_type === "position"
                ? [currentPointInfo.location.lng, currentPointInfo.location.lat]
                : currentPointInfo.geometry.coordinates;
            let pos = coordtransform.wgs84togcj02(lnglat[0], lnglat[1]);
            let marker = new AMap.Marker({
                position: pos,
                // draggable: true,
                offset: new AMap.Pixel(-30, -71),
                icon: "./static/images/icon_search_fixed.svg"
            });
            mapIns.add(marker);
            // mapIns.setFitView();
            mapIns.setZoomAndCenter(16, pos);
            this.center = lnglat;
            this.selectMarker = marker;
        },
        onCloseTemplate() {
            let { mapIns } = this;
            this.currentPointInfo = {};
            mapIns.remove(this.selectMarker);
        },
        skipDetailPage() {
            let { currentPointInfo, dataPg, mapIns } = this;
            let MyDataCluse = dataPg;
            currentPointInfo.geo_type = currentPointInfo.geometry_type;
            this.$f7Router.navigate(paths.my_data_detail, {
                context: { coverExtra: currentPointInfo, MyDataCluse }
            });
        },

        //地图数据上传
        onClickStepBtn(type) {
            let {
                polygon,
                pointMarker,
                dataPg,
                polygonArr,
                dataPg: { geo_type },
                mapIns,
                layer,
            } = this;
            if (type === "next") {
                let up_object = geo_type === "point" ? pointMarker : polygon;
                if (
                !size(up_object) ||
                (geo_type === "polygon" && polygonArr.length < 3)
                ) {
                    this.$f7.dialog.alert("请将数据绘制完成!", "提示");
                } else {
                    this.$f7Router.navigate(paths.upload_edit, {
                        context: { up_object: up_object, tableInfo: dataPg }
                    });
                }
            } 
            else if (type === "cancel") {
                this.pageStatus = 1;
                this.clearMap();
                size(layer) && mapIns.add(layer);
                bus.$emit("listenerUploadTabbarStatus", true);
            }
        },
        addDrawClickEvent(){
            let {mapIns} = this;
            size(mapIns) && mapIns.on('click', (e) => {
                let {dataPg: {geo_type}} = this;
                if(geo_type === 'point'){
                    this.clearMap();
                    this.addMarkerIndex = 1;
                }
                else{
                    this.addMarkerIndex += 1;
                }
                let text = this.addMarkerIndex === 1 ? "起点" : "锚点";
                this.addMarker(e, text);
            });
        },
        drawPolygon(){
            let {polygonArr, mapIns, polygon, dataPg: {geo_type}} = this;
            if(size(polygon)){
                mapIns.remove(polygon);
            }
            if(geo_type === 'polygon'){
                polygon = new AMap.Polygon({
                    path: polygonArr,//设置多边形边界路径
                    strokeColor: "#007AFF", //线颜色
                    strokeOpacity: 0.9, //线透明度
                    strokeWeight: 2,    //线宽
                    fillColor: "#1791fc", //填充色
                    fillOpacity: 0.35//填充透明度
                });
            }
            else if(geo_type === 'line'){
                 polygon = new AMap.Polyline({
                    path: polygonArr,          //设置线覆盖物路径
                    strokeColor: "#007AFF", //线颜色
                    strokeOpacity: 1,       //线透明度
                    strokeWeight: 2,        //线宽
                    strokeStyle: "solid",   //线样式
                    strokeDasharray: [10, 5] //补充线样式
                });
            }
            mapIns.add(polygon);
            // if(geo_type === "polygon" && polygonArr.length < 3){
            //     this.polygon = {};
            // }
            // else{
                this.polygon = polygon;
            // }
        },
        addMarker(e, markerText){
            let {dataPg: {geo_type}} = this, lnglat = [e.lnglat.lng, e.lnglat.lat];
            let marker = new AMap.Marker({
                position: lnglat,
                draggable: true,
                offset: new AMap.Pixel(-34, -41),
                content: this.createMarkerNode(markerText),
            });
            marker.on('dragging', (e) => {
                let target = e.target.getPosition();
                this.updatePolygonLnglat(target, `${lnglat[0]}${lnglat[1]}`);
                this.polygonArr = cloneDeep(this.polygonLnglatList);
                this.drawPolygon();
            });
            marker.on('click', (e) => {
                this.deleteMarkerObj = e.target;
                this.initialLnglat = `${lnglat[0]}${lnglat[1]}`;
            })
            this.mapIns.add(marker);
            this.polygonLnglatList.push(lnglat);
            if(this.polygonLnglatList.length > 1){
                this.polygonArr = cloneDeep(this.polygonLnglatList);
                this.drawPolygon();
            }
            this.lnglatList[`${lnglat[0]}${lnglat[1]}`] = '';
            if(geo_type === 'point'){
                this.pointMarker = marker;
            }
        },
        updatePolygonLnglat(target, lnglat){
            let {lnglatList, polygonLnglatList} = this, newLnglat = [target.lng, target.lat];
            for(let vl in lnglatList){
                if(lnglatList[lnglat] != ''){
                    polygonLnglatList.forEach((vl, dx, input) => {
                        if(`${vl[0]}${vl[1]}` === lnglatList[lnglat]){
                            input[dx] = newLnglat;
                            lnglatList[lnglat] = `${newLnglat[0]}${newLnglat[1]}`;
                        }
                    })
                }
                else{
                    polygonLnglatList.forEach((vl, dx, input) => {
                        if(`${vl[0]}${vl[1]}` === lnglat){
                            input[dx] = newLnglat;
                            lnglatList[lnglat] = `${newLnglat[0]}${newLnglat[1]}`;
                        }
                    })
                }
            }
        },
        createMarkerNode(text){
            let marker = document.createElement('div'), markerText = document.createElement('div'), markerCancel = document.createElement('div'), markerTipDown = document.createElement('div'), markerPoint = document.createElement('div'), closeIcon = document.createElement('i'), breakLine = document.createElement('div');
            marker.className = "marker-tip";
            markerText.className = "marker-tip-text";
            markerText.innerText = text;
            markerText.onclick = (e) => {
                this.onClickMarkerDiv(e);
            }
            markerCancel.className = "marker-tip-cancel";
            markerCancel.onclick = (e) => {
                this.onClickMarkerDiv('delete');
            }
            markerTipDown.className = "marker-tip-down";
            markerPoint.className = "marker-tip-point";
            closeIcon.className = "f7-icons marker-close";
            closeIcon.innerText = "close";
            breakLine.className = "marker-tip-break-line";
            markerCancel.appendChild(closeIcon);
            marker.appendChild(markerText);
            marker.appendChild(breakLine);
            marker.appendChild(markerCancel);
            marker.appendChild(markerTipDown);
            marker.appendChild(markerPoint);
            return marker;
        },
        onClickMarkerDiv(position){
            if(position === 'delete'){
                if(size(this.deleteMarkerObj)){
                    this.mapIns.remove(this.deleteMarkerObj);
                    this.deleteMarker();
                    if(!size(this.polygonLnglatList)){
                        this.addMarkerIndex = 0;
                    }
                }
            }
            this.deleteMarkerObj = {};
        },
        deleteMarker(){
            let {lnglatList, polygonLnglatList, deleteMarkerObj, initialLnglat} = this, polygonLnglat = '', m = {};
            for(let i in lnglatList){
                if(i === initialLnglat){
                    polygonLnglat = size(lnglatList[i]) ? lnglatList[i] : i;
                }
                else{
                    m[i] = lnglatList[i];
                }
            }
            this.lnglatList = m;
            if(size(polygonLnglat)){
                polygonLnglatList.forEach((vl, dx, input) => {
                    if(`${vl[0]}${vl[1]}` === polygonLnglat){
                        input.splice(dx, 1);
                    }
                })
            }
            this.polygonLnglatList = polygonLnglatList;
            this.polygonArr = cloneDeep(this.polygonLnglatList);
            this.drawPolygon();
        },
        clearMap(){
            this.mapIns.clearMap();
            this.polygonArr = [];
            this.polygon = {};
            this.pointMarker = {};
            this.polygonLnglatList = [];
            this.addMarkerIndex = 0;
        },
        setLocalStorage(key, value){
            localStorage.setItem(key, JSON.stringify(value));
        },
        getLocalStroge(key){
            let sum = localStorage.getItem(key);
            return size(sum) ? JSON.parse(sum) : "";
        },
    }
};
</script>
<style lang="scss">
.map-panel-temp {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    .map-panel-temp-show {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        .map-panel-temp-map {
            flex: 1;
            position: relative;
        }
        .amap-logo,
        .amap-copyright {
            display: none !important;
        }
        .map-panel-data-choose {
            .link {
                position: absolute;
                top: 16px;
                left: 8px;
                .mydata-skip-btn {
                line-height: 36px;
                text-align: center;
                background-color: #fcfcfc;
                opacity: 90%;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                font-family: PingFang SC;
                color: #007aff;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                box-sizing: border-box;
                padding: 0 24px;
                max-width: 270px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                }
            }
        }
        .map-panel-opera {
            width: 56px;
            right: 16px;
            bottom: 16px;
            position: absolute;
            .map-panel-draw {
                right: 16px;
                margin-bottom: 16px;
                .link {
                    .mydraw-skip-btn {
                    width: 56px;
                    height: 56px;
                    box-sizing: border-box;
                    padding: 20px;
                    text-align: center;
                    background-color: #1f89f2;
                    opacity: 85%;
                    border-radius: 50%;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    .skip-icon {
                        display: block;
                        background: url("../../../../static/images/edit_icon.svg") no-repeat;
                        width: 16px;
                        height: 16px;
                    }
                    }
                }
            }
            .map-panel-location {
                width: 56px;
                height: 56px;
                box-sizing: border-box;
                padding: 20px;
                background-color: #fff;
                opacity: 85%;
                border-radius: 50%;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                .position-icon {
                    font-size: 20px;
                    color: #007aff;
                }
            }
        }
        .map-draw-progress {
            width: 100%;
            height: 45px;
            background-color: #fff;
            border-top: 1px solid #dfdfdf;
            bottom: 0;
            position: absolute;
            .progress-panel-operate {
                width: 100%;
                height: 44px;
                line-height: 44px; 
                box-sizing: border-box;
                padding: 0 16px;
                display: inline-flex;
                justify-content: space-between;
                font-family: PingFang SC;
                font-size: 18px;
                color: #0076FF;
            }
            .separate-line {
                width: 100%;
                border-left: 16px solid #fff;
                height: 1px;
                background-color: #c8c7cc;
            }
            .progress-panel-display {
                width: 100%;
                height: 144px;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-sizing: border-box;
                padding-top: 22px;
                .panel-explain-text {
                    width: 209px;
                    text-align: center;
                    font-family: PingFang SC;
                    font-size: 13px;
                }
                .panel-process {
                    margin-top: 18px;
                    width: 247px;
                    height: 41px;
                    box-sizing: border-box;
                    padding-left: 50px;
                }
            }
        }
        .map-panel-point-info {
            width: 100%;
            height: 100px;
            box-sizing: border-box;
            padding-left: 28px;
            margin-top: 1px;
            background-color: #fff;
            box-shadow: 0px 0px 1px 0px #bfbfbf;
            transform: translate3d(0, 0, 0);
            .panel-header {
                width: 100%;
                height: 36px;
                position: relative;
                span {
                font-size: 14px;
                color: #0076ff;
                line-height: 36px;
                position: absolute;
                right: 16px;
                z-index: 1;
                }
                i {
                font-size: 13px;
                color: #8f8e94;
                }
            }
            .panel-content {
                width: 100%;
                padding: 8px 12px 3px 12px;
                box-sizing: border-box;
                .panel-content-title {
                line-height: 24px;
                font-size: 17px;
                position: relative;
                a {
                    position: absolute;
                    right: 0;
                    width: 25px;
                    box-sizing: border-box;
                    padding-left: 15px;
                }
                i {
                    font-size: 17px;
                    color: #8e8e8e;
                    line-height: 24px;
                }
                }
                .panel-content-descript {
                width: 100%;
                line-height: 16px;
                font-size: 15px;
                color: #8f8e94;
                margin-top: 6px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                }
                .panel-content-info {
                width: 100%;
                line-height: 18px;
                font-size: 8px;
                color: #8e8e8e;
                margin-top: 6px;
                position: relative;
                & > span:first-child {
                    margin-right: 5px;
                }
                & > span:last-child {
                    position: absolute;
                    right: 0;
                }
                }
            }
        }
        .map-panel-enter,
        .map-panel-leave-active {
            height: 0;
        }
        .map-panel-enter-to,
        .map-panel-leave {
            height: 100px;
        }
        .map-panel-enter-active,
        .map-panel-leave-active {
            transition: all 300ms;
        }
        .map_debug {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.75);
            input,
            textarea {
                border: #006cfb 1px solid;
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
    .map-panel-temp-search {
        width: 100%;
        .map-search-history {
        width: 100%;
        padding: 24px 16px 0 16px;
        box-sizing: border-box;
        .history-text {
            margin-bottom: 6px;
            font-size: 14px;
            color: #c8c7cc;
            line-height: 20px;
        }
        ul {
            margin: 0;
            padding: 0;
            a {
            width: 100%;
            display: block;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            }
            li {
            width: 100%;
            list-style-type: none;
            line-height: 25px;
            font-size: 18px;
            color: #0076ff;
            }
        }
        }
    }
    .map-panel-camera {
        width: 100px;
        height: 50px;
        position: absolute;
        bottom: 100px;
        left: 100px;
        background-color: blue;
    }
}
.marker-tip {
    width: 70px;
    height: 30px;
    border-radius: 6px;
    box-sizing: border-box;
    background-color: #ff5c47;
    position: relative;
    .marker-tip-text {
        font-family: PingFang SC;
        font-size: 13px;
        color: #fff;
        width: 45px;
        line-height: 30px;
        text-align: center;
        display: inline-block;
        vertical-align: top;
    }
    .marker-tip-break-line {
        width: 1px;
        height: 30px;
        box-sizing: border-box;
        border-top: 5px solid #ff5c47;
        border-bottom: 5px solid #ff5c47;
        background-color: #fff;
        display: inline-block;
        vertical-align: top;
    }
    .marker-tip-cancel {
        width: 23px;
        line-height: 30px;
        text-align: center;
        display: inline-block;
        vertical-align: top;
        .marker-close {
            font-size: 18px;
            color: #fff;
        }
    }
    .marker-tip-down {
        width:0;
        height:0;   
        border-left:5px solid transparent;   
        border-right:5px solid transparent;   
        border-top:5px solid #ff5c47;
        position: absolute;
        bottom: -5px;
        left: 30px;
    }
    .marker-tip-point {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #ff5c47;
        position: absolute;
        bottom: -12px;
        left: 32px;
    }
}
</style>
