<template>
    <f7-page navbar-through toolbar-through>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">编辑信息</div>
            <f7-nav-right>
                <div class="ok-btn" @click="onClickOk">完成</div>
            </f7-nav-right>
        </f7-navbar>
        <div class="upload-edit-page">
            <f7-block-title class="upload-edit-text">必填信息<span>*</span></f7-block-title>
            <f7-list inline-labels no-hairlines class="upload-input-list">
                <f7-list-item>
                    <f7-label class="title-text">数据名称</f7-label>
                    <f7-input type="text" placeholder="请填写" @change="onChangeDataName" :value="dataName" clear-button></f7-input>
                </f7-list-item>
                <f7-list-item v-if="pointType">
                    <f7-label class="title-text">经度</f7-label>
                    <f7-input type="text" v-model="pointLng" disabled></f7-input>
                </f7-list-item>
                <f7-list-item v-if="pointType">
                    <f7-label class="title-text">纬度</f7-label>
                    <f7-input type="text" v-model="pointLat" disabled></f7-input>
                </f7-list-item>
            </f7-list>
            <f7-block-title class="upload-edit-text">其他信息</f7-block-title>
            <f7-list inline-labels no-hairlines class="upload-input-list">
                <f7-list-item v-for="(vl, dx) in paramsList" :key="dx"
                    class="upload-double-input">
                    <f7-input type="text" 
                        placeholder="字段名称"
                        class="item-name-input" 
                        :class="vl.key && 'upload-item-input-with-value'"
                        @input.native="onListenInput($event, 'key', dx)" 
                        :key="dx+'-key'"
                        :value="vl.key"
                        clear-button
                        >
                    </f7-input>
                    <f7-input type="text" 
                        placeholder="字段数值" 
                        class="item-value-input" 
                        :class="vl.value && 'upload-item-input-with-value'"
                        @input.native="onListenInput($event, 'value', dx)" 
                        :key="dx+'-value'"
                        :value="vl.value"
                        clear-button
                        >
                    </f7-input>
                </f7-list-item>
                <f7-list-item v-if="btn_exist" class="upload-add-param-btn"
                    @click="onAddParamItem">
                    <div class="upload-edit-btn">新增参数</div>
                </f7-list-item>
            </f7-list>
        </div>
    </f7-page>
