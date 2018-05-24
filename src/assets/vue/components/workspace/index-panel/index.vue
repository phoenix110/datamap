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
import size from 'lodash/size'
import forEach from 'lodash/forEach'
import round from 'lodash/round'
import cloneDeep from 'lodash/cloneDeep'
import {EditPoiCardExtraValues} from '../../../../js/constants/Constants.js';
import {editYAxiNumberMenus, roundNum, defaultIndexExtraValues} from '../../../../js/constants/Constants';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
const splitSpan = ' / '
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
        }
    },
    created(){
        this.getFillData();
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
        getIndexVal(config, chartData) {
            let {poiCard:{p_fontSize,p_color,roundNum,digit},title:{editTitle}} =config.extra.poiCard&&config.extra||EditPoiCardExtraValues;
            let names = [], vals = [];
            editTitle = editTitle ||{};
            let sum = config.yAxis[0].items || [];
            sum.forEach((item, index)=>{
                let name = `${item.h_value}-${editYAxiNumberMenus[item.func]}`;
                names.push(editTitle[name]||name);
                vals.push(round(((chartData[index] || {}).result || {})[item.key] || 0, roundNum));
            })
            return [
                names.join(splitSpan),
                vals.join(splitSpan)
            ]
        },

        getExtraVal(val, key) {
            return cloneDeep(val && val[key] ? val[key] :
                defaultIndexExtraValues[key]);
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
        },
        getIndexComp(chartData) {
            let config = this.cData;
            let yAxisExt = this.getExtraVal(config.extra, 'yAxisExt');

            let aliasMap = yAxisExt.aliasMap || {},
                {valueRoundNum, valueForce, shortValue} = yAxisExt;
            let names = [], values = [];
            forEach(config.yAxis[0].items, (item, index)=>{
                let name = `${item.h_value}-${editYAxiNumberMenus[item.func]}`;
                let nameVal = aliasMap[name] || name;
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
            });
            let labelContent = {}, valueContent = {};
            if (yAxisExt.showLabel){
                let {labelColor: color, labelSize} = yAxisExt;
                let fontSize = parseFloat(labelSize) || defaultIndexExtraValues.yAxisExt.labelSize;
                labelContent = {
                    // color: color,
                    fontSize: labelSize,
                    value: names.join(splitSpan),
                }
            }
            let hasMore = size(values) > 1;
            let {valueColor: vlcolor, valueSize} = yAxisExt;
            let fontSize = parseFloat(valueSize) || defaultIndexExtraValues.yAxisExt.valueSize;
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
        },
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