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
import forEach  from 'lodash/forEach';
import isArray  from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import fetchUtil from '../../../../js/utils/fetchUtil';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {editYAxiNumberMenus, roundNum, gauge_target_type_column,
    defaultGaugeExtraValues, new_chart_colors
} from '../../../../js/constants/Constants'
const hide = {show: false}
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
        this.getFillData();
    },
    methods: {
        getFillData(force_update=false){
            fetchUtil(`${model_api_url}graph/config?force_update=${force_update}${paramFake}`,
            {method: 'POST', headers, body: JSON.stringify(this.cData)})
            .then(resp=>{
                // this.getOpt(resp.result);
                this.getOption(resp.result);
                this.loaded = true;
            })
        },
        getExtraVal(val, key) {
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
        getOption(chartData) {
            let _this = this;
            let isHide = !_this.isDetailPg; 
            let {yAxis, title, target_type, target_value, extra} = this.cData;
            let legendExt = this.getExtraVal(extra, 'legendExt');
            let yAxisExt = this.getExtraVal(extra, 'yAxisExt');
            let item = yAxis[0].items[0], name = '', value = 0, legend = [];
            if (item) {
                name = `${item.h_value}-${editYAxiNumberMenus[item.func]}`;
                value = ((chartData[0] || {}).result || {})[item.key] || 0;
            }
            if (target_type === gauge_target_type_column) {
                let key = (yAxis[1].items[0] || {}).key || '';
                target_value = ((chartData[1] || {}).result || {})[key] || 0;
            }

            let target = target_value ? parseFloat(target_value) : 0;
            let pointPercent = target ? value / target : 0;
            let percent = pointPercent * 100;
            let alias = yAxisExt.aliasMap || {},
                color = yAxisExt.colorMap || {};
            let nc = color[name] || new_chart_colors[0];
            let nameVal = alias[name] || name;
            legend.push({name: nameVal, icon: 'circle'});

            percent = this.getDataVal(percent, yAxisExt.percentForce,
                yAxisExt.percentRoundNum, 0); // 百分比格式化
            target = this.getDataVal(target, yAxisExt.targetForce,
                yAxisExt.targetRoundNum, 0); // 目标值格式化
            value = this.getDataVal(value, yAxisExt.valueForce,
                yAxisExt.valueRoundNum, 0); // 当前值格式化

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
            let lineWidth = !isHide ? 50 : _this.width * 0.12;
            let options = {
                animation: true,
                series: {
                    radius: !isHide ? "80%" : _this.width * 0.5,
                    name: nameVal,
                    type: "gauge",
                    center: isHide ? ['50%', '50%'] : ['50%', '45%'],
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
            }

            let {showPercent, showValue} = yAxisExt;
            if ((showPercent || showValue) || !isHide) {
                let formatter = [], rich = {}, fontSize = _this.width * 0.12;
                if (showPercent || !isHide) {
                    formatter.push(`{percent|${percent}%}`);
                    rich.percent = {
                        // color: yAxisExt.percentColor, 
                        color: gaugeColor,
                        fontSize
                    }
                }
                if (showValue || !isHide) {
                    formatter.push(`{value|${value}}`);
                    rich.value = {
                        // color: yAxisExt.valueColor, 
                        color: "rgb(170, 170, 170)",
                        fontSize
                    }
                }
                if ((showPercent && showValue) || !isHide) {
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
            if (yAxisExt.showTarget) {
                options.series.axisLabel = {
                    distance: -8,
                    formatter:(v)=>`{a|${v ? target : 0}}`,
                    rich:{
                        a: {
                            padding:[0, 15, 0, 15],
                            // color: yAxisExt.targetColor,
                            color: "rgb(170, 170, 170)",
                            fontSize: 12
                        }
                    }
                };
            }
            if (isHide && legendExt.show) {
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
                bottom: legendExt.show ? 40 : 10,
            };
            // options.series.pointer = _this.isDetailPg ? {width: 12, length: '90%'} : hide;
            // forEach(options, (t, key) => {
            //     key !== 'color' && this.omitColor(t);
            // })
            this.options = options;
            return "";
        },
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