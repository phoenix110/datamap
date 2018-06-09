<template>
    <div :class="['index-load-panel', isDetailPg ? 'load-panel-isDetailPg' : '']">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="full_abs" v-else>
            <div class="index_wrapper" v-if="!isNoContent">
                <div class="wrapper-title" :style="{'color': showContent.title.color, 'fontSize': showContent.title.fontSize+'px'}">{{showContent.title.value}}</div>
                <div class="wrapper-value" :style="{'color': showContent.value.color, 'fontSize': showContent.value.fontSize+'px'}">{{showContent.value.value}}</div>
            </div>
            <div class="index_wrapper" v-else>
                <div class="wrapper-title">0</div>
                <div class="wrapper-value">0.0</div>
            </div>
            <!-- <div class="index-no-content" v-else>{{Msg}}</div> -->
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
import {EditPoiCardExtraValues} from '../../../../js/constants/Constants.js';
import {editYAxiNumberMenus, roundNum, defaultIndexExtraValues, formulaWordMap} from '../../../../js/constants/Constants';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
const splitSpan = ' / ';
const yKeys = keys(defaultIndexExtraValues.yAxisExt);
export default {
    name: "index-load-panel",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            title: '', 
            value: '',
            isNoContent: false,
            Msg: "",
            showContent: {
                title: {
                    color: '',
                    fontSize: '',
                    value: '',
                },
                value: {
                    color: '',
                    fontSize: '',
                    value: '',
                },
            },
            loaded: false,
            preViewExtraValue: {},
        }
    },
    created(){
        size(this.cData) ? this.getFillData() : null;
    },
    watch: {
        cData: function(){
            size(this.cData) ? this.getFillData() : null;
        }
    },
    methods: {
        getFillData(force_update=false){
            fetchUtil(`${model_api_url}graph/config?force_update=${force_update}${paramFake}`,
            {method: 'POST', headers, body: JSON.stringify(this.cData)})
            .then(resp=>{
                if(resp.result){
                    this.getIndexComp(resp.result);
                }
                else{
                    this.Msg = resp.Msg;
                    this.isNoContent = true;
                }
                this.loaded = true;
            })
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
                        unit = 'k';
                    } else if (val >= 10000) {
                        val = val / 10000;
                        unit = 'w';
                    }
                }
                val = this.getDataVal(val, valueForce, valueRoundNum, 0);
                values.push(`${val} ${unit}`);
                names.push(nameVal);
            })
            yAxisExt_new.aliasMap = aliasMapTmp;// 预览值
            yAxisExt_new.legendMap = legendMap;
            defaultExtraValue.yAxisExt.aliasMap = {}; // 默认值
            saveExtraValue.yAxisExt.aliasMap = aliasMapTmp; // 存储值

            this.preViewExtraValue = preViewExtraValue;
            this.defaultExtraValue = defaultExtraValue;
            this.saveExtraValue = saveExtraValue;

            let labelContent = {}, valueContent = {};
            if (yAxisExt_new.showLabel) {
                let {labelColor: color, labelSize} = yAxisExt_new;
                let fontSize = parseFloat(labelSize) || defaultExtraValue.yAxisExt.labelSize;
                labelContent = {
                    // color: color,
                    fontSize: labelSize,
                    value: names.join(splitSpan),
                }
            }
            let hasMore = size(values) > 1;
            let {valueColor: color, valueSize} = yAxisExt_new;
            let fontSize = parseFloat(valueSize) || defaultExtraValue.yAxisExt.valueSize;
            valueContent = {
                // color: vlcolor,
                fontSize: valueSize,
                value: values.join(splitSpan),
            }
            this.showContent = {
                title: labelContent,
                value: valueContent,
            }
            return "";
        }
    }
}
</script>
<style lang="scss" scoped>
.index-load-panel {
    width: 100%;
    height: 150px;
    .full_abs {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .index_wrapper {
            max-width: 70%;
            .wrapper-title {
                font-family: PingFang SC;
                font-size: 12px;
                text-align: center;
            }
            .wrapper-value {
                font-size: 24px;
                text-align: center;
            }
        }
        .index-no-content {
            width: 100%;
            font-size: 30px;
            text-align: center;
        }
    }
}
.load-panel-isDetailPg {
    height: 100%;
    background-color: #FFFFFF;
    position: relative;
    .detailpg-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
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
}
.chart_loading {
    width: 100%;
    height: 100%;
}
</style>