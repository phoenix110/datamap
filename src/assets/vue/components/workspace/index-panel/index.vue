<template>
    <div :class="isDetailPg ? 'load-panel-isDetailPg' : 'index-load-panel'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg_loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="filter-area" v-if="isDetailPg">
                <FiltersPanel 
                    :geoFilters="geoFilters" 
                    :title="chartTitle" 
                    :filterParams="filterParams">
                </FiltersPanel>
            </div>
            <div class="index-panel-content">
                <div class="index-panel-show" v-if="!isNoContent">
                    <div class="index-item" v-for="(vl, dx) in showContent" :key="dx">
                        <div class="index-item-title">
                            <div class="index-item-title-text" :style="{fontSize: vl.title.length > 8 && !isDetailPg ? '12px' : '14px'}">{{vl.title}}</div>
                        </div>
                        <div class="index-item-value">
                            <div class="index-item-value-num">{{vl.value}}</div>
                            <div class="index-item-value-unit">{{vl.unit}}</div>
                        </div>
                    </div>
                </div>
                <div class="index-panel-show" v-else>
                    <div class="index-no-content">0/0.0</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import fetchUtil from '../../../../js/utils/fetchUtil';
import size from 'lodash/size';
import forEach from 'lodash/forEach';
import round from 'lodash/round';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import bus from '../../../../js/utils/bus';
import FiltersPanel from '../../commons/filters-panel.vue';
import {EditPoiCardExtraValues} from '../../../../js/constants/Constants.js';
import {editYAxiNumberMenus, roundNum, defaultIndexExtraValues, formulaWordMap} from '../../../../js/constants/Constants';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
const splitSpan = ' / ';
const yKeys = keys(defaultIndexExtraValues.yAxisExt);
export default {
    name: "index-load-panel",
    props: ['cData', 'isDetailPg', 'geoFilters', 'chartTitle', 'viewLoaded'],
    components: {FiltersPanel},
    data(){
        return {
            title: '', 
            value: '',
            isNoContent: false,
            Msg: "",
            showContent: [
                {
                    title: "",
                    value: "",
                }
            ],
            loaded: false,
            preViewExtraValue: {},
            filterParams: {},
            geoFiltersBf: {},
            alreadyListener: false,
        }
    },
    created(){
        if(size(this.cData)){
            let {cData, geoFilters, alreadyListener, isDetailPg} = this;
            this.geoFiltersBf = geoFilters;
            this.getFillData();
            this.filterParams = {
                source: cData.source,
                object_type: cData.object_type,
                geometry_type: cData.geometry_type,
            };
            //增加筛选器监听事件
            if(!alreadyListener && size(geoFilters.filters) && isDetailPg){
                this.alreadyListener = true;
                bus.$on("graphFilterListener", this.refreshGraphFilter)
            }
        }
    },
    watch: {
        cData: function(){
            if(size(this.cData)){
                let {cData, geoFilters, alreadyListener, isDetailPg} = this;
                if(alreadyListener) return;
                this.geoFiltersBf = geoFilters;
                this.getFillData();
                this.filterParams = {
                    source: cData.source,
                    object_type: cData.object_type,
                    geometry_type: cData.geometry_type,
                };
                //增加筛选器监听事件
                if(!alreadyListener && size(geoFilters.filters) && isDetailPg){
                    this.alreadyListener = true;
                    bus.$on("graphFilterListener", this.refreshGraphFilter)
                }
            }
        }
    },
    methods: {
        getFillData(force_update=false){
            let {cData: {name, filters}, geoFiltersBf} = this;
            fetchUtil(`${model_api_url}graph/config?force_update=${force_update}${paramFake}&vault_name=${name}`,
            {method: 'POST', headers, body: JSON.stringify(geoFiltersBf)})
            .then(resp=>{
                if(resp.result){
                    this.getIndexComp(resp.result || {});
                }
                else{
                    this.Msg = resp.Msg;
                    this.isNoContent = true;
                }
                this.loaded = true;
            })
        },
        refreshGraphFilter(filters){
            this.geoFiltersBf.filters = filters;
            this.getFillData();
        },
        getExtraVal(key) {
            let val = this.preViewExtraValue;
            return cloneDeep(val && val[key] ? val[key] :
                defaultIndexExtraValues[key]);
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
        },
        getIndexComp(chartData) {
            this.preViewExtraValue = this.cData ? this.cData.extra : null;
            let {yAxis} = this.cData;
            // 编辑属性
            let yAxisExt = this.getExtraVal('yAxisExt');
            let yAxisExt_new = pick(yAxisExt, yKeys);
            let preViewExtraValue = {yAxisExt: yAxisExt_new};// 预览值
            let defaultExtraValue = cloneDeep(defaultIndexExtraValues);// 默认值
            let saveExtraValue = cloneDeep(preViewExtraValue);// 存储值

            let yAlis = yAxis[0].items;
            let legendMap = {}, aliasMapTmp = {},
                aliasMap = yAxisExt.aliasMap || {},
                {valueRoundNum, valueForce, shortValue} = yAxisExt;
            let names = [], values = [];
            this.showEditBtn = false;
            forEach(yAlis, (item, index)=>{
                this.showEditBtn = true;
                let name = `${item.h_value}-${formulaWordMap[item.func]}`;
                let nameVal = aliasMap[name];
                nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                legendMap[name] = {alias: nameVal};
                let val =((chartData[index] || {}).result || {})[item.key] || 0,
                    unit = '';
                if (shortValue) {
                    if (val >= 1000 && val < 10000) {
                        val = val / 1000;
                        unit = '千';
                    } else if (val >= 10000) {
                        val = val / 10000;
                        unit = '万';
                    }
                }
                val = this.getDataVal(val, valueForce, valueRoundNum, 0);
                // values.push(`${val} ${unit}`);
                values.push({
                    num: val,
                    unit: unit,
                })
                names.push(nameVal);
            })
            yAxisExt_new.aliasMap = aliasMapTmp;// 预览值
            yAxisExt_new.legendMap = legendMap;
            defaultExtraValue.yAxisExt.aliasMap = {}; // 默认值
            saveExtraValue.yAxisExt.aliasMap = aliasMapTmp; // 存储值

            this.preViewExtraValue = preViewExtraValue;
            this.defaultExtraValue = defaultExtraValue;
            this.saveExtraValue = saveExtraValue;

            let labelContent = {}, valueContent = {}, showContent = [];
            values.map((vl, dx) => {
                let title = "";
                if(yAxisExt_new.showLabel && !!names[dx]){
                    title = names[dx];
                }
                showContent.push({
                    value: vl.num,
                    title: title,
                    unit: vl.unit,
                })
            })
            this.showContent = showContent;
            return "";
        }
    }
}
</script>
<style lang="scss" scoped>
.content-area {
    width: 100%;
    height: 100%;
}
.index-load-panel {
    width: 100%;
    min-height: 82px;
    padding: 16px 21px;
    box-sizing: border-box;
    .chart_loading {
        min-height: 50px;
    }
    .index-panel-content {
        width: 100%;
        .index-panel-show {
            .index-item {
                width: 100%;
                line-height: 50px;
                margin-top: 16px;
                display: inline-flex;
                font-family: PingFang SC;
                .index-item-title {
                    width: 120px;
                    height: 50px;
                    margin-right: 8px;
                    font-size: 14px;
                    font-weight: 400;
                    color: #6b7280;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    .index-item-title-text {
                        line-height: 20px;
                        overflow: hidden;
                        word-break: break-all;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                    }
                }
                .index-item-value {
                    flex: 1;
                    font-size: 36px;
                    font-weight: 300;
                    color: #313133;
                    text-align: right;
                    height: 50px;
                    position: relative;
                    .index-item-value-num {
                        line-height: 50px;
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        box-sizing: border-box;
                        padding-right: 40px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .index-item-value-unit {
                        line-height: 50px;
                        position: absolute;
                        right: 0;
                        width: 40px;
                    }
                }
            }
            &>.index-item:first-child {
                margin-top: 0;
            }
        }
        .index-no-content {
            width: 100%;
            line-height: 50px;
            font-size: 36px;
            color: #313133;
            text-align: center;
        }
    }
}
.load-panel-isDetailPg {
    height: 100%;
    width: 100%;
    background-color: #fcfcfc;
    position: relative;
    .detailpg_loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.2);
        .preloader {
            width: 35px;
            height: 35px;
        }
        .ml5 {
            font-size: 30px;
            margin-left: 10px;
        }
    }
    .filter-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }
    .index-panel-content {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 0 21px;
        position: relative;
        .index-panel-show {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0);
            .index-item {
                height: 70px;
                margin-top: 32px;
                font-family: PingFang SC;
                .index-item-title {
                    .index-item-title-text {
                        line-height: 20px;
                        color: #6b7280;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                .index-item-value {
                    line-height: 50px;
                    font-size: 36px;
                    font-weight: 300;
                    color: #313133;
                    display: inline-flex;
                }
            }
            &>.index-item:first-child {
                margin-top: 0;
            }
        }
        .index-no-content {
            width: 100%;
            line-height: 50px;
            font-size: 36px;
            color: #313133;
            text-align: center;
        }
    }
}
.chart-loading {
    width: 100%;
    height: 100%;
}
</style>