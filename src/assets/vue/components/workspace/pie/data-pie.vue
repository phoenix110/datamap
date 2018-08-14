<template>
    <div :class="isDetailPg ? 'data-pie-detailpg' : 'data-pie-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="pie-title">{{cData.title}}</div>
            <div class="filter-area" v-if="isDetailPg">
                <FiltersPanel 
                    :geoFilters="geoFilters" 
                    :title="chartTitle" 
                    :filterParams="filterParams">
                </FiltersPanel>
            </div>
            <div class="detail-info" v-if="isDetailPg" :style="{'visibility': dataShow.number.length !=0 ? '' : 'hidden'}">
                <div class="scroll-area">
                    <div class="info-template">
                        <div class="text">{{dataShow.name}}</div>
                        <div class="number" :style="{'color': dataShow.color}">{{dataShow.number}}（{{dataShow.percent}}）</div>
                    </div>
                </div>
            </div>
            <div class="pie-draw">
                <vchart ref="pie" :options="options" class="echarts_pie" :init-options="initOptions" />
            </div>
        </div>
    </div>
</template>
<script>
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import size from 'lodash/size';
import map from 'lodash/map';
import round from 'lodash/round';
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import difference from 'lodash/difference';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import bus from '../../../../js/utils/bus';
import FiltersPanel from '../../commons/filters-panel.vue';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import {editYAxiNumberMenus, chart_type_pie_circle, chart_type_pie_rose, defaultPieExtraValues,
    pie_colors, maxItemLen, sorted_filter_all, sorted_filter_percent_column, formulaWordMap,
    defaultLegendStyle, chart_theme_color_map, chart_theme_color_len as colorLen, chart_theme_default
} from '../../../../js/constants/Constants'
const hide = {show: false};
const yKeys = keys(defaultPieExtraValues.yAxisExt);
const xKeys = keys(defaultPieExtraValues.xAxisExt);
export default {
    name: "DataPie",
    props: ['cData', 'isDetailPg', 'geoFilters', 'chartTitle', 'viewLoaded'],
    components: {
        FiltersPanel,
    },
    data(){
        return {
            geoFiltersBf: {},
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
            preViewExtraValue: {},
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
        },
        viewLoaded: function(){
            this.$nextTick(() => {
                this.isDetailPg && this.$refs.pie && this.$refs.pie.$refs.chartWrap.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: 0,
                });
            })
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
                if(resp.result){
                    this.getOption(resp.result || {});
                    this.loaded = true;
                    this.$nextTick(() => {
                        this.$refs.pie && this.$refs.pie.$refs.chartWrap.dispatchAction({
                            type: 'showTip',
                            seriesIndex: 0,
                            dataIndex: 0,
                        });
                    })
                }
                else{
                    console.error(resp.Msg);
                }
            })
        },
        refreshGraphFilter(filters){
            this.geoFiltersBf.filters = filters;
            this.getFillData();
        },
        getExtraVal(key) {
            let val = this.preViewExtraValue;
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
        fillExtDefault(ext, def) {
            forEach(def, (val,key)=>{!ext[key] && (ext[key] = val)});
        },
        getOption(chartData) {
            let _this = this;
            let {xAxis, yAxis, title, extra, chart_type} = _this.cData;
            let xAlis = xAxis || [];
            let yAlis = yAxis[0].items;
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

            let preViewExtraValue = {legendExt,
                xAxisExt: xAxisExt_new, yAxisExt: yAxisExt_new};// 预览值
            let defaultExtraValue = cloneDeep(defaultPieExtraValues);// 默认值
            let saveExtraValue = cloneDeep(preViewExtraValue);// 存储值

            let data = [];
            if (size(xAlis)) {
                data = map(((chartData[0] || {}).result || {}), (val, name)=>{
                    return {name, value: val};
                })
            } else {
                data = map(yAlis, (item, i)=>{
                    let name = `${item.h_value}-${formulaWordMap[item.func]}`;
                    let val = ((chartData[i] || {}).result || {})[item.key] || 0;
                    return {name, value: val};
                })
            }

            let showSetting = size(data) > maxItemLen,
                settingRemain = false,
                {filter} = xAxisExt;
            if (showSetting && filter.type !== sorted_filter_all) {
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
                settingRemain = true;
            };
            //自定义排序
            if (xAxisExt.showCustom) {
                defaultExtraValue.xAxisExt.sort = data.map(it => it.name);
                let oldSort = {}, xi = size(data);
                forEach(xAxisExt.sort, (it,index)=>{oldSort[it] = index + 1});
                data = orderBy(data, it=>(oldSort[it.name] || ++xi), 'asc');
                let names = data.map(it => it.name);
                preViewExtraValue.xAxisExt.sort = names;
                saveExtraValue.xAxisExt.sort = names;
            };

            xAxisExt_new.showSetting = showSetting;
            xAxisExt_new.settingRemain = settingRemain;

            let legend = [], colors = [], legendMap = {},
                alias = yAxisExt.aliasMap || {},
                color = yAxisExt.colorMap || {},
                aliasMapTmp = {}, colorMapTmp = {},
                {valueRoundNum, valueForce} = yAxisExt,
                chartColors = chart_theme_color_map[legendExt.theme||chart_theme_default];//取值，若没有设置主题色，则取默认颜色

            forEach(data, (it, i)=>{
                let {name, value} = it;
                let nc = color[name];
                nc ? (colorMapTmp[name] = nc) : (nc = chartColors[i % colorLen] || chartColors[0]);
                colors.push(nc);
                let nameVal = alias[name];
                nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                legend.push({name: nameVal, icon: 'rect'});
                legendMap[name] = {color: nc, alias: nameVal};
                it.name = nameVal;
                it.value = _this.getDataVal(value, valueForce, valueRoundNum, 0);
            })

            yAxisExt_new.aliasMap = aliasMapTmp;// 预览值
            yAxisExt_new.colorMap = colorMapTmp;
            yAxisExt_new.legendMap = legendMap;
            defaultExtraValue.yAxisExt.aliasMap = {};// 默认值
            defaultExtraValue.yAxisExt.colorMap = {};
            saveExtraValue.yAxisExt.aliasMap = aliasMapTmp;// 存储值
            saveExtraValue.yAxisExt.colorMap = colorMapTmp;

            let options = {
                color: colors,
                animationDuration: 1000,
                series: {
                    data,
                    label: {normal: {show:false}},
                    type: 'pie',
                    center: ['50%', '45%'],
                    // radius: isDetailPg ? [0, '74.4%'] : [0, '92.6%'],
                    radius: isDetailPg ? [0, '80%'] : [0, '75%'],
                    hoverAnimation: isDetailPg ? true : false,
                    silent: isDetailPg ? false : true,
                    stillShowZeroSum: false,
                    label: {normal: {show:false}},
                    labelLine: {normal: {show:false}},
                    clockwise: !xAxisExt_new.anticlockwise,
                }
            }
            if (chart_type === chart_type_pie_circle) {
                options.series.radius = isDetailPg ? ['60%', '80%'] : ['50%', '75%'];
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
            if(!isDetailPg && legend.length > 1){
                options.legend = {
                    show: true,
                    animation: true,
                    data: legend,
                    orient: 'horizontal',
                    type: 'scroll',
                    itemWidth: 6,
                    itemHeight: 6,
                    padding: [0, 20, 6, 20],
                    left: 'center',
                    bottom:0,
                    pageIconColor: "#6D737A",
                    textStyle: {
                        lineHeight: 16,
                        color: "#6D737A",
                        fontSize: "14px",
                        fontWeight: 300,
                    },
                };
            };

            _this.options = options;
            return "";
        }
    }
}
</script>
<style scoped lang="scss">
.data-pie-style {
    width: 100%;
    .pie-title {
        line-height: 20px;
        font-family: PingFang SC;
        font-size: 14px;
        font-weight: 700;
        color: #38393C;
        box-sizing: border-box;
        padding: 24px 21px 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .pie-draw {
        width: 100%;
        height: 202px;
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
        min-height: 250px;
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
            height: 95px;
            font-family: PingFang SC;
            .scroll-area{
                width: 100%;
                overflow: auto;
                -webkit-overflow-scrolling: touch;
                .info-template {
                    padding: 8px 0 0 16px;
                    box-sizing: border-box;
                    font-family: PingFang SC;
                    .number {
                        font-size: 48px;
                        font-weight: 300;
                        line-height: 67px;
                    }
                    .text {
                        font-size: 16px;
                        color: #57585c;
                        font-weight: 600;
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
