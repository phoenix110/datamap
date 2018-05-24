
<template>
    <div :class="['table-load-style', isDetailPg ? 'table-isDetailPg' : 'not-detail-pg']">
        <div :class="['chart_loading', isDetailPg ? 'detailpg-loading' : '']" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="content-area" v-else>
            <div class="table-title">{{title}}</div>
            <div class="table-content">
                <div class="table-scroll">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr class="table-header">
                            <th v-for="(vh, i) in header" :key="i">{{vh}}</th>
                        </tr>
                        <tr class="table-content" v-for="(vd, j) in tableData" :key="j">
                            <td v-for="(value, m) in vd" :key="m">{{!!value ? value : ''}}</td>
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
import MdPagination from '../../commons/md-pagination.vue';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';
import size from 'lodash/size';
import {editYAxiNumberMenus, roundNum, gauge_target_type_column,
    guageExtraValues, tableLoadTableRef , disPlayTabelDefaultVal} from '../../../../js/constants/Constants.js';
import fetchUtil from '../../../../js/utils/fetchUtil';
import {model_api_url, headers, paramFake} from '../../../../js/constants/ApiConfig'
export default {
    name: "table-load-panel",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            header: [],
            tableData: [],
            title: this.cData.title,
            currentPage: 1,
            pageSizeList: [5, 10, 20, 30],
            allDataList: [],
            pageSize: this.isDetailPg ? 20 : 10,
            total: 0,
            loaded: false,
        }
    },
    created(){
        this.getFillData();
    },
    components: {
        MdPagination,
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
            fetchUtil(`${model_api_url}graph/config?force_update=${force_update}${paramFake}`,
            {method: 'POST', headers, body: JSON.stringify(this.cData)})
            .then(resp=>{
                this.setTableData(resp.result);
                this.loaded = true;
            })
        },
        setTableData(chartData){
            let _this = this;
            let {xAxis: yAlis, yAxis: xAlis, sortHeader, sortDire, xStatistics, xFunc, yStatistics, yFunc} = _this.cData;

            let header = [];
            xAlis && xAlis.forEach(x=>{// 追加y轴列名
                x.items && x.items.forEach(it=>{
                    header.push(`${it.h_value}-${editYAxiNumberMenus[it.func]}`);
                })
            });
            let data = chartData && chartData.map(({result})=>{
                let sum = [];
                for(let i in result){
                    sum.push(round(result[i], roundNum));
                }
                return sum;
            });

            let yTotal = [], hasY = size(yAlis);
            if (yStatistics) {
                yTotal.push(`总计-${editYAxiNumberMenus[yFunc]}`);
                hasY && (yTotal.push('-'));
                data.forEach(it=>{
                    yTotal.push(round(statisticsAct[yFunc](it), roundNum));
                })
            }
            if (hasY) {
                header.unshift(yAlis[0].h_value);
                let m = (chartData[0] || {}).result, n = [];
                for(let i in m){
                    n.push(i);
                }
                data.unshift(n);
            }
            let list = []; // 列转行
            data[0].forEach((_, i)=>{
                let tmp = [i + 1];
                header.forEach((_,j)=>{
                    tmp[j + 1] = data[j] ? data[j][i] : '';
                })
                list[i] = tmp;
                if (xStatistics) {
                    let tl = tmp.slice(hasY ? 2 : 1);
                    tmp.push(round(statisticsAct[xFunc](tl), roundNum));
                }
            })
            if (xStatistics) {
                header.push(`总计-${editYAxiNumberMenus[xFunc]}`);
            }
            header.unshift('序号');
            _this.header = header;
            let index = header.indexOf(sortHeader);
            if (index !== -1) {
                list = orderBy(list, (it)=>{
                    return it[index];
                }, sortDire);
                list = list.map((it, index)=>{
                    it[0] = index + 1;
                    return it;
                })
            }

            if (yStatistics) {
                list.push(yTotal);
            }
            _this.total = list.length;
            _this.tableData = list.slice(0, _this.pageSize);
            _this.allDataList = this.isDetailPg ? list : [];
            return;
        }
    }
}
</script>
<style lang="scss" scoped>
.not-detail-pg {
    max-height: 500px;
}
.table-load-style {
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
        padding: 20px 38px 32px 38px;
        .table-scroll {
            width: 100%;
            max-height: 409px;
            overflow: auto;
            table{
                min-width: 100%;
                text-align: center;
                font-family: PingFang SC;
                font-size: 12px;
                color: #555555;
                .table-header {
                    background-color: #F8F8FA;
                    th {
                        box-sizing: border-box;
                        padding: 12px 17px;
                        // line-height: 42px;
                        border: solid 1px #C8C7CC;
                        border-right: none;
                        white-space: nowrap;
                    }
                    &>th:last-child {
                        border-right: solid 1px #C8C7CC;
                    }
                }
                .table-content {
                    td {
                        border-left: solid 1px #C8C7CC;
                        box-sizing: border-box;
                        padding: 2px 0;
                        white-space: nowrap;
                    }
                    &>td:last-child {
                        border-right: solid 1px #C8C7CC;
                    }
                }
                &>.table-content:last-child {
                    td {
                        border-bottom: solid 1px #C8C7CC;
                    }
                }
            }
        }
    }
}
.table-isDetailPg {
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
            .table-scroll {
                max-height: none;
                height: 100%;
            }
        }
        .pagination-area {
            width: 100%;
            height: 30px;
            box-sizing: border-box;
            padding-top: 5px;
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