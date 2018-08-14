<template>
    <div class="map-draw-panel">
        <div class="map-draw-canvas" v-show="upStep === 1">
            <div class="map-draw-btn">
                <f7-link @click.prevent="onPageSkip('/my_data/')" :animate="false">
                    <div class="mydraw-skip-btn">{{!!dataPg.name ? dataPg.name : '选择数据'}}</div>
                </f7-link>
            </div>
            <div class="map-draw-board">
                <MapPanelCom ref="upload_map" :mapProps="mapProps" :loading="false"></MapPanelCom>
            </div>
        </div>
        <f7-link class="map-draw-location" @click="onClickLocation">
            <f7-preloader v-if="positionLoading"></f7-preloader>
            <i v-else class="f7-icons position-icon">navigation_fill</i>
        </f7-link>
        <div class="map-draw-progress">
            <div class="progress-panel-operate">
                <div class="cancel-btn" @click="onClickStepBtn('cancel')">{{cancelText}}</div>
                <div class="next-btn" @click="onClickStepBtn('next')">{{nextText}}</div>
            </div>
        </div>
    </div>
</template>
<script>
import MapPanelCom from '../commons/map-panel-comp.vue';
import UploadInputPanel from './normal/upload-input-panel.vue';
import {
    checkAllContains, wrapMultiPolygon, getTransCoords,
    wrapMultiPolyline, geoJsonToEwkb
} from '../../../js/utils/amapUtil';
import {model_api_url, map_api_url, headers} from '../../../js/constants/ApiConfig';
import Steps from './normal/steps.vue';
import coordtransform from 'coordtransform';
import bus from '../../../js/utils/bus';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import {paths} from '../../../js/constants/Constants.js'

