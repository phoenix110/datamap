<template>
    <div :class="isDetailPg ? 'data-radar-isDetailPg' : 'data-radar-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="content-area" v-else>
            <div class="radar-title" v-if="!isDetailPg">{{cData.title}}</div>
            <div class="radar-detail-info" v-if="isDetailPg" :style="{'visibility': dataShow.data.length !=0 ? '' : 'hidden'}">
                <div class="scroll-area">
                    <div class="info-template" v-for="(value, index) in dataShow.data" :key="index" :style="{'color': dataShow.color}">{{value}}{{index===dataShow.data.length-1 ? '' : '，'}}</div>
                </div>
                <div class="text">{{dataShow.name}}</div>
            </div>
            <div class="radar-draw">
                <vchart class="echarts_radar" :options="options" :init-options="initOptions" />
            </div>
        </div>
    </div>
</template>
<script>
import size from 'lodash/size';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import round from 'lodash/round';
import max from 'lodash/max';
import cloneDeep from 'lodash/cloneDeep';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import fetchUtil from '../../../../js/utils/fetchUtil';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {radar_colors, radarMenus, defaultRadarExtraValues,
    max_setting_type_1, maxItemLen, h_type_formula, defaultLegendStyle} from '../../../../js/constants/Constants'
const hide = {show: false};
const colorLen = size(radar_colors);
const xKeys = keys(defaultRadarExtraValues.xAxisExt);
const yKeys = keys(defaultRadarExtraValues.yAxisExt);
export default {
    name: 'data-radar',
    props: ['cData', 'isDetailPg'],
    data() {
        return {
            initOptions: {
                renderer: "canvas"
            },
            options: {},
            dataShow: {
                name: '',
                data: [],
                color: '',
            },
            loaded: false,
        };
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
                this.getOption(resp.result);
                this.loaded = true;
            })
        },
        omitColor(t) {
            if (typeof t === 'object') {
                forEach(t, (v, k) => {
                    if (k === 'color' || k === 'fontSize'){
                        delete t[k];
                    }else {
                        this.omitColor(v)
                    }
                })
            }
        },
        getExtraVal(key) {
            let val = this.preViewExtraValue;
            return cloneDeep(val && val[key] ? val[key] : defaultRadarExtraValues[key]);
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
        },
        fillExtDefault(ext, def) {
            forEach(def, (val,key)=>{!ext[key] && (ext[key] = val)});
        },
        getOption(chartData) {
            let _this = this;
            let {xAxis, yAxis, extra} = _this.cData;
            let xAlis = yAxis[0].items;
            let yAlis = xAxis;
            _this.preViewExtraValue = extra;
            let isDetailPg = _this.isDetailPg;
            // 编辑属性
            let legendExt = _this.getExtraVal('legendExt');
            // 新追加属性
            this.fillExtDefault(legendExt, defaultLegendStyle);
            let xAxisExt = _this.getExtraVal('xAxisExt');
            let yAxisExt = _this.getExtraVal('yAxisExt');
            let xAxisExt_new = pick(xAxisExt, xKeys);
            let yAxisExt_new = pick(yAxisExt, yKeys);
            let preViewExtraValue = {legendExt, xAxisExt: xAxisExt_new, yAxisExt: yAxisExt_new};// 预览值
            let defaultExtraValue = cloneDeep(defaultRadarExtraValues);// 默认值
            let saveExtraValue = cloneDeep(preViewExtraValue); // 存储值
            let defaultMaxLen = defaultRadarExtraValues.xAxisExt.maxLen;
            !xAxisExt.maxLen && (saveExtraValue.xAxisExt.maxLen = defaultMaxLen);

            let data = [], legend = [], indicator = [],
                colors = [], legendMap = {};
            if (size(xAlis) >= 3 && size(yAlis)) {
                let names = chartData[yAlis[0].key] || [];
                let {type, settingValue} = yAxisExt_new.maxSetting;
                settingValue = settingValue || {};
                let maxMap = {}, isToggle = type === max_setting_type_1;
                forEach(xAlis, ({ key, h_type, h_value})=>{
                    maxMap[key] = Math.ceil(max(chartData[key])) || 1;
                    let v = isToggle ? settingValue : (settingValue[key] || maxMap[key]);
                    key = h_type === h_type_formula ? h_value : key ;
                    indicator.push({name: key, max: v});
                })
                xAxisExt_new.showAll = size(names) > defaultMaxLen;
                xAxisExt_new.defaultMaxLen = defaultMaxLen;
                if (xAxisExt_new.maxLen !== -1) {// 全部显示
                    names = names.slice(0, xAxisExt_new.maxLen || defaultMaxLen);
                }

                let {valueForce:force, valueRoundNum:roundNum} = yAxisExt_new;
                let alias = yAxisExt.aliasMap || {},
                    color = yAxisExt.colorMap || {},
                    aliasMapTmp = {}, colorMapTmp = {};
                data = map(names, (name, i)=>{
                    let value = [];
                    forEach(xAlis, it=>{
                        let val = (chartData[it.key] || [])[i] ;
                        value.push(_this.getDataVal(val, force, roundNum, 0));
                    })
                    let nc = color[name];
                    nc ? (colorMapTmp[name] = nc) : (nc = radar_colors[i % colorLen] || radar_colors[0]);
                    colors.push(nc);
                    let nameVal = alias[name];
                    nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                    legend.push({name: nameVal, icon: 'circle'});
                    legendMap[name] = {color: nc, alias: nameVal};
                    // return {name: nameVal, value, areaStyle: {emphasis: {color: nc, opacity: 0.3}}};
                    return {name: nameVal, value};
                })
                yAxisExt_new.aliasMap = aliasMapTmp;// 预览值
                yAxisExt_new.colorMap = colorMapTmp;
                yAxisExt_new.legendMap = legendMap;
                yAxisExt_new.maxMap = maxMap;
                defaultExtraValue.yAxisExt.aliasMap = {};// 默认值
                defaultExtraValue.yAxisExt.colorMap = {};
                saveExtraValue.yAxisExt.aliasMap = aliasMapTmp;// 存储值
                saveExtraValue.yAxisExt.colorMap = colorMapTmp;
            }

            let options = {
                color: colors,
                animationDuration: 1000,
                textStyle: {
                    color: '#AFB8DB',
                    fontSize: 12
                },
                radar:{
                    // triggerEvent: true,
                    splitArea: {show:false},
                    center: ['50%', '45%'],
                    radius: '60%',
                    splitLine: {lineStyle: {color: '#6C7692'}},
                    axisLine: {lineStyle: {color: '#6C7692'}},
                    indicator: indicator,
                    name: {show: false, color:'#AFB8DB'},
                },
                series: {
                    data,
                    type: 'radar',
                    symbol: 'roundRect',
                    silent: _this.isDetailPg ? false : true,
                    label: {
                        show: false,
                    }
                }
            }
            options.grid = {
                containLabel: true,
                right: 30,
                left: 30,
                top: 10,
                bottom: isDetailPg ? 40 : 20,
            }
            options.tooltip = _this.isDetailPg ? {
                trigger: 'item',
                confine: true,
                axisPointer: {
                    handle: {
                        show: true,
                    },
                },
                formatter: function(params, ticket, callback){
                    _this.dataShow = {
                        name: params.data ? params.data.name : '',
                        data: params.data ? params.data.value : [],
                        color: params.color,
                    };
                }
            } : hide;
            options.series.title = {
                show: true,
                offsetCenter: [0, "85%"], //标题位置设置
                textStyle: { //标题样式设置
                    color: "#fff",
                    fontSize: 15
                }
            };
            if(isDetailPg && legendExt.show){
                options.legend = {
                    type: 'scroll',
                    orient: 'horizontal',
                    bottom: _this.isDetailPg ? 30 : 12,
                    itemWidth:10,
                    itemHeight:10,
                    data: legend,
                    pageButtonGap: 10,
                    padding: [0, 20, 0, 20],
                    left: 'center',
                }
            }

            this.options = options;
            return "";
        },
    }
};
</script>
<style scoped lang="scss">
.data-radar-style {
    width: 100%;
    .radar-title {
        line-height: 18px;
        font-size: 15px;
        font-weight: 700;
        color: #4A4D51;
        box-sizing: border-box;
        padding: 25px 21px;
        word-wrap: break-word;
    }
    .radar-draw {
        width: 100%;
        height: 232px;
        position: relative;
        overflow: hidden;
        .echarts_radar {
            width: 100%;
            height: 100%;
        }
    }
    .chart_loading {
        width: 100%;
        height: 100%;
        min-height: 300px;
    }
}
.data-radar-isDetailPg {
    width: 100%;
    height: 100%;
    position: relative;
    .content-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .radar-detail-info {
            width: 100%;
            height: 100px;
            box-sizing: border-box;
            padding: 15px 24px 0 24px;
            font-family: PingFang SC;
            .scroll-area{
                width: 100%;
                height: 67px;
                overflow-x: auto;
                display: inline-flex;
                flex-wrap: nowrap;
                .info-template {
                    display: inline-block;
                    height: 67px;
                    font-size: 48px;
                    line-height: 67px;
                }
            };
            .text{
                line-height: 20px;
                font-size: 14px;
                color: #6D737A;
            }
        }
        .radar-draw {
            width: 100%;
            flex: 1;
            position: relative;
            .echarts_radar {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                height: 100%;
            }
        }
    }
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
</style>