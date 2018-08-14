<template>
    <div :class="isDetailPg ? 'data-radar-isDetailPg' : 'data-radar-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="radar-title" v-if="!isDetailPg">{{cData.title}}</div>
            <div class="filter-area" v-else>
                <FiltersPanel 
                    :geoFilters="geoFilters" 
                    :title="chartTitle" 
                    :filterParams="filterParams">
                </FiltersPanel>
            </div>
            <div class="radar-detail-info" v-if="isDetailPg" :style="{'visibility': dataShow.data.length !=0 ? '' : 'hidden'}">
                <div class="title">{{dataShow.title}}</div>
                <div class="scroll-area">
                    <div class="info-template" v-for="(value, index) in dataShow.data" :key="index" :style="{'color': dataShow.color}">
                        <div class="value">{{value}}{{index===dataShow.data.length-1 ? '' : '，'}}</div>
                        <div class="name">{{dataShow.name[index].name}}</div>
                    </div>
                </div>
            </div>
            <div class="radar-draw">
                <vchart ref="radar" class="echarts_radar" :options="options" :init-options="initOptions" />
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
import bus from '../../../../js/utils/bus';
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import FiltersPanel from '../../commons/filters-panel.vue';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {radar_colors, radarMenus, defaultRadarExtraValues,
    max_setting_type_1, maxItemLen, h_type_formula, defaultLegendStyle , chart_theme_color_map,
    chart_theme_color_len as colorLen, chart_theme_default} from '../../../../js/constants/Constants'
const hide = {show: false};
//const colorLen = size(radar_colors);
const xKeys = keys(defaultRadarExtraValues.xAxisExt);
const yKeys = keys(defaultRadarExtraValues.yAxisExt);
export default {
    name: 'data-radar',
    props: ['cData', 'isDetailPg', 'geoFilters', 'chartTitle', 'viewLoaded'],
    components: {
        FiltersPanel,
    },
    data() {
        return {
            geoFiltersBf: {},
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
            filterParams: {},
            alreadyListener: false,
        };
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

            ;
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
                    aliasMapTmp = {}, colorMapTmp = {},
                    chartColors = chart_theme_color_map[legendExt.theme||chart_theme_default];
                    //取值，如果没有主题色，则取默认值
                data = map(names, (name, i)=>{
                    let value = [];
                    forEach(xAlis, it=>{
                        let val = (chartData[it.key] || [])[i] ;
                        value.push(_this.getDataVal(val, force, roundNum, 0));
                    })
                    let nc = color[name];
                    nc ? (colorMapTmp[name] = nc) : (nc = chartColors[i % colorLen] || chartColors[0]);
                    colors.push(nc);
                    let nameVal = alias[name];
                    nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                    legend.push({name: nameVal, icon: 'rect'});
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
                    color: '#A8ADB8',
                    fontSize: 10,
                    fontWeight: 300,
                },
                radar:{
                    splitArea: {show:false},
                    center: ['50%', '55%'],
                    radius: isDetailPg ? '80%' : '85%',
                    splitLine: {
                        lineStyle: {
                            color: '#DFE5E3'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            width: 0.5,
                            color: '#DFE5E3'
                        }
                    },
                    indicator: indicator,
                    name: {
                        color:'#AFB8DB',
                        fontSize: isDetailPg ? 12 : 10,
                        fontWeight: 300,
                    },
                    nameGap: 8,
                },
                series: {
                    data,
                    type: 'radar',
                    splitArea: {show:false},
                    symbol: 'circle',
                    silent: _this.isDetailPg ? false : true,
                },
            }
            options.grid = {
                containLabel: true,
                right: 15,
                left: 15,
                top: 15,
                bottom: !isDetailPg && legend.length > 1 ? 20 : 10,
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
                        title: params.data ? params.data.name : '',
                        data: params.data ? params.data.value : [],
                        name: size(indicator) ? indicator : [],
                        color: params.color,
                    };
                }
            } : hide;
            if(!isDetailPg && legend.length > 1){
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
                }
            }
            this.dataShow = {
                title: size(data) ? data[0].name : "",
                data: size(data) ? data[0].value : [],
                name: size(indicator) ? indicator : [],
                color: size(colors) ? colors[0] : "",
            };
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
        line-height: 20px;
        font-size: 14px;
        font-weight: 700;
        color: #38393C;
        box-sizing: border-box;
        padding: 24px 21px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .radar-draw {
        width: 100%;
        height: 182px;
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
        min-height: 250px;
    }
}
.data-radar-isDetailPg {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    .content-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .radar-detail-info {
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
