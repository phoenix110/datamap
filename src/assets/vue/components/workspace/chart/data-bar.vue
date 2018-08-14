<template>
    <div :class="isDetailPg ? 'data-bar-isDetailPg' : 'data-bar-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="chart-title">{{cData.title}}</div>
            <div class="detail-info" v-if="isDetailPg">
                <div class="filter-area">
                    <FiltersPanel 
                        :geoFilters="geoFiltersBf" 
                        :title="chartTitle"
                        :filterParams="filterParams">
                    </FiltersPanel>
                </div>
                <div class="tooltip-info" v-if="legendInfo.list.length != 0">
                    <div class="tip-name">{{legendInfo.name}}</div>
                    <div class="number-info">
                        <div class="ele-info" v-for="(value, i2) in legendInfo.list" :key="i2">
                            <div class="num" :style="{'color': value.color}">{{value.value}}</div>
                            <div class="title">{{value.name}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chart-draw">
                <vchart ref="bar" :options="options" class="echarts_bar" theme="ovilia-green" :init-options="initOptions"/>
            </div>
        </div>
    </div>
</template>
<script>
import echarts from 'echarts';
import size from 'lodash/size';
import map from 'lodash/map';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';
import keys from 'lodash/keys';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import bus from '../../../../js/utils/bus';
import FiltersPanel from '../../commons/filters-panel.vue';
import {defaultExtraValues, editYAxiNumberMenus} from '../../../../js/constants/Constants.js';
import {h_type_text,formulaWordMap, new_chart_colors as chart_colors, sort_desc,sort_asc, defaultChartExtraValues, barMaxWidth, connectNulls,
defaultSortedFilter, sorted_filter_all, sorted_filter_percent_percent, rotate_type_right, rotate_type_left, maxItemLen, defaultLegendStyle,
lineOnlyPoint, chart_theme_color_map, chart_theme_color_len as colorLen, chart_theme_default, paths
} from '../../../../js/constants/Constants'
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
const hide = {show: false};
const stackMap = {
    stack: '纵轴堆积',
    per_stack: '纵轴百分比堆积'
}
const fixedColor = "#000000"; //由于设计稿背景白色，这里设置成固定值
//const colorLen = size(chart_colors);
const xKeys = keys(defaultChartExtraValues.xAxisExt);
const yKeys = keys(defaultChartExtraValues.yAxisExt);
const nyKeys = keys(defaultChartExtraValues.newYAxisExt);

export default {
    name: "DataBar",
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
            result: '',
            options: {},
            filterList: [],
            legendInfo: {name: '', list: []},
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
                this.isDetailPg && this.$refs.bar && this.$refs.bar.$refs.chartWrap.dispatchAction({
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
            }),{method: 'POST', headers, body: JSON.stringify(geoFiltersBf)})
            .then(resp=>{
                this.getOption(resp.result);
                this.loaded = true;
                this.$nextTick(() => {
                    this.$refs.bar && this.$refs.bar.$refs.chartWrap.dispatchAction({
                        type: 'showTip',
                        seriesIndex: 0,
                        dataIndex: 0,
                    });
                })
            })
        },
        refreshGraphFilter(filters){
            this.geoFiltersBf.filters = filters;
            this.getFillData();
        },
        getExtraVal(key) {
            let val = this.preViewExtraValue;
            return cloneDeep(val && val[key] ? val[key] :
                defaultChartExtraValues[key]);
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
        },
        getLabelFormatter(value, splitNum) {
            let formatter = [1, ''], w = 10000, k = 1000;
            // 第一个超过1w或有一半数字超过1w
            if (value >= w || Math.ceil(splitNum * 0.5) * value >= w) {
                formatter = [w, 'W'];
            } else if (value >= k || Math.ceil(splitNum * 0.5) * value >= k) {
                formatter = [k, 'K'];
            }
            return formatter;
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
            let {title, extra, object_type, chart_type} = _this.cData;
            let yAxis_m = _this.cData.yAxis;
            let xAxis_m = _this.cData.xAxis;
            _this.preViewExtraValue = extra;
            let xAlis = xAxis_m || [];
            let yAlis = yAxis_m[0].items;
            let newYAlis = [], newYAliType = '', showNewYAli = false;
            showNewYAli = size(yAxis_m) >= 2;
            if (showNewYAli){
                newYAlis = yAxis_m[1].items;
                newYAliType = yAxis_m[1].chart_type;
            }
            // 编辑属性
            let legendExt = this.getExtraVal('legendExt');
            // 新追加属性
            this.fillExtDefault(legendExt, defaultLegendStyle);
            let xAxisExt = this.getExtraVal('xAxisExt');
            let yAxisExt = this.getExtraVal('yAxisExt');
            let newYAxisExt = this.getExtraVal('newYAxisExt');
            let labelExt = this.getExtraVal('labelExt');
            let newLabelExt = this.getExtraVal('newLabelExt');
            let xAxisExt_new = pick(xAxisExt, xKeys);
            let yAxisExt_new = pick(yAxisExt, yKeys);
            let newYAxisExt_new = pick(newYAxisExt, nyKeys);

            let preViewExtraValue = {legendExt, labelExt, newLabelExt, 
                xAxisExt: xAxisExt_new, yAxisExt: yAxisExt_new};// 预览值
            let defaultExtraValue = cloneDeep(defaultChartExtraValues);// 默认值
            let xData = [], sData = [], legend = [], yAxis = [];
            let yItems = [[chart_type, yAlis]], hasNewY = size(newYAlis);
            if (hasNewY) {
                yItems.push([newYAliType || chart_type, newYAlis]);
                preViewExtraValue.newYAxisExt = newYAxisExt_new;
            } else {// 删除冗余属性
                delete defaultExtraValue.newYAxisExt;
            }
            let saveExtraValue = cloneDeep(preViewExtraValue);// 存储值
            let isDetailPg = _this.isDetailPg;

            let hasX = size(xAlis);
            if (hasX) {
                let isContinue = true;
                forEach(yItems, ([type, list], i)=>{
                    let isPer = type === 'per_stack', totals = {};
                    if (isPer) {
                        forEach(list, (item, j)=>{
                            let cIndex = i === 0 ? j : size(yItems[i - 1][1]) + j;
                            forEach((chartData[cIndex] || {}).result, (val, key)=>{
                                totals[key] = (val || 0) + (totals[key] || 0);
                            })
                        })
                    }
                    forEach(list, (item, j)=>{
                        if (item.sort === sort_asc || item.sort === sort_desc) {
                            let cIndex = i === 0 ? j : size(yItems[i - 1][1]) + j;
                            isContinue = false;
                            let data_tmp = (chartData[cIndex] || {}).result, tmp = {};
                            xData = map(data_tmp, (val,key)=>{
                                tmp[key]=val;
                                return key;
                            });
                            if (isPer) {
                                xData = orderBy(xData, x=>{
                                    let val = tmp[x], t = totals[x];
                                    return t ? (val * 100 / t) : 0;
                                }, item.sort);
                            } else {
                                xData = orderBy(xData, x=>tmp[x], item.sort);
                            }

                            defaultExtraValue.xAxisExt.filter = defaultSortedFilter;// 默认值
                            let filter = xAxisExt.filter || defaultSortedFilter;
                            xAxisExt_new.filter = filter; // 预览值
                            xAxisExt_new.showFilter = true; // 预览值
                            saveExtraValue.xAxisExt.filter = filter; // 存储值
                            if (filter.type !== sorted_filter_all) {
                                let sliceNum = filter.percent !== sorted_filter_percent_percent ?
                                    filter.value : filter.value * xData.length / 100;
                                sliceNum = parseFloat(filter.type + sliceNum);
                                xData = sliceNum > 0 ? xData.slice(0, sliceNum) : xData.slice(sliceNum);
                            }
                        }
                        return isContinue;
                    })
                    return isContinue;
                })
                if (isContinue) {
                    xData = map((chartData[0] || {}).result, (_,key)=>key);
                    let isText = xAlis[0].h_type === h_type_text;
                    if (isText) {
                        xAxisExt_new.showCustom = true;  // 用户自定义过滤
                        xAxisExt_new.allCustom = xData; // 全部数据供用户选择
                        if (size(xAxisExt.custom)) {
                            let tmp = {};
                            forEach(xAxisExt.custom, it=>{tmp[it]=true})
                            let newXData= filter(xData, it=>tmp[it]);
                            if (size(newXData)) {
                                xAxisExt_new.custom = newXData;  // 预览值
                                saveExtraValue.xAxisExt.custom = newXData;  // 存储值
                                xData = newXData;
                            }
                        }
                    }
                    // 数量太多不建议用户自定义顺序
                    let xLen = size(xData);
                    if (isText && xLen <= maxItemLen) {
                        defaultExtraValue.xAxisExt.sort = xData;// 默认值
                        let oldSort = {}, i = xLen;
                        forEach(xAxisExt.sort, (it,index)=>{oldSort[it] = index + 1});
                        xData = orderBy(xData, it=>(oldSort[it] || ++i), 'asc');
                        xAxisExt_new.sort = xData; // 预览值
                        saveExtraValue.xAxisExt.sort = xData;  // 存储值
                    }
                }
            }

            let tipItem = !hasX, colors = [],
                // {force, roundNum} = labelExt,
                {position: xPos} = xAxisExt_new;
            // 坐标轴旋转
            let isPosRight = xPos === rotate_type_right,
                isPosLeft = xPos === rotate_type_left,
                isXYRotate = isPosLeft || isPosRight;
            let indexKey = isXYRotate ? 'xAxisIndex' : 'yAxisIndex';
            let labelPosition = isPosRight ? 'left' : isPosLeft ? 'right' : 'top';
            let chartColors = chart_theme_color_map[legendExt.theme||chart_theme_default];//如果没有主题色，则取默认色

            forEach(yItems, ([type, list], i)=>{
                let totals = {}, stack, allTotal = 0,  isFirst = i === 0,
                    isPre = type === 'per_stack', isSta = type === 'stack';
                let labelOpt = isFirst ? labelExt : newLabelExt;
                let {force, roundNum} = labelOpt;
                if (isPre) {
                    forEach(list, (item, j)=>{
                        let cIndex = isFirst ? j : size(yItems[i - 1][1]) + j;
                        forEach((chartData[cIndex] || {}).result, (val, key)=>{
                            totals[key] = (val || 0) + (totals[key] || 0);
                        })
                    })
                    stack = `百分比堆积-${i}`;
                }
                isSta && (stack = `堆积-${i}`);

                let preSize = 0;
                if (tipItem) {
                    isPre && forEach(totals, val=>{allTotal += val});// 做统计
                    preSize = size(xData);
                    if((isFirst || hasNewY) && (isSta || isPre) && size(list) > 1) {
                        xData.push(i ? `${stackMap[type]}-${i}` : `${stackMap[type]}`);
                    } else {
                        isFirst ? forEach(list, (item)=>xData.push(`${item.h_value}-${formulaWordMap[item.func]}`))
                            : forEach(list, (item)=>xData.push(`${item.h_value}-${formulaWordMap[item.func]}-${i}`));
                    }
                }

                let yExt = yAxisExt, yExt_new = yAxisExt_new ,
                    aliasMapTmp = {}, colorMapTmp = {},
                    yExt_default = defaultExtraValue.yAxisExt,
                    yExt_save = saveExtraValue.yAxisExt;
                if (i) {
                    yExt = newYAxisExt;
                    yExt_new = newYAxisExt_new;
                    yExt_default = defaultExtraValue.newYAxisExt;
                    yExt_save = saveExtraValue.newYAxisExt;
                }

                let alias = yExt.aliasMap || {},
                    color = yExt.colorMap || {};
                let isLine = type === 'line';
                let legendMap = {};

                if (type === 'bar' || isLine) {//最大最小值设置
                    yExt_new.showMaxMin = true;
                    yExt_new.maxVal = yExt.maxVal;
                    yExt_default.maxVal = undefined;
                    yExt_save.maxVal = yExt.maxVal;

                    yExt_new.minVal = yExt.minVal;
                    yExt_default.minVal = undefined;
                    yExt_save.minVal = yExt.minVal;
                }

                if (isLine && tipItem) {
                    let cIndex = 0, name = object_type;
                    if (i) {
                        cIndex = yItems[i-1][0] === 'line' ? 1 : size(yItems[i - 1][1]);
                        name = `${object_type}-${i}`;
                    }
                    let nc = color[name];
                    nc ? (colorMapTmp[name] = nc) : (nc = chartColors[cIndex % colorLen] || chartColors[0]);
                    colors.push(nc);
                    let nameVal = alias[name];
                    nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                    legend.push({name: nameVal, icon: 'circle'});
                    legendMap[name] = {color: nc, alias: nameVal};
                    let data = new Array(preSize);
                    forEach(list, (item, j)=>{
                        let vIndex = isFirst ? j : size(yItems[i - 1][1]) + j;
                        let vals = ((chartData[vIndex] || {}).result || {});
                        let val = vals[item.key];
                        data.push(this.getDataVal(val, force, roundNum, 0));
                    })

                    sData.push({
                        name: nameVal,
                        data,
                        type: 'line',
                        [indexKey]: i,
                        label: {normal: {
                            show: labelExt.show,
                            color: labelExt.fontColor,
                            fontSize: labelExt.fontColor,
                            position: labelPosition,
                            // formatter: ({value})=>value
                            formatter: ({value})=>{
                                if (labelOpt.percent) {
                                    let rd = roundNum - 2;
                                    rd < 0 && (rd = 0);
                                    value = `${this.getDataVal(value * 100, force, rd)}%`;
                                }
                                return value;
                            }
                        }},
                        legendHoverLink: true,
                    })
                } else {
                    if (isLine) {
                        yExt_new.seriesType = 'line';
                        let lineVal = yExt.connectNulls || connectNulls;
                        let lineVal2 = yExt.lineOnlyPoint || lineOnlyPoint;
                        yExt_new.connectNulls = lineVal; // 预览值
                        yExt_default.connectNulls = connectNulls;// 默认值
                        yExt_save.connectNulls = lineVal;// 存储值
                        yExt_new.lineOnlyPoint = lineVal2; // 预览值
                        yExt_default.lineOnlyPoint = lineOnlyPoint;// 默认值
                        yExt_save.lineOnlyPoint = lineVal2;// 存储值
                    } else {
                        yExt_new.seriesType = 'bar';
                        let barVal = yExt.barMaxWidth || barMaxWidth;
                        yExt_new.barMaxWidth = barVal;// 预览值
                        yExt_default.barMaxWidth = barMaxWidth; // 默认值
                        yExt_save.barMaxWidth = barVal; // 存储值
                    }
                    forEach(list, (item, j)=>{
                        let vIndex = isFirst ? j : size(yItems[i - 1][1]) + j;
                        let vals = ((chartData[vIndex] || {}).result || {}), data;
                        if (hasX) {
                            data = [];
                            if (isPre) {
                                forEach(xData, k=>{
                                    let val = vals[k] || 0, t = totals[k];
                                    data.push(t ? this.getDataVal(val * 100 / t, force, roundNum) : '');
                                })
                            } else {
                                let valDef = isLine && yExt_new.connectNulls ? 0 : '';
                                forEach(xData, k=>{
                                    let val = vals[k];
                                    data.push(this.getDataVal(val, force, roundNum, valDef));
                                })
                            }
                        } else {
                            stack = `辅助-${i}`;
                            data = new Array(preSize);
                            if (isSta) {
                                let val = vals[item.key];
                                data.push(this.getDataVal(val, force, roundNum));
                            } else if (isPre) {
                                let v = vals[item.key] || 0;
                                v = allTotal ? this.getDataVal(v * 100 / allTotal, force, roundNum) : '';
                                data.push(v);
                            } else {
                                forEach(list, (it)=>{
                                    let val = vals[it.key];
                                    data.push(this.getDataVal(val, force, roundNum));
                                });
                            }
                        }

                        let name = `${item.h_value}-${formulaWordMap[item.func]}`;
                        name = isFirst ? name : `${name}-${i}`;
                        let cIndex = isFirst ? j : (yItems[i-1][0] === 'line' ?
                            1 + j : size(yItems[i - 1][1]) + j);
                        let nc = color[name];
                        nc ? (colorMapTmp[name] = nc) : (nc = chartColors  &&  chartColors[cIndex % colorLen] || chart_colors[0]);
                        colors.push(nc); //移动端不需要渐变
                        let nameVal = alias[name];
                        nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                        legend.push({name: nameVal, icon: 'rect'});
                        legendMap[name] = {color: nc, alias: nameVal};

                        let sd = {
                            name:nameVal,
                            data,
                            stack,
                            [indexKey]: i,
                            label: {normal: {
                                show: labelExt.show,
                                color: labelExt.fontColor,
                                fontSize: labelExt.fontColor,
                                position: labelPosition,
                                formatter: ({value})=>{
                                    if (labelOpt.percent) {
                                        let rd = roundNum - 2;
                                        rd < 0 && (rd = 0);
                                        value = `${this.getDataVal(value * 100, force, rd)}%`;
                                    }
                                    return value;
                                }
                            }},
                            legendHoverLink: true,
                        };
                        // 依据状态设置属性
                        if (isLine) {
                            sd.type = 'line';
                            // sd.label.normal.formatter=({value})=>value;
                            sd.lineStyle = {normal: {opacity: yExt_new.lineOnlyPoint ? 0 : 1}}
                        } else {
                            sd.type = 'bar';
                            sd.barMaxWidth = yExt_new.barMaxWidth;
                            tipItem && (sd.barGap = '-100%');
                        }
                        sData.push(sd);
                    })
                }
                yExt_new.aliasMap = aliasMapTmp;// 预览值
                yExt_new.colorMap = colorMapTmp;
                yExt_new.legendMap = legendMap;
                yExt_default.aliasMap = {};// 默认值
                yExt_default.colorMap = {};
                yExt_save.aliasMap = aliasMapTmp;// 存储值
                yExt_save.colorMap = colorMapTmp;
            });

            if(tipItem) {
                let alias = Object.assign({}, yAxisExt_new.aliasMap, newYAxisExt_new.aliasMap);
                forEach(xData,(v,k)=>{alias[v] && (xData[k] = alias[v])});
            }

            let yOpt = {
                name: yAxisExt_new.title,
                type: 'value',
                splitLine: {
                    show: yAxisExt_new.show,
                    lineStyle: {
                        color: '#EFEFEF',
                    }
                },
                axisLine: hide,
                axisTick: hide,
                triggerEvent: true,
                splitNumber: isDetailPg ? yAxisExt_new.splitNum : 3,
                inverse: isPosRight,
                axisLabel:{
                    show: yAxisExt_new.show,
                    fontSize: "10px",
                    fontWeight: 300,
                    color: "#A3A3A3"
                }
            };
            if (yAxisExt_new.shortLabel) {
                let model = 1, unit = '';
                yOpt.axisLabel.formatter = (value, index)=>{
                    index === 1 && ([model, unit] = this.getLabelFormatter(
                        value, yAxisExt_new.splitNum));
                    index && (value = `${value / model}${unit}`);
                    return value;
                }
            };

            if (yAxisExt_new.showMaxMin) {
                let {maxVal, minVal} = yAxisExt_new;
                maxVal && (yOpt.max = maxVal);
                minVal && (yOpt.min = minVal);
            };

            yAxis.push(yOpt);

            if (showNewYAli) {
                let newYOpt = {
                    name: newYAxisExt_new.title,
                    type: 'value',
                    splitLine: {
                        show: newYAxisExt_new.show,
                        lineStyle: {
                            color: '#EFEFEF',
                        }
                    },
                    axisLine: hide,
                    axisTick: hide,
                    triggerEvent: true,
                    splitNumber: isDetailPg ? newYAxisExt_new.splitNum : 3,
                    inverse: isPosRight,
                    axisLabel:{
                        show: newYAxisExt_new.show,
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#A3A3A3",
                    }
                };
                if (newYAxisExt_new.shortLabel) {
                    let model = 1, unit = '';
                    newYOpt.axisLabel.formatter = (value, index)=>{
                        index === 1 && ([model, unit] = this.getLabelFormatter(
                            value, newYAxisExt_new.splitNum));
                        index && (value = `${value / model}${unit}`);
                        return value;
                    }
                };

                if (newYAxisExt_new.showMaxMin) {
                    let {maxVal, minVal} = newYAxisExt_new;
                    maxVal && (newYOpt.max = maxVal);
                    minVal && (newYOpt.min = minVal);
                };
                yAxis.push(newYOpt);
            }

            let xAxis = {
                type: 'category',
                data: xData,
                axisLine: {
                    show: xAxisExt_new.show,
                    lineStyle: {
                        color: '#DFE5E3'
                    }
                },
                axisTick: hide,
                triggerEvent: true,
                axisLabel: {
                    show: xAxisExt_new.show,
                    interval: xAxisExt_new.showAllTick ? 0 : 'auto',
                    textStyle: {
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#A3A3A3",
                    }
                }
            };
            if (isXYRotate) {
                xAxis.position = xPos;
                xAxis.axisLine.onZero = isPosLeft;
            }

            let options = {
                color: colors,
                animationDuration: 1000,
                yAxis: isXYRotate ? xAxis : yAxis,
                xAxis: isXYRotate ? yAxis : xAxis,
                series: sData,
            };
            options.grid = {
                containLabel: true,
                right: 15,
                left: 15,
                top: 5,
                bottom: !isDetailPg && legend.length > 1 ? 30 : 10,
            };
            options.tooltip = isDetailPg ? {
                trigger: tipItem ? 'item' : 'axis',
                confine: true,
                // alwaysShowContent: true,
                axisPointer: {
                    handle: {
                        show: true,
                    },
                },
                formatter: function(params, ticket, callback){
                    if(Object.prototype.toString.call(params)=='[object Array]'){
                        let list = params.map((value, index) => {
                            return {
                                "name": value.seriesName,
                                "value": value.data.length === 0 ? 0 : value.data,
                                "color": value.seriesType === 'line' ? value.color : (!!value.color.colorStops ? value.color.colorStops[0].color : value.color),
                            }
                        });
                        if (!_this.legendInfo.name) {
                            setTimeout(() => {
                                _this.$refs.bar && _this.$refs.bar.resize();
                            })
                        }
                        _this.legendInfo = {
                            "name": !!params && params.length != 0 ? params[0].name : "",
                            "list": list,
                        };
                        
                    } else{
                        let list = [];
                        list.push({
                            "name": params.seriesName,
                            "value": params.data.length === 0 ? 0 : params.data,
                            "color": params.seriesType === 'line' ? params.color : (!!params.color.colorStops ? params.color.colorStops[0].color : '#555555'),
                        })
                        if (!_this.legendInfo.name) {
                            setTimeout(() => {
                                _this.$refs.bar && _this.$refs.bar.resize();
                            })
                        }
                        _this.legendInfo = {
                            "name": params.name,
                            "list": list,
                        };
                        
                    }
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
                    left: 'center',
                    textStyle: {
                        lineHeight: 16,
                        color: "#6D737A",
                        fontSize: "14px",
                        fontWeight: 300,
                    },
                }
            }
            else{
                this.filterList = legend;
            }
            this.options = options;
            return "";
        }
    }
}
</script>
<style scoped lang="scss">
.data-bar-style {
    width: 100%;
    background-color: #FFFFFF;
    font-family: PingFang SC;
    .chart-title {
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
    .chart-draw {
        width: 100%;
        height: 182px;
        position: relative;
        .echarts_bar{
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
.data-bar-isDetailPg {
    width: 100%;
    height: 100%;
    background-color: #fcfcfc;
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
    .content-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .chart-title {
            display: none;
        }
        .detail-info {
            width: 100%;
            .filter-area {
                width: 100%;
            }
            .tooltip-info {
                width: 100%;
                height: 123px;
                box-sizing: border-box;
                padding: 14px 0 0;
                font-family: PingFang SC;
                .tip-name {
                    font-size: 16px;
                    color: #57585C;
                    font-weight: 600;
                    max-width: 12em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    box-sizing: border-box;
                    padding-left: 16px;
                }
                .number-info {
                    width: 100%;
                    overflow-x: auto;
                    display: inline-flex;
                    flex-wrap: nowrap;
                    .ele-info {
                        display: inline-table;
                        box-sizing: border-box;
                        padding-left: 16px;
                        .num {
                            line-height: 67px;
                            font-size: 48px;
                            font-weight: 300;
                            white-space: nowrap;
                        }
                        .title {
                            line-height: 20px;
                            font-size: 14px;
                            color: #6D737A;
                            white-space: nowrap;
                        }
                    }
                }
            }
        }
        .chart-draw {
            flex: 1;
            width: 100%;
            position: relative;
            margin-bottom: 15px;
            margin-top: 21px;
            .echarts {
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
}
</style>
