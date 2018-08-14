<template>
    <div :class="['hot-table-style', isDetailPg ? 'hot-table-isDetailPg' : 'not-detail-pg']">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="table-title">{{title}}</div>
            <div class="filter-area" v-if="isDetailPg">
                <FiltersPanel 
                    :geoFilters="geoFilters" 
                    :title="chartTitle" 
                    :filterParams="filterParams">
                </FiltersPanel>
            </div>
            <div class="table-content">
                <div class="table-scroll">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr class="table-header">
                            <th v-for="(vh, i) in header" :key="i">{{vh}}</th>
                        </tr>
                        <tr class="table-content-tr" v-for="(vd, j) in tableData" :key="j">
                            <td v-for="(value, m) in vd" :key="m" :style="{'backgroundColor': tab_bgColor[displayStart+j][m], textAlign: checkType(value) ? 'right' : 'left'}">{{value}}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="pagination-area" v-if="isDetailPg">
                <MdPagination :total="allDataList.length" :pageSize="pageSize" :currentPage="currentPage" :pageSizeList="pageSizeList" @onPageChange="onPageChange"></MdPagination>
            </div>
        </div>
    </div>
</template>
<script>
import {interpolateRgbBasis} from 'd3-interpolate'
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import bus from '../../../../js/utils/bus';
import FiltersPanel from '../../commons/filters-panel.vue';
import {tableLoadTableRef , disPlayTabelDefaultVal, example_colors, defaultHotTableExtraValues} from '../../../../js/constants/Constants.js';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig';
import MdPagination from '../../commons/md-pagination.vue';
export default {
    name: "hot-table",
    props: ['cData', 'isDetailPg', 'geoFilters', 'chartTitle', 'viewLoaded'],
    data(){
        return {
            header: [],
            tableData: [],
            title: '',
            maxVal: '',
            minVal: '',
            tab_bgColor: [],
            currentPage: 1,
            pageSizeList: [5, 10, 20, 30],
            allDataList: [],
            pageSize: this.isDetailPg ? 20 : 10,
            total: 0,
            displayStart: 0,
            reverseHotColor: false,
            hotColors: "",
            loaded: false,
            filterParams: {},
            geoFiltersBf: {},
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
            this.title = this.cData.title;
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
        onPageChange(currentPage){
            this.currentPage = currentPage;
            let start = this.pageSize*(this.currentPage-1), end = this.pageSize*(this.currentPage);
            if(start+this.pageSize > this.total){
                end = this.total;
            }
            this.displayStart = start;
            this.tableData = [];
            this.$nextTick(()=>{
                this.tableData = this.allDataList.slice(start, end);
            });
        },
        getFillData(force_update=false){
            let {cData: {name, filters}, geoFiltersBf} = this;
            fetchUtil(queryUrl(`${model_api_url}graph/config`, {
                force_update,
                vault_name: name,
            }),
            {method: 'POST', headers, body: JSON.stringify(geoFiltersBf)})
            .then(resp=>{
                this.setTableData(resp.result || {});
                this.loaded = true;
            })
        },
        refreshGraphFilter(filters){
            this.geoFiltersBf.filters = filters;
            this.getFillData();
        },
        getExtraVal(val, key) {
            return cloneDeep(val && val[key] ? val[key] :
                defaultHotTableExtraValues[key]);
        },
        setTableData(chartData){
            let _this = this;
            let {extra} = this.cData;
            let yAxisExt = this.getExtraVal(extra, 'yAxisExt');
            let {reverseHotColor, hotColor} = yAxisExt;
            _this.reverseHotColor = reverseHotColor;
            let {colors} = example_colors[hotColor] || example_colors[0];
            this.hotColors = colors;
            let {x, y, values} = chartData || {x: [], y: [], values: []};
            let header = [''];
            header = header.concat(x);
            //计算背景颜色
            let maxs = [], mins = [];
            values.forEach((value, i) => {
                maxs.push(Math.max.apply(null, value));
                mins.push(Math.min.apply(null, value));
            });
            _this.maxVal = Math.max.apply(null, maxs);
            _this.minVal = Math.max.apply(null, mins);
            let tab_bgColor = values.map((vl, i1) => {
                let items = vl.length != 0 && vl.map((v, i2) => {
                    return _this.rendererCol(v);
                });
                let m = ['rgba(FF, FF, FF, FF)'];
                return m.concat(items);
            });
            let list = y.map((v, i) => {
                let m = [];
                m.push(v);
                m = m.concat(values[i]);
                return m;
            });
            _this.tab_bgColor = tab_bgColor;
            _this.header = header;
            _this.total = list.length;
            _this.tableData = list.slice(0, _this.pageSize);
            _this.allDataList = this.isDetailPg ? list : [];
        },
        rendererCol(value){
            if(!!value){
                let color_func = interpolateRgbBasis(this.hotColors);
                let radio = value/this.maxVal || 0;
                this.reverseHotColor && (radio = 1 - radio);
                return color_func(radio);
            }
            else{
                return 'rgba(FF, FF, FF, FF)';
            }
        },
        checkType(value){
            let reg = /^[0-9]+.?[0-9]*$/;
            return reg.test(value);
        },
    },
    components: {
        MdPagination,
        FiltersPanel,
    }
}
</script>
<style lang="scss" scoped>
.not-detail-pg {
    max-height: 500px;
    min-height: 100px;
    th, td {
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .chart_loading {
        min-height: 100px;
    }
}
.hot-table-style {
    width: 100%;
    .table-title {
        width: 100%;
        box-sizing: border-box;
        padding: 26px 21px 0 21px;
        font-family: PingFang SC;
        font-size: 15px;
        font-weight: 700;
        color: #4A4D51;
        word-wrap: break-word;
    }
    .table-content{
        width: 100%;
        box-sizing: border-box;
        padding: 16px 24px;
        color: #000;
        .table-scroll {
            width: 100%;
            max-height: 409px;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            table{
                min-width: 100%;
                font-family: PingFang SC;
                font-size: 12px;
                .table-header {
                    color: #a1a6b2;
                    font-size: 12px;
                    font-weight: 500;
                    background-color: #f9f9f9;
                    th {
                        box-sizing: border-box;
                        padding: 0 8px;
                        line-height: 32px;
                        border: solid 1px #efefef;
                        border-right: none;
                        white-space: nowrap;
                    }
                    &>th:last-child {
                        border-right: solid 1px #efefef;
                    }
                }
                .table-content-tr {
                    font-size: 10px;
                    font-weight: 400;
                    td {
                        border: solid 1px #efefef;
                        border-top: none;
                        border-right: none;
                        box-sizing: border-box;
                        line-height: 24px;
                        padding: 0 8px;
                    }
                    &>td:last-child {
                        border-right: solid 1px #efefef;
                    }
                }
            }
        }
    }
}
.hot-table-isDetailPg {
    width: 100%;
    height: 100%;
    position: relative;
    .content-area{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .table-title {
            display: none;
        }
        .table-content {
            padding: 0;
            flex: 1;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            .table-scroll {
                max-height: none;
                height: 100%;
                table .table-content-tr {
                    font-size: 14px;
                    font-weight: 300;
                    td {
                        line-height: 20px;
                        padding: 8px 8px;
                        max-width: 200px;
                    }
                }
            }
        }
        .pagination-area {
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
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