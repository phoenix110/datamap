<template>
    <div :class="isDetailPg ? 'load-panel-isDetailPg' : 'progress-load-panel'">
        <div :class="['chart_loading', isDetailPg ? 'detailpg_loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="progress-title" v-if = "!isDetailPg">{{cData.title}}</div>
            <div v-else>
                <div class="filter-area">
                    <FiltersPanel
                            :geoFilters="geoFilters"
                            :title="chartTitle"
                            :filterParams="filterParams">
                    </FiltersPanel>
                </div>
                <div class="progress-detail-info" v-if="isDetailPg">
                    <div class="title">{{cData.title}}</div>
                    <div class="scroll-area" :style="{'visibility': dataShow.data.length !=0 ? '' : 'hidden'}">
                        <div class="info-template" :style ='{color:dataShow.color}' v-for="(item, dx) in dataShow.data"
                             :key="dx">
                            <div class="value" v-if="item.toggleShow">{{item.value}}</div>
                            <div class="name" v-if="item.toggleShow" >{{item.name}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="progress-con" ref="progressCon">
               <div class="content">
                   <div class="value" :style="{color:dataShow.color}" >
                       <!--目标值，百分比 -->
                       <div class="target_num" v-for="(item, dx) in dataShow.data" :key="dx" v-if="item.toggleShow">{{item
                           .value}}</div>
                   </div>
                   <!--描边，背景色，圆角-->
                   <div class="line_progress" :style="wrapperStyle">
                       <!--前景色 圆角 -->
                       <div className="line_progress_inner" :style="innerStyle" >
                       </div>
                   </div>
               </div>
            </div>
        </div>
    </div>
</template>
<script>
    import fetchUtil from '../../../../js/utils/fetchUtil';
    import size from 'lodash/size';
    import forEach from 'lodash/forEach';
    import round from 'lodash/round';
    import keys from 'lodash/keys';
    import pick from 'lodash/pick';
    import isArray from 'lodash/isArray';
    import cloneDeep from 'lodash/cloneDeep';
    import FiltersPanel from '../../commons/filters-panel.vue';
    import {EditPoiCardExtraValues} from '../../../../js/constants/Constants.js';
    import {editYAxiNumberMenus, roundNum, formulaWordMap,
        defaultProgressExtraValues, defaultLegendStyle,
        progress_target_type_column, new_chart_colors as chart_colors
    , progress_shape_round, progress_shape_square, new_chart_colors} from
    '../../../../js/constants/Constants';
    import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
    export default {
        name: "progress-load-panel",
        props: ['cData', 'isDetailPg', 'geoFilters', 'chartTitle', 'viewLoaded'],
        components: {FiltersPanel},
        data(){
            return {
                title: '',
                Msg: "",
                showContent: [
                    {
                        title: "",
                        value: "",
                    }
                ],
                loaded: false,
                preViewExtraValue: {},
                filterParams: {},
                dataShow:{
                    title: "",
                    data: []
                },
                wrapperStyle:{},
                innerStyle : {},
            }
        },
        created(){
            if(size(this.cData)){
                let {cData} = this;
                this.getFillData();
                this.filterParams = {
                    source: cData.source,
                    object_type: cData.object_type,
                    geometry_type: cData.geometry_type,
                }
            }
        },
        watch: {
            cData: function(){
                if(size(this.cData)){
                    let {cData} = this;
                    this.getFillData();
                    this.filterParams = {
                        source: cData.source,
                        object_type: cData.object_type,
                        geometry_type: cData.geometry_type,
                    }
                }
            }
        },
        methods: {
            getFillData(force_update=false){
                let {cData: {name, filters}, geoFilters} = this;
                fetchUtil(`${model_api_url}graph/config?force_update=${force_update}${paramFake}&vault_name=${name}`,
                    {method: 'POST', headers, body: JSON.stringify(geoFilters)})
                    .then(resp=>{
                        if(resp.result){
                            console.log(resp.result)
                            this.getOption(resp.result);
                        }
                        else{
                            this.Msg = resp.Msg;
                        }
                        this.loaded = true;
                    })
            },
            getExtraVal(key) {
                let val = this.preViewExtraValue;
                return cloneDeep(val && val[key] ? val[key] :
                    defaultProgressExtraValues[key]);
            },
            getDataVal(val, force, roundNum, def='') {
                return val ? (force ? val.toFixed(roundNum) : round(val, roundNum)) : def;
            },
            fillExtDefault(ext, def) {
                forEach(def, (val,key)=>{!ext[key] && (ext[key] = val)});
            },

            getOption(chartData) {
                let _this = this;
                let {  target_type, yAxis , extra:{yAxisExt}} = _this.cData;
                let item = yAxis[0].items[0], name = '', value = 0, target_value = 0;
                if (item) {//数值第一项，被除数
                    name = `${item.h_value}-${formulaWordMap[item.func]}`;
                    value = ((chartData[0] || {}).result || {})[item.key] || 0;
                };
                //数值第二项，目标值
                if (target_type === progress_target_type_column) {
                    let key = (yAxis[1].items[0] || {}).key || '';
                    target_value = ((chartData[1] || {}).result || {})[key] || 0;
                }
                let target = target_value ? parseFloat(target_value) : 0;
                let pointPercent = target ? value / target : 0;
                let percent = pointPercent * 100;
                let color = yAxisExt.colorMap || {};
                let nc = color[name] || new_chart_colors[0];
                percent = this.getDataVal(percent, yAxisExt.percentForce,
                    yAxisExt.percentRoundNum, 0); // 百分比格式化
                target = this.getDataVal(target, yAxisExt.targetForce,
                    yAxisExt.targetRoundNum, 0); // 目标值格式化
                value = this.getDataVal(value, yAxisExt.valueForce,
                    yAxisExt.valueRoundNum, 0); // 当前值格式化

                // 设置颜色
                let progressColor = nc;
                if (isArray(nc)) {
                    let [points, colors] = nc;
                    progressColor = colors[colors.length - 1];
                    forEach(points, (it, index)=>{
                        if (percent <= it) {
                            progressColor = colors[index];
                            return false;
                        }
                    });
                }
                let borderRadius = yAxisExt.shape==progress_shape_square ?
                    '0px' : '7px';
                let bg = progressColor.split(',');
                bg.pop();
                let bgcolor =  bg.concat('0.2)').join(',');
                let qjcolor = bg.concat('1)').join(',')
                this.wrapperStyle = {
                    borderColor:yAxisExt.showBorder?qjcolor:"",
                    borderRadius,
                    backgroundColor:bgcolor,
                };
                this.innerStyle = {
                    backgroundColor:qjcolor,
                    borderRadius,
                    height: 100+'%',
                };
                this.dataShow = {
                    color:qjcolor,
                    data: [
                        {name: "具体数值", value: target,toggleShow : yAxisExt.showPercent},
                        {name: "百分比", value: percent+'%',toggleShow : yAxisExt.showValue}
                    ]
                }
                return ''
            }
        }
    }
</script>
<style lang="scss" scoped>
 .progress-load-panel{
     width: 100%;
     background-color: #FFFFFF;
     font-family: PingFang SC;
    .chart_loading {
         width: 100%;
         height: 100%;
         min-height: 250px;
    }
    .progress-con{
        display: flex;
        flex-direction: column;
        margin: 0 21px;
        margin-bottom: 32px;
        justify-content:center;
        min-height: 90px;
         .content{
             .value{
                 display: flex;
                 font-size: 16px;
                 line-height: 22px;
                 padding-bottom: 6px;
                 font-family:"PingFang SC";
                 .target_num{
                     margin-right: 20px;
                 }
             }
             .line_progress{
                 width: 100%;
                 height:14px;

             }
         }
     }
 }
.load-panel-isDetailPg{
    height: 100%;
    width: 100%;
    background-color: #fcfcfc;
    position: relative;
    .detailpg_loading {
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
     .progress-con{
         display: flex;
         flex-direction: column;
         justify-content:center;
         justify-items: center;
         margin: 0 21px;
         margin-bottom: 32px;
         height: 60%;
         .value{
             display: flex;
             font-size: 24px;
             line-height: 34px;
             padding-bottom: 6px;
             font-family:"PingFang SC";
             .target_num{
                 margin-right: 20px;
             }
        }
         .line_progress{
             width: 100%;
             height:14px;
             background:red;
             .line_progress_inner{

             }
         }
      }
    }
 .content-area {
     width: 100%;
     height: 100%;
     display: flex;
     flex-direction: column;
     .progress-title {
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
     .progress-detail-info{
         width: 100%;
         height: 120px;
         box-sizing: border-box;
         padding: 5px 0 0 0;
         font-family: PingFang SC;
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
         .title{
             width: 100%;
             line-height: 22px;
             font-size: 16px;
             color: #57585C;
             padding-left: 16px;
             box-sizing: border-box;
         }
     }

 }
</style>
