<template>
    <div :class="isDetailPg ? 'data-bar-isDetailPg' : 'data-bar-style'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="content-area" v-else>
            <div class="chart-title">{{cData.title}}</div>
            <div class="detail-info" v-if="isDetailPg">
                <div class="filter-area">
                    <ul>
                        <li v-for="(value, i1) in filterList" :key="i1">{{value.name}}、</li>
                        <li class="open">展开</li>
                    </ul>
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
import forEach from 'lodash/forEach';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';
import keys from 'lodash/keys';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import {defaultExtraValues, editYAxiNumberMenus} from '../../../../js/constants/Constants.js';
import {h_type_text,formulaWordMap, new_chart_colors as chart_colors, sort_desc,sort_asc, defaultChartExtraValues, barMaxWidth, connectNulls,
defaultSortedFilter, sorted_filter_all, sorted_filter_percent_percent,
rotate_type_right, rotate_type_left, maxItemLen, defaultLegendStyle, lineOnlyPoint,
} from '../../../../js/constants/Constants'
import fetchUtil from '../../../../js/utils/fetchUtil';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
const hide = {show: false};
const stackMap = {
    stack: '纵轴堆积',
    per_stack: '纵轴百分比堆积'
}
const fixedColor = "#000000"; //由于设计稿背景白色，这里设置成固定值
const colorLen = size(chart_colors);
const xKeys = keys(defaultChartExtraValues.xAxisExt);
const yKeys = keys(defaultChartExtraValues.yAxisExt);
const nyKeys = keys(defaultChartExtraValues.newYAxisExt);
export default {
    name: "DataBar",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            initOptions: {
                renderer: 'canvas',
            },
            result: '',
            options: {},
            filterList: [],
            legendInfo: {name: '', list: []},
            loaded: false,
            preViewExtraValue: {},
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
                defaultChartExtraValues[key]);
        },
        getDataVal(val, force, roundNum, def='') {
            return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
        },
        getLabelFormatter(value, splitNum) {
            let formatter = [1, ''], w = 10000, k = 1000;
            // 第一个超过1w或有一半数字超过1w
            if (value >= w || Math.ceil(splitNum * 0.5) * value >= w) {
                formatter = [w, 'w'];
            } else if (value >= k || Math.ceil(splitNum * 0.5) * value >= k) {
                formatter = [k, 'k'];
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
            if (showNewYAli) {
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
                    // xData = map((chartData[0] || {}).result, (_,key)=>key);
                    // // 数量太多不建议用户自定义顺序
                    // let xLen = size(xData);
                    // if (xAlis[0].h_type === h_type_text && xLen <= maxItemLen) {
                    //     defaultExtraValue.xAxisExt.sort = xData;// 默认值
                    //     let oldSort = {}, i = xLen;
                    //     forEach(xAxisExt.sort, (it,index)=>{oldSort[it] = index + 1});
                    //     xData = orderBy(xData, it=>(oldSort[it] || ++i), 'asc');
                    //     xAxisExt_new.sort = xData; // 预览值
                    //     saveExtraValue.xAxisExt.sort = xData; // 存储值
                    // }

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
                if (isLine && tipItem) {
                    let cIndex = 0, name = object_type;
                    if (i) {
                        cIndex = yItems[i-1][0] === 'line' ? 1 : size(yItems[i - 1][1]);
                        name = `${object_type}-${i}`;
                    }
                    let nc = color[name];
                    nc ? (colorMapTmp[name] = nc) : (nc = chart_colors[cIndex % colorLen] || chart_colors[0]);
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
                        // yExt_new.seriesType = 'line';
                        // let lineVal = yExt.connectNulls || connectNulls;
                        // yExt_new.connectNulls = lineVal; // 预览值
                        // yExt_default.connectNulls = connectNulls;// 默认值
                        // yExt_save.connectNulls = lineVal;// 存储值
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
                        nc ? (colorMapTmp[name] = nc) : (nc = chart_colors[cIndex % colorLen] || chart_colors[0]);
                        // colors.push(nc);
                        if (!isLine && !yExt.notGradient) {
                            let ct = nc.split(',');
                            ct.pop();
                            let lg = isPosRight ? [0,0,1,0] : isPosLeft ? [1,0,0,0] : [0,0,0,1];
                            colors.push(new echarts.graphic.LinearGradient(...lg, [
                                {offset: 0.1, color: [...ct, '1)'].join(',')},
                                {offset: 0.5, color: [...ct, '0.5)'].join(',')},
                                {offset: 1.0, color: [...ct, '0.1)'].join(',')}
                            ]));
                        } else {
                            colors.push(nc);
                        }
                        let nameVal = alias[name];
                        nameVal ? (aliasMapTmp[name] = nameVal) : (nameVal = name);
                        legend.push({name: nameVal, icon: 'circle'});
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
                    lineStyle: {color: '#39456A', type: 'dashed', opacity: 0.4}
                },
                axisLine: hide,
                axisTick: hide,
                triggerEvent: true,
                splitNumber: yAxisExt_new.splitNum,
                inverse: isPosRight,
                axisLabel:{
                    show: yAxisExt_new.show,
                    fontSize: yAxisExt_new.fontSize,
                    // color: yAxisExt_new.fontColor,
                    color: "rgb(170, 170, 170)",
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
            }
            yAxis.push(yOpt);

            if (showNewYAli) {
                let newYOpt = {
                    name: newYAxisExt_new.title,
                    type: 'value',
                    splitLine: {
                        show: newYAxisExt_new.show,
                        lineStyle: {color: '#39456A', type: 'dashed', opacity: 0.4}
                    },
                    axisLine: hide,
                    axisTick: hide,
                    triggerEvent: true,
                    splitNumber: newYAxisExt_new.splitNum,
                    inverse: isPosRight,
                    axisLabel:{
                        show: newYAxisExt_new.show,
                        fontSize: newYAxisExt_new.fontSize,
                        // color: newYAxisExt_new.fontColor,
                        color: "rgb(170, 170, 170)",
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
                }
                yAxis.push(newYOpt);
            }

            let xAxis = {
                type: 'category',
                data: xData,
                axisLine: {
                    show: xAxisExt_new.show,
                    lineStyle: {color: '#39456A'}
                },
                axisTick: hide,
                triggerEvent: true,
                axisLabel: {
                    show: xAxisExt_new.show,
                    interval: xAxisExt_new.showAllTick ? 0 : 'auto',
                    rotate: xAxisExt_new.fontRotate,
                    textStyle: {
                        color: "rgb(170, 170, 170)",
                        // color: xAxisExt_new.fontColor,
                        fontSize: xAxisExt_new.fontSize,
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
                textStyle: {
                    color: '#AFB8DB',
                    fontSize: 12
                },
                yAxis: isXYRotate ? xAxis : yAxis,
                xAxis: isXYRotate ? yAxis : xAxis,
                series: sData,
            };
            options.grid = {
                containLabel: true,
                right: 30,
                left: 20,
                top: 10,
                bottom: isDetailPg && legendExt.show ? 40 : 20,
            };
            options.tooltip = isDetailPg ? {
                trigger: tipItem ? 'item' : 'axis',
                confine: true,
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
                                "color": value.seriesType === 'line' ? value.color : (!!value.color.colorStops ? value.color.colorStops[0].color : '#555555'),
                            }
                        });
                        if (!_this.legendInfo.name) {
                            setTimeout(() => {
                                _this.$refs.bar.resize();
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
                                _this.$refs.bar.resize();
                            })
                        }
                        _this.legendInfo = {
                            "name": params.name,
                            "list": list,
                        };
                        
                    }
                }
            } : hide;
            options.textStyle = {
                // color: '#AFB8DB',
                color: "rgb(170, 170, 170)",
                fontSize: 12
            };
            if(isDetailPg && legendExt.show){
                options.legend = {
                    animation: true,
                    data: legend,
                    orient: 'horizontal',
                    bottom: 12,
                    type: 'scroll',
                    itemWidth: 10,
                    itemHeight: 10,
                    pageButtonGap: 10,
                    padding: [0, 20, 0, 20],
                    left: 'center',
                    textStyle: {color: "rgb(170, 170, 170)"},
                    pageTextStyle: {color: "rgb(170, 170, 170)"},
                    pageIconColor: {color: "rgb(170, 170, 170)"},
                    // left: 30,
                    // right: 30,
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
        line-height: 18px;
        font-size: 15px;
        font-weight: 700;
        color: #4A4D51;
        box-sizing: border-box;
        padding: 25px 21px;
        word-wrap: break-word;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .chart-draw {
        width: 100%;
        height: 232px;
        position: relative;
        .echarts_bar{
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
.data-bar-isDetailPg {
    width: 100%;
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
                display: none;
                width: 100%;
                box-sizing: border-box;
                padding-left: 24px;
                ul {
                    width: 100%;
                    line-height: 39px;
                    padding: 0;
                    margin: 0;
                    border-bottom: solid 1px #EAECEF;
                    li {
                        list-style-type: none;
                        display: inline-block;
                        font-size: 12px;
                        color: #6D737A;
                    }
                    .open {
                        color: #007AFF;
                    }
                }
            }
            .tooltip-info {
                width: 100%;
                box-sizing: border-box;
                padding: 14px 24px 0px 24px;
                font-family: PingFang SC;
                .tip-name {
                    font-size: 14px;
                    color: #555555;
                    word-wrap: break-word;
                }
                .number-info {
                    width: 100%;
                    overflow-x: auto;
                    display: inline-flex;
                    flex-wrap: nowrap;
                    .ele-info {
                        // height: 87px;
                        display: inline-table;
                        // margin-right: 20px;
                        box-sizing: border-box;
                        padding-right: 20px;
                        .num {
                            line-height: 67px;
                            font-size: 48px;
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