<template>
    <f7-page navbar-through toolbar-through>
        <f7-navbar ref="uploadNavbar">
            <f7-nav-left>
                <f7-link back>
                    <i class="f7-icons">left</i>
                </f7-link>
            </f7-nav-left>
            <f7-searchbar key="upload_searchbar"
                class="up-searchbar-comp"
                search-container=".up-searchbar-comp-list"
                disable-button-text="取消"
                placeholder="搜索"
                backdrop
                :clear-button="false"
                @searchbar:disable="onSearchDisable"
                @input="onSearchInput"
                ref="MoreDataSearch"
            ></f7-searchbar>
        </f7-navbar>
        <div class="search-cancel" v-if="searchCancel">请输入查询内容</div>
        <div class="page-content infinite-scroll-content" v-else>
            <GeoPositionList :positionList="positionList" :listStatus="listStatus" :detailsList="detailsList" :feedsCount="commentFeedsCount"></GeoPositionList>
            <div class="preloader infinite-scroll-preloader more-data-preloader" v-if="listStatus==='details'"></div>
            <div class="have-no-more" v-if="!moreData">我是有底线的...</div>
        </div>
    </f7-page>
</template>
<script>
import GeoPositionList from '../../components/upload/normal/geo-position-list.vue';
import fetchUtil from '../../../js/utils/fetchUtil';
import queryUrl from '../../../js/utils/queryUrl';
import {model_api_url, map_api_url, headers} from '../../../js/constants/ApiConfig';
import size from 'lodash/size';
let AMap = window.AMap;
export default {
    name: "MoreDataPage",
    data(){
        return {
            positionList: [],
            detailsList: [],
            listStatus: "",
            dataPg: {},
            pageSize: 20,
            pageNum: 0,
            moreData: true,
            searchContent: '',
            allowInfinite: true,
            searchCancel: false,
            placeSearch: {},
            commentFeedsCount: {},
        }
    },
    mounted(){
        let context = this.$f7Route.context;
        if(context){
            this.listStatus = context.type === "position" ? "geo" : "details";
            this.dataPg = context.dataPg ? context.dataPg : {};
            this.searchContent = context.searchContent ? context.searchContent : "";
            this.$refs.MoreDataSearch.f7Searchbar.enable();
            this.$refs.MoreDataSearch.f7Searchbar.$inputEl.val(this.searchContent);
        }
        if(this.listStatus === "geo"){
            this.$$(".infinite-scroll-preloader")[0] && (this.$$(".infinite-scroll-preloader")[0].style.display = "none");
            this.createPlaceSearch(this.searchContent);
        }
        else{
            this.setScroll();
            this.dataQuery();
        }
    },
    components: {
        GeoPositionList,
    },
    methods: {
        setScroll(){
            let _this = this;
            _this.$$('.infinite-scroll-content') && _this.$$('.infinite-scroll-content').on('infinite', function(){
                if(_this.moreData){
                    if (!_this.allowInfinite) return;
                    _this.allowInfinite = false;
                    _this.$$(".infinite-scroll-preloader")[0] && (_this.$$(".infinite-scroll-preloader")[0].style.display = "block");
                    _this.dataQuery();
                }
            })
        },
        dataQuery(){
            let {dataPg, pageSize, pageNum, searchContent, detailsList, searchCancel} = this;
            if(!size(dataPg) || searchCancel || !size(searchContent)){
                this.detailsList = [];
                this.pageNum = 0;
                this.allowInfinite = true;
                this.$$(".infinite-scroll-preloader")[0] && (this.$$(".infinite-scroll-preloader")[0].style.display = "none");
                return;
            }
            fetchUtil(queryUrl(`${model_api_url}query`, {
                source: 'customer',
                object_type: dataPg.name,
                geometry_type: dataPg.geo_type,
                q: searchContent,
                page_num: pageNum,
                page_size: pageSize,
            }), {method: 'GET', headers}).then(resp => {
                if(!resp.Status){
                    this.detailsList = detailsList.concat(resp.result);
                    this.getFeedsCount("batch");
                    if(resp.result.length < pageSize){
                        this.moreData = false;
                    }
                    else{
                        this.pageNum = pageNum+1;
                    }
                    this.$$(".infinite-scroll-preloader")[0] && (this.$$(".infinite-scroll-preloader")[0].style.display = "none");
                    this.allowInfinite = true;
                }
                else{
                    this.detailsList = [];
                    this.pageNum = 0;
                    this.allowInfinite = true;
                    this.$$(".infinite-scroll-preloader")[0] && (this.$$(".infinite-scroll-preloader")[0].style.display = "none");
                }
            })
        },
        onSearchDisable(){
            this.searchCancel = true;
            this.pageNum = 0;
            this.detailsList = [];
            this.positionList = [];
            this.moreData = true;
            this.searchContent = "";
        },
        onSearchInput(e){
            let {listStatus, placeSearch} = this;
            if(listStatus === "geo"){
                this.searchCancel = false;
                this.searchContent = e.target.value;
                if(size(this.searchContent))
                    placeSearch.search(this.searchContent);
                else{
                    this.positionList = [];
                }
            }
            else{
                this.searchCancel = false;
                this.searchContent = e.target.value;
                this.pageNum = 0;
                this.detailsList = [];
                this.moreData = true;
                this.dataQuery();
            }
        },
        createPlaceSearch(searchContet){
            let _this =this;
            AMap.plugin('AMap.Autocomplete', function() {
                let placeSearch = new AMap.Autocomplete({
                    "datatype": "poi",
                });
                placeSearch.on('complete', (e) => {
                    _this.getGeoLocation(e);
                });
                _this.placeSearch = placeSearch;
                _this.placeSearch.search(searchContet);
            });
        },
        getGeoLocation(e){
            this.positionList = size(e.tips) ? e.tips : [];
        },
        getFeedsCount(type){
            let {detailsList, currentPointInfo} = this, path="";
            if(type === "single"){
                if(!size(currentPointInfo)) return;
                path = `${currentPointInfo.id}/count?types=text_comment,image_comment&action=current&update_time=true`;
            }
            else if(type === "batch"){
                if(!size(detailsList)) return;
                let idList = [];
                detailsList.map((vl, dx) => {
                    idList.push(vl.id);
                });
                let num = idList.join(',');
                path = `count?reference_ids=${num}&types=text_comment,image_comment&action=current&update_time=true`;
            }
            fetchUtil(queryUrl(`${model_api_url}feeds/page/${path}`), {method: 'GET', headers}).then(resp => {
                if(!resp.Status){
                    if(type === "single")
                        this.commentFeeds = resp.result;
                    else
                        this.commentFeedsCount = resp.result;
                }
                else{
                    this.commentFeedsCount = {};
                    this.commentFeeds = {};
                }
            })
        },
    }
}
</script>
<style lang="scss" scoped>
.search-cancel {
    text-align: center;
    color: #8e8e8e;
    box-sizing: border-box;
    padding-top: 10px;
}
.infinite-scroll-content {
    padding-top: 0 !important;
    background-color: #fff;
    .more-data-preloader {
        margin-top: 16px;
        margin-bottom: 16px;
        background-color: #fff;
    }
    .have-no-more {
        width: 100%;
        height: 44px;
        line-height: 44px;
        text-align: center;
        color: #8e8e8e;
    }
}
</style>