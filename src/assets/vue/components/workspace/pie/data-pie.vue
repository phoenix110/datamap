<template>
    <div :class="isDetailPg ? 'data-pie-detailpg' : 'data-pie-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="content-area" v-else>
            <div class="pie-title">{{cData.title}}</div>
            <div class="detail-info" v-if="isDetailPg" :style="{'visibility': dataShow.number.length !=0 ? '' : 'hidden'}">
                <div class="scroll-area">
                    <div class="info-template">
                        <div class="number" :style="{'color': dataShow.color}">{{dataShow.number}}（{{dataShow.percent}}）</div>
                        <div class="text">{{dataShow.name}}</div>
                    </div>
                </div>
            </div>
            <div class="pie-draw">
                <vchart ref="pie" :options="options" class="echarts_pie" :init-options="initOptions" />
                <div ref="layer" class="mask-layer" v-if="!isDetailPg"></div>
            </div>
        </div>
    </div>
</template>
<script>
import fetchUtil from '../../../../js/utils/fetchUtil';
import size from 'lodash/size';
import map from 'lodash/map';
import round from 'lodash/round';
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import difference from 'lodash/difference';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {editYAxiNumberMenus, chart_type_pie_circle, chart_type_pie_rose,
    defaultPieExtraValues, pie_colors, maxItemLen, sorted_filter_all,
    sorted_filter_percent_column
} from '../../../../js/constants/Constants'
const colorLen = size(pie_colors)
const hide = {show: false};
export default {
    name: "DataPie",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            initOptions: {
                renderer: 'canvas',
            },
            options: {},
            dataShow: {
                name: '',
                number: '',
                percent: '',
                color: '',
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
                // this.getOpt(resp.result);
                if(resp.result){
                    this.getOption(resp.result);
                    this.loaded = true;
                }
                else{
                    console.error(resp.Msg);
                }
            })
        },
        getExtraVal(val, key) {
            return cloneDeep(val && val[key] ? val[key] :
                defaultPieExtraValues[key]);
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
            let isDetailPg = _this.isDetailPg;
            let {chart_type, yAxis, title, xAxis,extra} = _this.cData;

            // 编辑属性
            let legendExt = this.getExtraVal(extra, 'legendExt');
            let xAxisExt = this.getExtraVal(extra, 'xAxisExt');
            let yAxisExt = this.getExtraVal(extra, 'yAxisExt');

            let data = [];
            if (size(xAxis)) {
                data = map(((chartData[0] || {}).result || {}), (val, name)=>{
                    return {name, value: val};
                })
            } else {
                data = map((yAxis[0] || {}).items, (item, i)=>{
                    let name = `${item.h_value}-${editYAxiNumberMenus[item.func]}`;
                    let sum = 0;
                    let val = ((chartData[i] || {}).result || {})[item.key] || sum;
                    return {name, value: val};
                })
            }
            let {filter} = xAxisExt;
            if(size(data) > maxItemLen && filter.type !== sorted_filter_all){
                data = orderBy(data, 'value', 'desc');// 降序排列
                let sliceNum = filter.percent === sorted_filter_percent_column ?
                    filter.value : filter.value * data.length / 100;
                sliceNum = parseFloat(filter.type + sliceNum);
                let old = data;
                data = sliceNum > 0 ? old.slice(0, sliceNum) : old.slice(sliceNum);
                if (xAxisExt.showRemain) {// 把其他数汇总
                    let diff = difference(old, data), value = 0;
                    forEach(diff, it=>{value += it.value});
                    value && (data.push({name: '余留汇总', value}));
                }
            }

            let legend = [], colors = [],
                alias = yAxisExt.aliasMap || {},
                color = yAxisExt.colorMap || {},
                {valueRoundNum, valueForce} = yAxisExt;
            forEach(data, (it, i)=>{
                let {name, value} = it;
                let nc = color[name] || pie_colors[i % colorLen] || pie_colors[0];
                colors.push(nc);
                let nameVal = alias[name] || name;
                legend.push({name: nameVal, icon: 'circle'});
                it.name = nameVal;
                it.value = this.getDataVal(value, valueForce, valueRoundNum, 0);
            })

            let show = true;
            let options = {
                color: colors,
                animation: true,
                series: {
                    data,
                    type: 'pie',
                    hoverAnimation: isDetailPg ? true : false,
                    silent: isDetailPg ? false : true,
                    stillShowZeroSum: false,
                    label: {normal: {show:false}},
                    labelLine: {normal: {show:false}},
                }
            }

            if (chart_type === chart_type_pie_circle) {
                options.series.radius = ['40%', '55%'];
            }
            if (chart_type === chart_type_pie_rose) {
                options.series.roseType = 'area';
            }
            options.tooltip = isDetailPg ? {
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
                        number: params.data ? params.data.value : '',
                        percent: params.percent+'%',
                        color: params.color,
                    };
                }
            } : hide;

            if(isDetailPg){
                options.legend = {
                    animation: true,
                    data: legend,
                    orient: 'horizontal',
                    // type: 'plain',
                    type: 'scroll',
                    itemWidth: 10,
                    itemHeight: 10,
                    pageButtonGap: 10,
                    padding: [0, 20, 0, 20],
                    left: 'center',
                    bottom:30,
                };
            }
            
            options.grid = {
                containLabel: true,
                right: 30,
                left: 30,
                top: 10,
                bottom: isDetailPg ? 0 : 50,
            }
            options.textStyle = {
                color: '#AFB8DB',
                fontSize: 12
            };

            // forEach(options, (t, key) => {
            //     key !== 'color' && this.omitColor(t);
            // })

            _this.options = options;
            return "";
        },
    }
}
</script>
<style scoped lang="scss">
.data-pie-style {
    width: 100%;
    .pie-title {
        line-height: 18px;
        font-size: 15px;
        font-weight: 700;
        color: #4A4D51;
        box-sizing: border-box;
        padding: 25px 21px;
        word-wrap: break-word;
    }
    .pie-draw {
        width: 100%;
        height: 232px;
        position: relative;
        overflow: hidden;
        .echarts_pie{
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
.data-pie-detailpg {
    width: 100%;
    background-color: #FFFFFF;
    height: 100%;
    position: relative;
    .content-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .pie-title {
            display: none;
        }
        .detail-info {
            width: 100%;
            height: 102px;
            box-sizing: border-box;
            padding: 15px 24px 0 24px;
            font-family: PingFang SC;
            .scroll-area{
                width: 100%;
                overflow: auto;
                .info-template {
                    .number {
                        font-size: 48px;
                        line-height: 67px;
                    }
                    .text {
                        font-size: 14px;
                        color: #6D737A;
                        line-height: 20px;
                    }
                }
            }
        }
        .pie-draw {
            width: 100%;
            flex: 1;
            position: relative;
            .echarts_pie {
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