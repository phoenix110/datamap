<template>
    <div :class="isDetailPg ? 'gauge-panel-isDetailPg' : 'gauge-panel-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="gauge-title" v-if="!isDetailPg">{{cData.title}}</div>
            <div v-else>
                <div class="filter-area">
                    <FiltersPanel 
                        :geoFilters="geoFilters" 
                        :title="chartTitle" 
                        :filterParams="filterParams">
                    </FiltersPanel>
                </div>
                <div class="guage-detail-info" :style="{'visibility': dataShow.data.length !=0 ? '' : 'hidden'}">
                    <div class="title">{{dataShow.title}}</div>
                    <div class="scroll-area">
                        <div class="info-template" v-for="(vl, dx) in dataShow.data" :key="dx" :style="{'color': dataShow.color}">
                            <div class="value">{{vl.value}}</div>
                            <div class="name">{{vl.name}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gauge-draw">
                <vchart ref="gauge" :options="options" class="echarts_gauge" theme="ovilia-green" :init-options="initOptions" />
            </div>
        </div>
    </div>
</template>
<script>
import round from 'lodash/round';
import size from 'lodash/size';
import keys from 'lodash/keys';
import forEach  from 'lodash/forEach';
import isArray  from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import bus from '../../../../js/utils/bus';
import FiltersPanel from '../../commons/filters-panel.vue';
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {editYAxiNumberMenus, roundNum, gauge_target_type_column,
    defaultGaugeExtraValues, gauge_target_type_static, formulaWordMap, new_chart_colors as chart_colors, defaultLegendStyle, guageExtraValues,
} from '../../../../js/constants/Constants'
const hide = {show: false};
const yKeys = keys(defaultGaugeExtraValues.yAxisExt);
export default {
    name: "GaugeLoadPanel",
    props: ["cData", "isDetailPg", 'geoFilters', 'chartTitle', 'viewLoaded'],
    components: {
        FiltersPanel,
    },
    data(){
        return {
            geoFiltersBf: {},
            initOptions: {
                renderer: 'canvas',
                mData: "",
            },
            options: {},
            width: 184,
            loaded: false,
            dataShow: {
                title: "",
                data: []
            },
            filterParams: {},
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
            }
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
                }
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
            fetchUtil(queryUrl(`${model_api_url}graph/config`, {
                force_update,
                vault_name: name,
            }),
            {method: 'POST', headers, body: JSON.stringify(geoFiltersBf)})
            .then(resp=>{
                this.getOption(resp.result || {});
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
                defaultGaugeExtraValues[key]);
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
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
        fillExtDefault(ext, def) {
            forEach(def, (val,key)=>{!ext[key] && (ext[key] = val)});
        },
        getOption(chartData) {
            let _this = this;
            let {title, yAxis, extra, target_type: et, target_value: static_value} = _this.cData;

            _this.preViewExtraValue = extra;
            let yAlis = yAxis[0].items;
            let newYAlis = [], target_value = 0;
            if (et === gauge_target_type_static) {
                target_value = static_value || 0;
            } else {
                newYAlis = yAxis[1].items;
            }
            let target_type = et;
            let width = _this.width;
            let isDetailPg = _this.isDetailPg;

            let legendExt = this.getExtraVal('legendExt');
            // 新追加属性
            this.fillExtDefault(legendExt, defaultLegendStyle);
            let yAxisExt = this.getExtraVal('yAxisExt');
            let yAxisExt_new = pick(yAxisExt, yKeys);
            let preViewExtraValue = {legendExt, yAxisExt: yAxisExt_new};// 预览值
            let defaultExtraValue = cloneDeep(defaultGaugeExtraValues);// 默认值
            let saveExtraValue = cloneDeep(preViewExtraValue);// 存储值

            let item = yAlis[0], name = '', value = 0, legend = [];
            if (item) {
                name = `${item.h_value}-${formulaWordMap[item.func]}`;
                value = ((chartData[0] || {}).result || {})[item.key] || 0;
            }
            if (target_type === gauge_target_type_column) {
                let key = (newYAlis[0] || {}).key || '';
                target_value = ((chartData[1] || {}).result || {})[key] || 0;
            }
            let target = target_value ? parseFloat(target_value) : 0;
            let pointPercent = target ? value / target : 0;
            let percent = pointPercent * 100;

            let aliasMapTmp = {}, colorMapTmp = {},
                yExt_new = yAxisExt_new, legendMap = {},
                yExt_default = defaultExtraValue.yAxisExt,
                yExt_save = saveExtraValue.yAxisExt;
            let alias = yAxisExt.aliasMap || {},
                color = yAxisExt.colorMap || {};
            let nc = color[name];
            nc ? (colorMapTmp[name] = nc) : (nc = chart_colors[0]);
            let nameVal = alias[name];
            nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
            legend.push({name: nameVal, icon: 'ract'});
            legendMap[name] = {color: nc, alias: nameVal};
            yExt_new.aliasMap = aliasMapTmp;// 预览值
            yExt_new.colorMap = colorMapTmp;
            yExt_new.legendMap = legendMap;
            yExt_default.aliasMap = {};// 默认值
            yExt_default.colorMap = {};
            yExt_save.aliasMap = aliasMapTmp;// 存储值
            yExt_save.colorMap = colorMapTmp;

            percent = this.getDataVal(percent, yAxisExt_new.percentForce,
                yAxisExt_new.percentRoundNum, 0); // 百分比格式化
            target = this.getDataVal(target, yAxisExt_new.targetForce,
                yAxisExt_new.targetRoundNum, 0); // 目标值格式化
            value = this.getDataVal(value, yAxisExt_new.valueForce,
                yAxisExt_new.valueRoundNum, 0); // 当前值格式化

            // 设置颜色
            let gaugeColor = nc, bgColor = '#38497B';
            if (isArray(nc)) {
                let [points, colors] = nc;
                bgColor = 'rgba(0, 0, 0, 0.2)';
                gaugeColor = colors[colors.length - 1];
                forEach(points, (it, index)=>{
                    if (percent <= it) {
                        gaugeColor = colors[index];
                        return false;
                    }
                });
            }
            // let lineWidth = isDetailPg ? 50 : width * 0.12;
            let lineWidth =  isDetailPg ? 48 : 28;
            let options = {
                animationDuration: 5000,
                series: {
                    radius: isDetailPg ? "85%" : "90%",
                    name: nameVal,
                    type: "gauge",
                    center: ['50%', '50%'],
                    min: 0,
                    max: target,
                    splitNumber:1,
                    startAngle: 225,
                    endAngle: -45,
                    axisTick: hide,
                    splitLine: {
                        show: false,
                        length: (lineWidth - 12) / 2
                    },
                    axisLabel:hide,
                    pointer: hide,
                    title: hide,
                    detail: hide,
                    axisLine: {
                        show:true,
                        lineStyle: {
                            color: [[pointPercent, gaugeColor], [1, bgColor]],
                            width: lineWidth
                        }
                    },
                    data: [{value: value, name: nameVal}]
                }
            };

            // 处理detail
            let {showPercent, showValue} = yExt_new;
            if ((showPercent || showValue) || isDetailPg) {
                let formatter = [], rich = {}, fontSize = width * 0.12;
                if (showPercent || isDetailPg) {
                    if(isDetailPg){
                        percent = percent.length > 7 ? percent.slice(0, 5)+'...' : percent;
                    }
                    else{
                        percent = percent.length > 4 ? percent.slice(0, 3)+'...' : percent;
                    }
                    formatter.push(`{percent|${percent}%}`);
                    rich.percent = {
                        color: isDetailPg ? '#57585C' : '#38393C', 
                        fontSize: isDetailPg ? 32 : 24,
                    }
                }
                if (showValue || isDetailPg) {
                    if(isDetailPg){
                        value = value.length > 6 ? value.slice(0, 5)+'...' : value;
                    }
                    else{
                        value = value.length > 4 ? value.slice(0, 3)+'...' : value;
                    }
                    formatter.push(`{value|${value}}`);
                    rich.value = {
                        color: "#57585C",
                        fontSize: 16,
                    }
                }
                if ((showPercent && showValue) || isDetailPg) {
                    rich.value.fontSize = _this.width * 0.08;
                    rich.value.padding = [5, 3, 5, 3];
                }
                options.series.detail = {
                    show: true,
                    offsetCenter: [0,0],
                    formatter: formatter.join('\n'),
                    rich: rich
                };
            }

            // 处理label
            if (yExt_new.showTarget) {
                let str = target.length > 5 ? target.slice(0, 3)+'...' : target;
                options.series.axisLabel = {
                    distance: -8,
                    formatter:(v)=>`{a|${v ? str : 0}}`,
                    rich:{
                        a: {
                            padding:[0, 15, 0, 15],
                            color: "#57585C",
                            fontSize: 16
                        }
                    }
                };
            }

            if (!isDetailPg && legend.length > 1) {
                options.legend = {
                    animation: true,
                    data: legend,
                    orient: 'horizontal',
                    bottom: 0,
                    type: 'scroll',
                    itemWidth: 6,
                    itemHeight: 6,
                    padding: [0, 20, 6, 20],
                    textStyle: {
                        lineHeight: 16,
                        color: "#6D737A",
                        fontSize: "14px",
                        fontWeight: 300,
                    },
                };
            }
            options.grid = {
                containLabel: true,
                right: 30,
                left: 20,
                top: 10,
                bottom: legendExt.show ? 20 : 40,
            };
            this.dataShow = {
                title: title,
                color: gaugeColor,
                data: [
                    {name: "具体数值", value: value},
                    {name: "百分比", value: percent+'%'}
                ]
            }
            this.options = options;
            return "";
        }
    }
}
</script>
<style scoped lang="scss">
.gauge-panel-style {
    width: 100%;
    .gauge-title {
        line-height: 20px;
        font-size: 14px;
        font-weight: 700;
        color: #38393C;
        box-sizing: border-box;
        padding: 24px 21px;
        word-wrap: break-word;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .gauge-draw {
        width: 100%;
        height: 182px;
        position: relative;
        overflow: hidden;
        .echarts_gauge {
            width: 100%;
            height: 100%;
        }
    }
    .chart_loading {
        width: 100%;
        height: 100%;
        min-height: 250px;
    }
}
.gauge-panel-isDetailPg {
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    position: relative;
    .content-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .guage-detail-info {
            width: 100%;
            height: 120px;
            box-sizing: border-box;
            padding: 5px 0 0 0;
            font-family: PingFang SC;
            .scroll-area{
                width: 100%;
                height: 87px;
                overflow-x: auto;
                display: inline-flex;
                flex-wrap: nowrap;
                .info-template {
                    display: inline-block;
                    padding-left: 16px;
                    box-sizing: border-box;
                    .value {
                        font-size: 48px;
                        line-height: 67px;
                    }
                    .name {
                        font-size: 14px;
                        line-height: 20px;
                        color: #6D737A;
                    }
                }
            };
            .title{
                width: 100%;
                line-height: 22px;
                font-size: 16px;
                color: #57585C;
                padding-left: 16px;
                box-sizing: border-box;
            }
        }
        .gauge-draw {
            width: 100%;
            flex: 1;
            .echarts_gauge {
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