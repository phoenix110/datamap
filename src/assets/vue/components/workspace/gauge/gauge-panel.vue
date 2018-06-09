<template>
    <div :class="isDetailPg ? 'gauge-panel-isDetailPg' : 'gauge-panel-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="content-area" v-else>
            <div class="gauge-title">{{cData.title}}</div>
            <div class="gauge-draw">
                <vchart ref="gauge" :options="options" class="echarts_gauge" theme="ovilia-green" :init-options="initOptions" />
            </div>
        </div>
    </div>
</template>
<script>
import {guageExtraValues} from '../../../../js/constants/Constants.js';
import round from 'lodash/round';
import size from 'lodash/size';
import keys from 'lodash/keys';
import forEach  from 'lodash/forEach';
import isArray  from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import fetchUtil from '../../../../js/utils/fetchUtil';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {editYAxiNumberMenus, roundNum, gauge_target_type_column,
    defaultGaugeExtraValues, gauge_target_type_static, formulaWordMap, new_chart_colors as chart_colors, defaultLegendStyle,
} from '../../../../js/constants/Constants'
const hide = {show: false};
const yKeys = keys(defaultGaugeExtraValues.yAxisExt);
export default {
    name: "GaugeLoadPanel",
    props: ["cData", "isDetailPg"],
    data(){
        return {
            initOptions: {
                renderer: 'canvas',
                mData: "",
            },
            options: {},
            width: 184,
            loaded: false,
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
                this.getOption(resp.result);
                this.loaded = true;
            })
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
            legend.push({name: nameVal, icon: 'circle'});
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
                // bgColor = 'rgba(255,255,255,0.2)';
                bgColor = 'rgba(0, 0, 0, 0.2)';
                gaugeColor = colors[colors.length - 1];
                forEach(points, (it, index)=>{
                    if (percent <= it) {
                        gaugeColor = colors[index];
                        return false;
                    }
                });
            }
            let lineWidth = isDetailPg ? 50 : width * 0.12;
            let options = {
                animationDuration: 5000,
                series: {
                    radius: isDetailPg ? "80%" : width * 0.5,
                    name: nameVal,
                    type: "gauge",
                    center: !isDetailPg ? ['50%', '50%'] : ['50%', '45%'],
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
                    formatter.push(`{percent|${percent}%}`);
                    rich.percent = {
                        // color: yExt_new.percentColor,
                        color: gaugeColor, 
                        fontSize,
                    }
                }
                if (showValue || isDetailPg) {
                    formatter.push(`{value|${value}}`);
                    rich.value = {
                        // color: yExt_new.valueColor, 
                        color: "rgb(170, 170, 170)",
                        fontSize,
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
                options.series.axisLabel = {
                    distance: -8,
                    formatter:(v)=>`{a|${v ? target : 0}}`,
                    rich:{
                        a: {
                            padding:[0, 15, 0, 15],
                            // color: yExt_new.targetColor,
                            color: "rgb(170, 170, 170)",
                            fontSize: 12
                        }
                    }
                };
            }

            if (isDetailPg && legendExt.show) {
                let [top, left] = legendExt.position.split('_');
                let orient = top === 'top' || top === 'bottom' ? 'horizontal' : 'vertical';
                options.series.itemStyle = {normal: {color: gaugeColor}};
                options.legend = {
                    show: true,
                    type: 'scroll',
                    width: '50%',
                    // orient: orient,
                    orient: 'horizontal',
                    // top: top,
                    // left: left,
                    data: legend,
                    bottom: 12,
                    itemWidth: 10,
                    itemHeight: 10,
                    pageButtonGap: 10,
                    padding: [0, 20, 0, 20],
                    left: 'center',
                    textStyle: {color: "rgb(170, 170, 170)"},
                    pageTextStyle: {color: "rgb(170, 170, 170)"},
                    pageIconColor: {color: "rgb(170, 170, 170)"},
                    // selectedMode: true, tooltip: {show: true, formatter:e=>''}
                };
            }
            options.grid = {
                containLabel: true,
                right: 30,
                left: 20,
                top: 10,
                bottom: legendExt.show ? 20 : 40,
            };

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
        line-height: 18px;
        font-size: 15px;
        font-weight: 700;
        color: #4A4D51;
        box-sizing: border-box;
        padding: 25px 21px;
        word-wrap: break-word;
    }
    .gauge-draw {
        width: 100%;
        height: 232px;
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
        min-height: 300px;
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
        .gauge-title {
            display: none;
        }
        .gauge-draw {
            height: 100%;
            width: 100%;
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