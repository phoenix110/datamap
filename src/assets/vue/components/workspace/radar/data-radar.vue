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
import fetchUtil from '../../../../js/utils/fetchUtil';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {radar_colors, radarMenus, defaultRadarExtraValues,
    max_setting_type_1, maxItemLen} from '../../../../js/constants/Constants'
const hide = {show: false};
const colorLen = size(radar_colors);
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
        this.getFillData();
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
        getExtraVal(val, key) {
            return val && val[key] ? val[key] : defaultRadarExtraValues[key];
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
        },
        getOption(chartData) {
            let _this = this;
            let isDetailPg = _this.isDetailPg;
            let {xAxis: yAlis, yAxis: xAlis, title, extra} = _this.cData;

            // 编辑属性
            let legendExt = this.getExtraVal(extra, 'legendExt');
            let xAxisExt = this.getExtraVal(extra, 'xAxisExt');
            let yAxisExt = this.getExtraVal(extra, 'yAxisExt');

            let data = [], legend = [], indicator = [], colors = [];
            xAlis = (xAlis[0] || {}).items;
            if (size(xAlis) >= 3 && size(yAlis)) {
                let names = chartData[yAlis[0].key] || [];
                let {type, settingValue} = yAxisExt.maxSetting;
                settingValue = settingValue || {};
                let isToggle = type === max_setting_type_1;
                forEach(xAlis, ({key})=>{
                    let v = isToggle ? settingValue : (settingValue[key] ||
                        Math.ceil(max(chartData[key])) || 1);
                    indicator.push({name: key, max: v});
                })
                if (xAxisExt.maxLen !== -1) {// 全部显示
                    names = names.slice(0, xAxisExt.maxLen ||
                        defaultRadarExtraValues.xAxisExt.maxLen);
                }

                let {valueForce: force, valueRoundNum: roundNum} = yAxisExt;
                let alias = yAxisExt.aliasMap || {},
                    color = yAxisExt.colorMap || {};
                data = map(names, (name, i)=>{
                    let value = [];
                    forEach(xAlis, it=>{
                        let val = (chartData[it.key] || [])[i];
                        value.push(this.getDataVal(val, force, roundNum, 0));
                    })
                    let nc = color[name] || radar_colors[i % colorLen] || radar_colors[0];
                    colors.push(nc);
                    let nameVal = alias[name] || name;
                    legend.push({name: nameVal, icon: 'circle'});
                    return {name: nameVal, value, areaStyle: {emphasis: {color: nc, opacity: 0.3}}};
                })
            }

            let labelShow = true;
            let isHide = !labelShow;
            let options = {
                color: radar_colors,
                animation: true,
                radar: {
                    name: {show: true, color:'#AFB8DB'},
                    splitArea: {show:false},
                    splitLine: {lineStyle: {color: '#6C7692'}},
                    axisLine:{lineStyle: {color: '#6C7692'}},
                    indicator: indicator
                },
                series: {
                    data,
                    type: 'radar',
                    symbol: 'roundRect',
                    silent: _this.isDetailPg ? false : true,
                }
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

            // forEach(options, (t, key) => {
            //     key !== 'color' && this.omitColor(t);
            // })

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