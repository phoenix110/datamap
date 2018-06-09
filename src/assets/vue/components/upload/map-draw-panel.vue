<template>
    <div class="map-draw-panel">
        <div class="map-draw-load">
            <div class="map-draw-btn">
                <f7-link @click.prevent="onPageSkip('/my_data/')" :animate="false">
                    <div class="mydraw-skip-btn">{{!!dataPg ? dataPg.name : '选择数据'}}</div>
                </f7-link>
            </div>
            <div class="map-draw-board">
                <mapPanelCom ref="upload_map" :mapProps="mapProps" :loading="false"></mapPanelCom>
            </div>
            <div class="marker-clear" @click="clearMap">清除</div>
        </div>
        <div class="map-draw-progress">
            <div class="progress-panel-operate">
                <div class="cancel-btn">{{cancelText}}</div>
                <div class="next-btn">{{nextText}}</div>
            </div>
            <div class="separate-line"></div>
            <div class="progress-panel-display">
                <div class="panel-explain-text">{{explainText}}</div>
                <div class="panel-process">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import coordtransform from 'coordtransform';
import bus from '../../../js/utils/bus'
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import mapPanelCom from '../commons/map-panel-comp.vue';
let AMap = window.AMap;
export default {
    name: "MapDrawPanel",
    props: ["mapProps"],
    data(){
        return {
            dataPg: null,
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
        }
    },
    components: {
        mapPanelCom,
    },
    mounted(){
        bus.$on('selectUploadData', this.selectUploadData)
        this.mapIns = this.getMapInstance();
        size(this.mapIns) && this.mapIns.on('click', (e) => {
            this.addMarkerIndex += 1;
            let text = this.addMarkerIndex === 1 ? "起点" : "锚点" + (this.addMarkerIndex-1);
            this.addMarker(e, text);
        });
    },
    methods: {
        clearMap(){
            this.mapIns.clearMap();
            this.polygonArr = [];
            this.polygon = {};
            this.polygonLnglatList = [];
            this.addMarkerIndex = 0;
        },
        onPageSkip(path){
            this.$f7Router.navigate(path, {context: {prePage: 'MapDrawPanel'}});
        },
        getMapInstance(){
            return this.$refs.upload_map.map;
        },
        selectUploadData(item){
            this.dataPg = item;
        },
        drawPolygon(){
            let {polygonArr, mapIns, polygon} = this;
            if(polygon){
                mapIns.remove(polygon);
            }
            polygon = new AMap.Polygon({
                path: polygonArr,//设置多边形边界路径
                strokeColor: "#007AFF", //线颜色
                strokeOpacity: 0.9, //线透明度
                strokeWeight: 2,    //线宽
                fillColor: "#1791fc", //填充色
                fillOpacity: 0.35//填充透明度
            });
            mapIns.add(polygon);
            this.polygon = polygon;
        },
        addMarker(e, markerText){
            let lnglat = [e.lnglat.lng, e.lnglat.lat];
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
        }
    }
}
</script>
<style lang="scss" >
.map-draw-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .map-draw-load {
        flex: 1;
        position: relative;
        .map-draw-btn {
            .link{
                position: absolute;
                top: 25px;
                left: 13px;
                .mydraw-skip-btn{
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
        .map-draw-board {
            height: 100%;
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
    .map-draw-progress {
        width: 100%;
        height: 189px;
        background-color: #fff;
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
            justify-content: center;
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