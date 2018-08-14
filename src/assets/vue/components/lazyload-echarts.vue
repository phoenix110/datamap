<template>
    <div class="lazyload-echarts-style">
        <div class="draw-block" ref="dom" v-for="(vl1, i1) in filterCardList" :key="i1">
            <div class="title" v-if="!vl1.newCardTitle">
                <div class="name">{{vl1.title}}</div>
                <div class="description">{{vl1.description}}</div>
            </div>
            <div class="geo-polygon" @click="openGeo(i1)" :style="{'display': vl1.geo_info ? 'block' : 'none'}">
                <div class="geo-title">
                    <div class="geo_icon"><i class="icon-map"></i></div>
                    <div class="text">围栏范围</div>
                    <div :ref="'select'+i1" class="select_icon"><i class="icon-arrow-down"></i></div>
                </div>
                <div :ref="'snap'+i1" class="snapshot-open">
                    <div class="img-display" :style="{'backgroundImage': `url(${vl1.geo_info ? static_url+vl1.geo_info.thumb : ''})`}"></div>
                </div>
            </div>
            <div class="chart_area">
                <f7-list class="ws-searchar-comp-list searchbar-found" media-list no-hairlines-between no-hairlines>
                    <f7-list-item
                        v-for="vl2 in vl1.cards"
                        :key="JSON.stringify(vl2)"
                        media-item
                        @click="onClickF7ListItem(vl1, vl2, vl1.geo_filter)">
                        <ChartPanel :listData="vl2" :key="JSON.stringify(vl2)" :isStatic="vl1.is_static" :rfRandom="rfRandom" :geoFilters="getCardFilters(vl1, vl2)"></ChartPanel>
                        <div class="chart_cover"  @click="onClickCover" v-if="hasBarCover(vl2)"></div>
                    </f7-list-item>
                </f7-list>
            </div>
        </div>
    </div>