</template>
<script>
import fetchUtil from '../../../js/utils/fetchUtil';
import queryUrl from '../../../js/utils/queryUrl';
import coordtransform from 'coordtransform';
import size from 'lodash/size';
import map from 'lodash/map';
import {
    checkAllContains, wrapMultiPolygon, getTransCoords,
    wrapMultiPolyline, geoJsonToEwkb
} from '../../../js/utils/amapUtil';
import {model_api_url, headers, paramFake} from '../../../js/constants/ApiConfig';
import {paths} from '../../../js/constants/Constants';
const type_point = 'point';
const type_polygon = 'polygon';
const type_line = 'line';
export default {
    name: "UploadEditPage",
    data(){
        return {
            dataName: "",
            pointLng: "",
            pointLat: "",
            pointType: false,
            tableInfo: {},
            up_object: {},
            paramsList: [],
            btn_exist: true,
        }
    },
    mounted(){
        this.up_object = this.$f7Route.context ? this.$f7Route.context.up_object : {};
        this.tableInfo = this.$f7Route.context ? this.$f7Route.context.tableInfo : {};
        if(this.tableInfo.geo_type === "point"){
            let ps = this.up_object.getPosition();
            let poi = coordtransform.gcj02towgs84(ps.lng, ps.lat);
            this.pointLng = poi[0];
            this.pointLat = poi[1];
            this.pointType = true;
        }
    },
    methods: {
        onChangeDataName(e) {
            this.dataName = e.target.value;
        },
        onListenInput(e, type, dx){
            let {paramsList} = this;
            paramsList[dx][type] = e.target.value;
            console.log('paramsList:',paramsList);
            let status = this.getInputStatus();
            this.btn_exist = status === 1 ? true : false;
        },
        onAddParamItem(){
            this.paramsList.push({key: '', value: ''});
            this.btn_exist = false;
        },
        onDelete(dx) {
            this.paramsList.splice(dx, 1);
        },
        /*
         * 状态：1-字段名称和数值都填写完成、2-字段名称/数值都为空、3-字段名称或数值一个为空
         */
        getInputStatus(){
            let {paramsList} = this;
            let count = 0, flag = false;
            for(let i=0; i<paramsList.length; i++){
                if((!size(paramsList[i].key) && size(paramsList[i].value)) || (size(paramsList[i].key) && !size(paramsList[i].value))) {
                    return 3;
                }
                if(!size(paramsList[i].key) && !size(paramsList[i].value)){
                    flag = true;
                }
                count++;
            }
            if(count === paramsList.length){
                return flag ? 2 : 1;
            }
        },
        onClickOk(){
            let sendParams = [], {paramsList, dataName} = this;
            let status = this.getInputStatus();
            if(status === 3 || !size(dataName)){
                return this.$f7.dialog.alert("请将字段填写完成", "提示");
            }
            else if(status === 2){
                paramsList.map(vl => {
                    if(size(vl.key) && size(vl.value)){
                        sendParams.push(vl);
                    }
                })
            }
            else{
                sendParams = paramsList;
            }
            this.uploadData(sendParams)
        },
        getPostBody(drawType, addRows) {
            let columns;
            if (drawType === type_point) {//点位
                columns = ["name", "object_type", "geometry_type", "lng", "lat"].concat(map(addRows, t => t.key));
            } else {
                columns = ["name", "object_type", "geometry_type", "geometry"].concat(map(addRows, t => t.key));
            }
            return {columns}
        },
        getPolygonResult(up_object) {
            let polygon = [];
            polygon.push(up_object)
            let coords = checkAllContains(polygon);
            return wrapMultiPolygon(coords);
        },
        getPolylineResult(up_object) {
            let coords = [];
            let tmps = getTransCoords(up_object.getPath());
            coords.push(tmps);
            return wrapMultiPolyline(coords);
        },
        uploadData(dataList) {
            let {tableInfo: {geo_type, name}, up_object, dataName} = this, postData;
            if (geo_type === type_point) {//点位
                let ps = up_object.getPosition();
                let poi = coordtransform.gcj02towgs84(ps.lng, ps.lat);
                postData = this.getPostBody(geo_type, dataList);
                postData.values = [[dataName, name, geo_type, poi[0] + "", poi[1] + ""].concat(map(dataList, t => t.value))];
            } else if (geo_type === type_polygon) { //围栏
                let geojson = this.getPolygonResult(up_object);
                let ewkb = geoJsonToEwkb(geojson);
                postData = this.getPostBody(geo_type, dataList);
                postData.values = [[dataName, name, geo_type, ewkb].concat(map(dataList, t => t.value))];
            } else if (geo_type === type_line) { //线
                let geojson = this.getPolylineResult(up_object);
                let ewkb = geoJsonToEwkb(geojson);
                postData = this.getPostBody(geo_type, dataList);
                postData.values = [[dataName, name, geo_type, ewkb].concat(map(dataList, t => t.value))];
            }
            let params = {};
            fetchUtil(queryUrl(`${model_api_url}upload/modify`, params),
                {method: 'POST', headers, body: JSON.stringify(postData)})
                .then(resp => {
                    if (resp.status === 'success') {
                        let item = Object.assign({}, this.tableInfo, {ids: resp.object_type_id})
                        this.$f7Router.navigate(paths.upload, {context: {item: item}});
                    }
                    else{
                        this.$f7.dialog.alert('数据上传失败!', '提示');
                    }
                }).catch(err => {
                    console.error(err);
            })
        },
    }
}
</script>
<style lang="scss" scoped>
.ok-btn {
    color: #007aff;
}
.upload-edit-page {
    width: 100%;
    .upload-edit-text {
        line-height: 36px;
        box-sizing: border-box;
        padding-left: 16px;
        color: #8e8e93;
        margin: 0;
        span {
            color: #ff6464;
        }
    }
    .upload-input-list {
        margin-top: 0;
        margin-bottom: 0;
    }
    .upload-edit-base {
        width: 100%;
        box-sizing: border-box;
        padding-left: 16px;
        border-top: 1px solid #c8c7cc;
        border-bottom: 1px solid #c8c7cc;
        background-color: #fff;
        .title-text {
            line-height: 16px;
            color: #8e8e93;
            width: 100px;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        input {
            flex: 1;
            border: none;
            font-size: 14px;
            color: #000;
            background-color: #fff;
            padding: 0;
        }
        .base-info-name-input, .base-info-lng, .base-info-lat {
            width: 100%;
            height: 45px;
            box-sizing: border-box;
            padding: 10px 0;
            display: inline-flex;
            align-items: center;
        }
        .base-info-lng {
            border-top: 1px solid #c8c7cc;
            border-bottom: 1px solid #c8c7cc;
        }
    }
    .item-name-input {
        width: 35%;
        min-width: 0;
        flex-shrink: 0;
    }
    .item-value-input {
        flex: 1;
        margin-left: 5px;
    }

    .upload-edit-btn {
        width: 100%;
        line-height: 44px;
        text-align: center;
        color: #007aff;
        background-color: #fff;
        cursor: pointer;
    }

}
</style>