let AMap = window.AMap;
const type_polygon = 'polygon';
export default {
    name: "MapDrawPanel",
    props: ["mapProps"],
    data(){
        return {
            dataPg: {},
            cancelText: "撤销",
            nextText: "下一步",
            explainText: "拖动地图改变位置，单机地图在地图上绘制区域",
            polygonArr:  [],
            polygonLnglatList: [],
            polygon: null,
            polygonEditor: null,
            lnglatList: {},
            mapIns: {},
            deleteMarkerObj: {},
            initialLnglat: [],
            addMarkerIndex: 0,
            upStep: 1,
            stepList: [{value: 1, text: '绘制地块'}, {value: 2, text: '填写信息'}],
            draw_type: 'polygon',
            pointMarker: {},
            positionLoading: false,
        }
    },
    components: {
        MapPanelCom,
        UploadInputPanel,
        Steps,
    },
    mounted(){
        bus.$on('dataListPageBackDraw', this.dataListPageBack);
        this.mapIns = this.getMapInstance();
        let zoomCenter = this.$f7Route.context ? this.$f7Route.context.zoomCenter : {};
        if(size(zoomCenter)){
            this.mapIns.setZoomAndCenter(zoomCenter.zoom, zoomCenter.center);
        }
        this.dataPg = this.$f7Route.context ? this.$f7Route.context.item : {};
        size(this.mapIns) && this.mapIns.on('click', (e) => {
            let {dataPg: {geo_type}} = this;
            if(geo_type === 'point'){
                this.clearMap();
                this.addMarkerIndex = 1;
            }
            else{
                this.addMarkerIndex += 1;
            }
            // let text = this.addMarkerIndex === 1 ? "起点" : "锚点" + (this.addMarkerIndex-1);
            let text = this.addMarkerIndex === 1 ? "起点" : "锚点";
            this.addMarker(e, text);
        });
    },
    beforeDestroy() {
        bus.$off('dataListPageBackDraw', this.dataListPageBack);
    },
    methods: {
        clearMap(){
            this.mapIns.clearMap();
            this.polygonArr = [];
            this.polygon = {};
            this.pointMarker = {};
            this.polygonLnglatList = [];
            this.addMarkerIndex = 0;
        },
        onPageSkip(path){
            this.$f7Router.navigate(path, {context: {prePage: 'MapDrawPanel', item: this.dataPg}});
        },
        getMapInstance(){
            return this.$refs.upload_map.map;
        },
        dataListPageBack(item){
            let {dataPg: {geo_type}} = this;
            if(geo_type != item.geo_type){
                this.clearMap();
            }
            this.dataPg = item;
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
        onClickStepBtn(type){
            let {polygon, pointMarker, dataPg, polygonArr, dataPg: {geo_type}} = this;
            if(type === "next"){
                let up_object = geo_type === 'point' ? pointMarker : polygon;
                // if(size(up_object)){
                //     this.$f7Router.navigate(paths.upload_edit, {context: {up_object: up_object, tableInfo: dataPg}});
                // }
                // else{
                //     this.$f7.dialog.alert("请将数据绘制完成!", "提示")
                // }
                if(!size(up_object) || (geo_type === 'polygon' && polygonArr.length < 3)){
                    this.$f7.dialog.alert("请将数据绘制完成!", "提示")
                }
                else{
                    this.$f7Router.navigate(paths.upload_edit, {context: {up_object: up_object, tableInfo: dataPg}});
                }
            }
            else if(type === "cancel"){
                this.clearMap();
            }
        },
        listenUploadInput(){},
        getCurrentPosition(mapIns) {
            let _this = this;
            AMapPlugin.getCurrentPosition(function (data) {
                // alert('data'+JSON.stringify(data));
                let {latitude, longitude} = data;
                _this.customMarker && mapIns.remove(_this.customMarker);
                _this.customMarker = new AMap.Marker({
                    position: new AMap.LngLat(longitude, latitude),
                    offset: new AMap.Pixel(-12, -12),//相对于基点的位置
                    icon: new AMap.Icon({  //复杂图标
                        size: new AMap.Size(23, 23),//图标大小
                        image: "http://webapi.amap.com/theme/v1.3/markers/n/loc.png", //大图地址
                    })
                });
                mapIns.add(_this.customMarker);
                mapIns.setZoomAndCenter(15, [longitude, latitude]);
                _this.positionLoading = false;
            }, function (err) {
                // alert("err" + JSON.stringify(err));
                _this.$f7.dialog.alert('地图定位失败!', '提示');
                _this.positionLoading = false;
            })
        },

        switchToSettings() {
            let {platform} = device;
            if (platform && platform.toLowerCase() === 'ios') {
                cordova.plugins.diagnostic.switchToSettings();
            }else{
                cordova.plugins.diagnostic.switchToLocationSettings();
            }
        },

        chargeLocationSetting(mapIns) {
            let {platform} = device;
            let _this = this;
            console.log('chargeLocationSetting:,,,,,,');
            let chechFunc = (platform && platform.toLowerCase() === 'android') ? 
                cordova.plugins.diagnostic.isGpsLocationEnabled : 
                cordova.plugins.diagnostic.isLocationEnabled;
            chechFunc((status) => {
                console.log('status:'+status);
                if (status) {
                    _this.getCurrentPosition(mapIns);
                }else {
                    _this.showGoSettingDialog();
                }
            }, (err) => {
                console.log('err:'+JSON.stringify(err));
                _this.showGoSettingDialog();
            });
        },

        showGoSettingDialog() {
            let _this = this;
            let dialog = this.$f7.dialog.create({
                title: '提示',
                content: "需要开启存储及定位权限, 请到系统设置界面手动开启!",
                buttons: [
                    {text:"取消"},{
                    text:"设置", onClick: () => {
                        _this.switchToSettings();
                    }
                }]
            })
            dialog.open();
            _this.positionLoading = false;
        },

        onClickLocation(){
            let {mapIns, positionLoading} = this;
            let _this = this;
            if(positionLoading) return;
            let {platform} = device;
            if (platform && platform.toLowerCase() === 'ios') {
                _this.positionLoading = true;
                _this.chargeLocationSetting(mapIns);
            }else if (platform && platform.toLowerCase() === 'android'){
                _this.positionLoading = true;
                var permissions = cordova.plugins.permissions;
                permissions.requestPermissions([permissions.WRITE_EXTERNAL_STORAGE, permissions.ACCESS_COARSE_LOCATION], function(status) {
                    console.log('status: '+JSON.stringify(status));
                    if (status.hasPermission) {
                        _this.chargeLocationSetting(mapIns);
                    }else {
                        _this.showGoSettingDialog();
                    }
                }, (err) => {
                    console.log('status err: '+JSON.stringify(status));
                    _this.showGoSettingDialog();
                })
            }else {
                _this.positionLoading = true;
                mapIns.plugin('AMap.Geolocation', function () {
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
                        zoomToAccuracy:true,
                    });
                    mapIns.addControl(geolocation);
                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, 'complete', () => {
                        _this.positionLoading = false;
                    });//返回定位信息
                    AMap.event.addListener(geolocation, 'error', () => {
                        _this.$f7.dialog.alert('地图定位失败!', '提示');
                        _this.positionLoading = false;
                    });
                     _this.geolocation = geolocation;
                });
            }
        },
    }
}
</script>
<style lang="scss" >
.map-draw-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    .map-draw-canvas {
        flex: 1;
        position: relative;
        .map-draw-btn {
            .link{
                position: absolute;
                top: 16px;
                left: 8px;
                .mydraw-skip-btn{
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
        .map-draw-board {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .marker-clear {
            position: absolute;
            right: 10px;
            bottom: 10px;
            width: 50px;
            line-height: 25px;
            background-color: #4191ED;
            border-radius: 5px;
            text-align: center;
            color: #fff;
        }
    }
    .map-draw-input {
        flex: 1;
        overflow-y: auto;
    }
    .map-draw-location {
        position: absolute;
        right: 16px;
        bottom: 61px;
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
    .map-draw-progress {
        width: 100%;
        // height: 189px;
        height: 45px;
        background-color: #fff;
        border-top: 1px solid #dfdfdf;
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