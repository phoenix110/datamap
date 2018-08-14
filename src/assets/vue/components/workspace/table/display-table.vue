<template>
    <div :class="['display-table-style', isDetailPg ? 'display-table-isDetailPg' : 'not-detail-pg']">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded || !viewLoaded">
            <f7-preloader></f7-preloader>
            <!-- <span class="ml5">努力加载中...</span> -->
        </div>
        <div class="content-area" v-else>
            <div class="table-title">{{title}}</div>
            <div class="filter-area"  v-if="isDetailPg">
                <FiltersPanel 
                    :geoFilters="geoFilters" 
                    :title="chartTitle" 
                    :filterParams="filterParams">
                </FiltersPanel>
            </div>
            <div class="table-content">
                <div class="table-scroll">
                    <table border="0" cellspacing="0" cellpadding="0" >
                        <tr class="table-header">
                            <th v-for="(vh, i) in header" :key="i">{{vh}}</th>
                        </tr>
                        <tr class="table-content-tr" v-for="(vd, j) in tableData" :key="j">
                            <td v-if="!!rowHeader.length">{{rowHeader[(currentPage-1)*pageSize+j]}}</td>
                            <td v-for="(value, m) in vd" :key="m" :style="{textAlign: checkType(value) ? 'right' : 'left'}">{{!!value ? value : ''}}</td>
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
import size from 'lodash/size';
import cloneDeep from 'lodash/cloneDeep';
import bus from '../../../../js/utils/bus';
import MdPagination from '../../commons/md-pagination.vue';
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import FiltersPanel from '../../commons/filters-panel.vue';
import {tableLoadTableRef , disPlayTabelDefaultVal, defaultDisPlayExtraValues} from '../../../../js/constants/Constants.js';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
export default {
    name: "display-table",
    props: ['cData', 'isDetailPg', 'geoFilters', 'chartTitle', 'viewLoaded'],
    data(){
        return {
            rowHeader: [],
            header: [],
            tableData: [],
            title: '',
            currentPage: 1,
            pageSizeList: [5, 10, 20, 30],
            allDataList: [],
            pageSize: this.isDetailPg ? 20 : 10,
            total: 0,
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
            this.tableData = this.allDataList.slice(start, end);
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
        getExtraVal(key, extra) {
            return cloneDeep(extra && extra[key] ? extra[key] :
                defaultDisPlayExtraValues[key]);
        },
        setTableData(chartData){
            let {yAxis, extra} = this.cData;
            let { titleVal} = extra || disPlayTabelDefaultVal || {};
            titleVal = titleVal || {};
            let yAxisExt = this.getExtraVal('yAxisExt', extra || {});
            let {hideIndex} = yAxisExt;
            let items = (yAxis[0] || {items: []}).items;
            let header = items.map(it=>titleVal[it.h_value] || it.h_value);
            let hMap = {}, rowHeader = [];
            chartData['columns'].forEach((it, index)=>{
                hMap[it] = index;
            });
            let list = chartData['values'].map((it, i)=>{
                if(!hideIndex)
                    rowHeader.push(i+1);
                return items.map(im=>it[hMap[im.key]]);
            });
            let hList = hideIndex ? [] : ['序号'];
            this.header = hList.concat(header);
            this.total = list.length;
            this.rowHeader = rowHeader;
            this.tableData = list.slice(0, this.pageSize);
            this.allDataList = this.isDetailPg ? list : [];
            return;
        },
        checkType(value){
            let reg = /^[0-9]+.?[0-9]*$/;
            return reg.test(value);
        }
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
.display-table-style {
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
        .table-scroll {
            width: 100%;
            max-height: 409px;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            table{
                min-width: 100%;
                font-family: PingFang SC;
                font-size: 12px;
                color: #555555;
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
                    color: #8b909e;
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
                    &>td:first-child {
                        text-align: right;
                    }
                }
                &>.table-content-tr:nth-of-type(odd) {
                    background-color: #f7f7f9;
                }
            }
        }
    }
}
.display-table-isDetailPg {
    width: 100%;
    height: 100%;
    background-color: #fff;
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
                    color: #5b5d65;
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
    .displayTable-enter, .displayTable-leave-active {
        height: 0;
    }
    .displayTable-enter-to, .displayTable-leave {
        height: 500px;
    }
    .displayTable-enter-active, .displayTable-leave-active {
        transition: all 3000ms;
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