</template>
<script>
import {getData, getPagDir} from 'src/assets/apis/pageList';
import bus from '../../js/utils/bus';
import ChartPanel from './workspace/chart-panel.vue';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import {static_map_url} from '../../js/constants/ApiConfig';
import {market_label_tip, vault_interactive_map, paths, fence_select} from '../../js/constants/Constants.js';
import PinYin from '../../js/utils/PinYin';
import userUtil from "../../js/utils/userUtil";
import MdPagination from './commons/md-pagination.vue';
const market_level_5 = 5;
const source_customer = 'customer';
const geo_types = {point:'point',polygon:'polygon',line:'line',plain:'plain'};
const geoTypesMap = {
    [geo_types.point]: '点数据',
    [geo_types.polygon]: '面数据',
    [geo_types.line]: '线数据',
    [geo_types.plain]: '非地理数据',
};
const source_market = 'market';
const chart_type_file = 'file';
const directory_cfg = 'page_dir_cfg';
export default {
    components: {ChartPanel, MdPagination},
    props: {
        animate: Boolean,
        selectPageIndex: Number,
        searchContent: String,
        reRandom: String,
    },
    data() {
        return {
            allPageData: [],
            currentPageData: {},
            cardNum: 0,
            cardList: [],
            filterCardList: [],
            pageList: [],
            static_url: static_map_url,
            geoPolyFlag: false,
            pageSizeList: [5, 10, 20, 30],
            currentPage: 1,
            rfRandom: '',
            isRefresh: false,
            skipFlag: false,
            pageDirList: [],
        }
    },
    created(){
        //获取移动端数据
        this.getPageDir();
    },
    mounted(){
        //交互式地理卡片切换功能
        bus.$on("interactiveMapGetData", () => {
            this.getPageDir();
        })
    },
    beforeDestroy() {
        let self = this;
        clearTimeout(this.timeoutId);
        bus.$off("interactiveMapGetData");
    },
    watch: {
        selectPageIndex: function(){
            this.setData();
        },
        searchContent : function(newVl, oldVl){
            this.searchCard(newVl);
        },
        reRandom: function(){
            this.isRefresh = true;
            this.getPageDir();
        },
    },
    methods: {
        onPageChange(currentpage){
            this.currentPage = currentpage;
        },
        getPageDir(){
            let user = userUtil.get();
            let id = user && user.id || "";
            getPagDir(directory_cfg+'_'+id).then(resp => {
                if(!resp.Status){
                    let dirs = !!resp.result[0] ? resp.result[0].extra.dirs : [], out_orders = !!resp.result[0] ? resp.result[0].extra.out_orders : [], pageDirList = [];
                    dirs && dirs.map(vl => {
                        vl.children && vl.children.map(vl2 => {
                            pageDirList.push(vl2.id);
                        })
                    });
                    this.pageDirList = pageDirList.concat(out_orders);
                }
                else{
                    this.pageDirList = [];
                }
                this.getPageData();
            }).catch(err => {
                console.error(err);
                this.pageDirList = [];
                this.getPageData();
            })
        },
        getPageData(){
            this.allPageData = this.allPageData || [];
            this.currentPageData = this.currentPageData || [];
            this.filterCardList = this.filterCardList || [];
            getData().then(resp => {
                    if (!resp.Status) {
                        this.resolvePageData(resp.result);
                    }else{
                        this.resolvePageData([]);                        
                    }
                    if(this.isRefresh){
                        this.rfRandom = Date();
                    }
                }).catch(err => {
                    console.log(err);
                    this.resolvePageData([]);      
                })
        },
        resolvePageData(pageData){
            let {pageDirList} = this, pageList = [], allPageData = [];
            pageDirList.map((vl1, dx1) => {
                pageData.map((vl2, dx2) => {
                    if(vl2.name === vl1){
                        let id = pageList.length;
                        pageList.push({
                            "id": id,
                            "value": vl2.name,
                            "title": vl2.extra.title,
                        });
                        let pageData = {
                            "id": vl2.id,
                            "name": vl2.extra.name,
                            "title": vl2.extra.title,
                            "filter_type": vl2.extra.filter_type,
                            "items": vl2.extra.configs || [],
                        };
                        allPageData.push(pageData);
                    }
                })
            })
            if(pageData.length != allPageData.length){
                let allPageDataLast = [], pageListLast = [];
                pageData.map(vl1 => {
                    let flag = true;
                    allPageData.map(vl2 => {
                        if(vl1.name === vl2.name){
                            flag = false;
                        }
                    });
                    if(flag){
                        let id = pageList.length + pageListLast.length;
                        pageListLast.push({
                            "id": id,
                            "value": vl1.name,
                            "title": vl1.extra.title,
                        });
                        let pageData = {
                            "id": vl1.id,
                            "name": vl1.extra.name,
                            "title": vl1.extra.title,
                            "filter_type": vl1.extra.filter_type,
                            "items": vl1.extra.configs || [],
                        };
                        allPageDataLast.push(pageData);
                    }
                });
                pageList = pageList.concat(pageListLast);
                allPageData = allPageData.concat(allPageDataLast);
            }
            this.pageList = pageList;
            this.allPageData = allPageData;
            this.$emit("getPageList", pageList);
            this.setData();
        },
        setData(){
            this.currentPageData = this.allPageData[this.selectPageIndex] || {};
            let cardList = this.currentPageData.items || [];
            this.cardNum = cardList.length;
            cardList.forEach((vl, index, input) => {
                if(input[index].is_static && input[index].cards.length === 1){
                    input[index].newCardTitle = true;
                }
                else if(!input[index].title || input[index].title === ""){
                    input[index].title = "新建卡片";
                }
                if(!input[index].is_static){
                    input[index].cards.forEach((vl2, index2, input2) => {
                        if(vl2.vault === vault_interactive_map){
                            //检测该card是否有自定义筛选
                            let key = size(vl2.config.cards) ? vl2.thumb : "";
                            if(size(key)){
                                let filters = localStorage.getItem(`mdt_geo_filters_${key}`);
                                if(size(filters)){
                                    filters = JSON.parse(filters);
                                    if(filters.status){
                                        if(filters.filters.type === fence_select){
                                            let customers = [];
                                            filters.filters.filters.map(vl => {
                                                customers.push(vl.oid);
                                            });
                                            input[index].geo_filter = {customers};
                                        }
                                        else{
                                            input[index].geo_filter = filters.filters;
                                        }
                                        input2[index2].filter_img = true;
                                        input2[index2].config.cards[0].geo_filters = filters.filters;
                                    }
                                }
                            }
                            input2[index2].geo_filter = vl.geo_filter;
                        }
                    })
                }
            });
            this.cardList = cardList;
            this.filterCardList = this.cardList;
            this.rfRandom = Date();
            console.log('this.filterCardList', this.filterCardList);
        },
        openGeo(index){
            if(this.$refs['select'+index][0].classList.value.indexOf('icon_dir') === -1){
                this.$refs['select'+index][0].classList.add('icon_dir');
            }
            else{
                this.$refs['select'+index][0].classList.remove('icon_dir');
            }
            if(this.$refs['snap'+index][0].classList.value.indexOf('is-snapshot-open') === -1){
                this.$refs['snap'+index][0].classList.add('is-snapshot-open');
            }
            else{
                let _this = this;
                this.$refs['snap'+index][0].classList.remove('is-snapshot-open');
                let height = this.$refs['snap'+index][0].getClientRects()[0].height;
                let time = height/254.0*1000;
            }
        },
        searchCard(searchText){
            let filterCardList = [];
            searchText && this.cardList.map((vl, index) => {
                if(!vl.newCardTitle){
                    let result = PinYin.getFilterArrNew(vl, searchText, 'title');
                    if(result){
                        filterCardList.push(vl);
                    }
                }
                else{
                    let items = [];
                    vl.items && vl.items.map((vl2, index2) => {
                        let result = PinYin.getFilterArrNew(vl2.config, searchText, 'title');
                        if(result){
                            items.push(vl2)
                        }
                    });
                    if(items.length != 0){
                        let sum = vl; sum.items = items;
                        filterCardList.push(sum);
                    }
                }
            });
            this.filterCardList = searchText ? filterCardList : this.cardList;
        },
        onTouchstart(e) {
            return false;
        },
        hasBarCover(value){
            if(value.vault === "graph" && value.chart_type != "statistics" && value.chart_type != "display_table" && value.chart_type != "hot_table"){
                return true;
            }
            else{
                return false;
            }
        },
        onClickF7ListItem(vl1, vl2, geoFilters){
            let {pageList, selectPageIndex, skipFlag} = this;
            let flag = this.hasBarCover(vl2);
            this.$emit("onClickItem");
            if(skipFlag || !flag){
                this.skipFlag = false;
                this.$f7Router.navigate(paths.chart_detail, {context: {data: vl2, isDetailPg: true, pageTitle: pageList[selectPageIndex], isStatic: vl1.is_static, geoFilters: this.getCardFilters(vl1, vl2)}})
            }
        },
        onClickCover(e){
            this.skipFlag = true;
        },
        getCardFilters(vl1, vl2){
            let geo_filter = size(vl1.geo_filter) ? vl1.geo_filter : {};
            geo_filter.filters = size(vl2.filters) ? vl2.filters : [];
            return geo_filter;
        }
    }
}
</script>
<style lang="scss">
.lazyload-echarts-style {
    padding-top: 8px;
    box-sizing: border-box;
    .pagination-test{
        width: 100%;
        height: 50px;
    }
    .filter-btn {
        width: 100%;
        height: 8px;
        line-height: 24px;
        font-size: 12px;
        color: #9592A0;
        .card-number {
            margin-left: 8px;
        }
        .filter-select {
            float: right;
            margin-right: 8px;
            span {
                display: inline-block;
                line-height: 24px;
                vertical-align: top;
            }
            i {
                font-size: 8px;
                margin-left: 4px;
                display: inline-block;
                vertical-align: center;
                margin-top: 6px;
            }
        }
    }
    .draw-block {
        width: 100%;
        border-radius: 6px;
        background-color: #fcfcfc;
        border: solid 1px #D1D5DA;
        box-sizing: border-box;
        margin-bottom: 8px;
        padding-bottom: 6px;
        padding-top: 6px;
        .title{
            width: 100%;
            // height: 82px;
            box-sizing: border-box;
            // padding: 17px 21px 10px 21px;
            padding: 11px 21px 10px 21px;
            border-bottom: solid 1px #EAECEF;
            .name {
                font-family: PingFang SC;
                font-weight: 700;
                font-size: 18px;
                line-height: 25px;
                color: #313131;
                word-wrap: break-word;
            }
            .description {
                margin-top: 10px;
                font-size: 14px;
                color: #586069;
                line-height: 20px;
                word-wrap: break-word;
            }
        }
        .geo-polygon {
            width: 100%;
            border-bottom: solid 1px #EAECEF;
            .geo-title {
                width: 100%;
                // width: 300px;
                line-height: 40px;
                box-sizing: border-box;
                padding: 0 19px 0 21px;
                display: flex;
                color: #586069;
                .geo_icon {
                    margin-right: 13px;
                    i {
                        width: 14px;
                        height: 14px;
                        font-size: 14px;
                    }
                    
                }
                .text {
                    flex-basis: 100%;
                    font-family: PingFang SC;
                    font-size: 14px;
                }
                .select_icon {
                    transition: all 0.5s;
                    i {
                        width: 12px;
                        height: 12px;
                        font-size: 12px;
                        
                    }
                }
                .icon_dir {
                    transform: rotate(180deg);
                }
            }
            .snapshot-open {
                position: relative;
                width: 100%;
                height: 0;
                box-sizing: border-box;
                padding: 0 22px;
                transition: height 1s;
                .img-display {
                    transition: height 1s;
                    z-index: 10;
                    width: 100%;
                    // height: 244px;
                    height: 0;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    // display: none;
                }
            }
            .is-snapshot-open {
                height: 254px;
                .img-display {
                    height: 244px;
                }
            }
        }
        .chart_area {
            .ws-searchar-comp-list{
                margin-top: 0px;
                margin-bottom: 0px;
                .media-item{
                    .item-content {
                        padding-left: 0;
                        .item-inner {
                            padding: 0;
                        }
                    }
                }
            }
            .media-list {
                ul {
                    li {
                        border-top: solid 1px #EAECEF;
                        position: relative;
                        background-color: #fff;
                    }
                    &>li:first-child {
                        border-top: none;
                    }
                }
                .chart_cover {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 220px;
                    opacity: 0;
                }
            }
        }
    }
}
</style>
