<template>
    <f7-page   @page:afterin="onPageAfterin"
               @page:afterout="onPageAfterout"
               @page:beforein="onPageBeforein"
               @page:beforeout="onPagebeforeout"
               class="myDataCaluse"
               data-page="myDataCaluse"
               navbar-through 
               toolbar-through
               infinite>
        <f7-navbar class="myDataCaluseNavBar">
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title></f7-nav-title>
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".cluse-searchbar-comp" icon-f7="search"
                ></f7-link>
            </f7-nav-right>
            <f7-searchbar key="cluse_searchbar"
                          class="cluse-searchbar-comp"
                          search-container=".detail_data_list"
                          search-in=".item-title"
                          disable-button-text="取消"
                          placeholder="搜索"
                          ref="searchbarf7"
                          search-list=".detail_data_list"
                          found=".searchbar-found"
                          notFound=".searchbar-not-found"
                          expandable
                          backdrop
                          custom-search
                          @searchbar:enable="onSearchEnable"
                          @searchbar:disable="onSearchDisable"
                          @searchbar:clear="clearSearch"
                          @searchbar:search="doSearch(searchContent)"
                          @input="onSearchInput"
            ></f7-searchbar>
        </f7-navbar>
        <div class="cluse-title line-split" v-show="!searchPage">
            <div class="title">{{MyDataCluse.name}}-{{title}}</div>
            <div class="type-number"><span>{{title}} | 共{{MyDataCluse.ids}}条{{title}}</span></div>
            <f7-link text="地图查看" @click.prevent="onPageSkip('/upload/')"></f7-link>
        </div>
        <mydata-list :items="cluseItems" :feedsCount="feedsCount" @clickItem="gotoMydataDetail"></mydata-list>
        <div class="my-data-search-popover" v-if="searchPage">
            <mydata-list :items="searchClusItems" :feedsCount="feedsCount" @clickItem="gotoMydataDetail"></mydata-list>
            <div class="preloader infinite-scroll-preloader" v-if="showSearchLoader"></div>
        </div>
    </f7-page>
</template>

<script>
    import forEach from 'lodash/forEach';
    import size from 'lodash/size';
    import map from 'lodash/map';
    import bus from '../../../js/utils/bus';
    import {geo_types, geoTypesMap, pageSize, paths, GlobalKeys} from '../../../js/constants/Constants';
    import { getCluseDataApi, getFeedsColApi, fuzzySearchcluseApi } from 'src/assets/apis/myDataCluse'
    import MydataList from '../../components/mydata/mydata-list.vue'
    import global from '../../../js/utils/global';
    import '../../../sass/my-data-cluse.scss';

    export default {
        name:'MyDataClause',
        components: { MydataList },
        props:[],
        data() {
            return {
                MyDataCluse:{},
                title:null,
                searchPage:false,
                searchContent:'',
                cluseItems:[],
                searchClusItems:[],
                pageNum:0,
                searchPageNum:0,
                allowInfinite:true,
                searchAllowInfinite:true,
                feedsCount:{},
                showSearchLoader: false,
            }
        },
        created(){//组件上树之前
            let ctx =  this.$f7Route.context;
            let isHasValue =ctx&&ctx.myDataCluseValue && ctx.myDataCluseValue;
            this.MyDataCluse = isHasValue ? isHasValue : JSON.parse(global.get(GlobalKeys.my_data_item) || "{}");
            this.title = geoTypesMap[geo_types[this.MyDataCluse.geo_type]];
            this.getCluseData()
        },
        mounted(){
            this.hidePreloader();
            bus.$on('forceUpdata',this.getCluseData)
        },
        beforeDestroy() {
            bus.$off('forceUpdata', this.getCluseData);
        },
        methods: {
            hidePreloader() {
                forEach(this.$$('.infinite-scroll-preloader'),(item,index) => {
                    item.style.display='none';
                })
            },
            showPreloader() {
                let preoloader = this.$$('.myDataCaluse .infinite-scroll-preloader');
                preoloader[0] && (preoloader[0].style.display='block');
            },
            onPageSkip(path){
                path===paths.upload && this.$f7router.navigate(paths.upload, {context:
                    {item:this.MyDataCluse}});
            },
            onSearchEnable(){
                this.searchPage = true;
            },
            onSearchDisable(){
                this.searchPage = false,
                this.searchContent = '';
                this.$f7.infiniteScroll.destroy('.my-data-search-popover');
            },
            clearSearch(){
                this.searchContent = '';
                this.showSearchLoader = false;
                clearTimeout(this.timeoutId);
            },
            doSearch(query){
                this.searchPageNum = 0;
                this.searchClusItems = []
                this.infiniteSearchScroll();
                clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(() => {
                    this.getsearchClusItems(query);
                }, 300)
            },
            onSearchInput(e){
                this.searchContent = e.target.value;
            },
            gotoMydataDetail(item){
                global.set(GlobalKeys.my_data_info,JSON.stringify(item));
                global.set(GlobalKeys.record_id,JSON.stringify(item.id));
                this.$f7router.navigate(paths.my_data_detail,{context:{record_id:item.id}})
            },
            getCluseData(){
                getCluseDataApi(this.MyDataCluse,this.pageNum,pageSize)
                    .then(resp => {
                        this.allowInfinite = true;
                        if (resp.result&&resp.result.length!=0) {
                            let newData = this.cluseItems.concat(resp.result)
                            this.cluseItems = newData;
                            if(resp.result.length<pageSize){
                                this.allowInfinite = false;
                            }
                            this.getFeeds(map(resp.result, r => r.id));
                        }else {
                            this.allowInfinite = false;
                        }
                        this.hidePreloader();
                        this.addScrollListen();
                    }).catch(err => {
                    console.error(err);
                })
            },
            getFeeds(ids){
                if (!size(ids)) return;
                getFeedsColApi(ids)
                    .then(resp => {
                        if (resp.result) {
                            this.feedsCount = {...this.feedsCount, ...resp.result};
                        }
                    }).catch(err => {
                        console.error(err);
                })
            },
            getsearchClusItems(query){//模糊搜索分页查询
                if (!query) return;
                this.showSearchLoader = true;
                this.fetchClusItemsBySearch(query);
            },

            fetchClusItemsBySearch(query) {
                fuzzySearchcluseApi(this.MyDataCluse, this.searchPageNum, pageSize, query)
                    .then(resp => {
                        if (query !== this.searchContent) {
                            this.showSearchLoader = false;
                            return;
                        }
                        this.searchAllowInfinite = true;
                        if (resp.result) {
                            let newData = this.searchClusItems.concat(resp.result)
                            this.searchClusItems = newData;
                            if(resp.result.length<pageSize){
                                this.searchAllowInfinite = false;
                            }
                            this.getFeeds(map(resp.result, r => r.id));
                        }else {
                            this.searchAllowInfinite = false;
                        }
                        this.showSearchLoader = false;
                        this.addScrollListen();
                    }).catch(err => {
                        this.showSearchLoader = false;
                    console.error(err);
                })
            },

            infiniteScroll(){
                this.$f7.infiniteScroll.destroy('.myDataCaluse .infinite-scroll-content');
                this.$$(".myDataCaluse .infinite-scroll-content").off('infinite');
                this.$f7.infiniteScroll.create('.myDataCaluse .infinite-scroll-content');
                let _this = this;
                this.$$(".myDataCaluse .infinite-scroll-content").on('infinite',function () {
                    if (!_this.allowInfinite || _this.searchPage) return;
                    _this.allowInfinite = false;
                    _this.showPreloader();
                    ++_this.pageNum;
                    _this.getCluseData()
                })
            },

            infiniteSearchScroll() {
                this.$f7.infiniteScroll.destroy('.my-data-search-popover');
                this.$$(".my-data-search-popover").off('infinite');
                this.$f7.infiniteScroll.create('.my-data-search-popover');
                let _this = this;
                this.$$(".my-data-search-popover").on('infinite',function () {
                    if(!_this.searchAllowInfinite) return;
                    _this.searchAllowInfinite = false;
                    ++_this.searchPageNum;
                    _this.getsearchClusItems(_this.searchContent);
                })
            },
            
            addNavStyle() {
                if (this.navStyle) return;
                this.navStyle = document.createElement('style');
                this.navStyle.type = "text/css";
                this.navStyle.innerHTML = `
                    .ios .navbar:after{
                        background-color: transparent;
                    }
                `;
                document.head.appendChild(this.navStyle);
            },
            removeNavStyle() {
                this.navStyle && this.navStyle.remove();
                this.navStyle = null;
            },
            onPageBeforein() {
                if (this.$$('.myDataCaluse .page-content')[0].scrollTop > this.$$('.cluse-title')[0].clientHeight) {
                    this.removeNavStyle();
                }else {
                    this.addNavStyle();
                }
            },
            onPagebeforeout() {
                this.removeNavStyle();
            },
            onPageAfterin(){
                this.infiniteScroll();
                this.addScrollListen();
            },
            onPageAfterout(){
                this.removeScrollListen();
            },
            addScrollListen() {
                this.removeScrollListen();
                this.$$('.myDataCaluse .page-content').on('scroll', this.onPageScroll)
            },
            removeScrollListen() {
                this.$$('.myDataCaluse .page-content').off('scroll', this.onPageScroll);
            },
            onPageScroll(e) {
                let scrollTop = e.target.scrollTop;
                let $navtitle = this.$$('.navbar-current .title');
                if (scrollTop > 80) {
//                    console.log(this.$$('.navbar-current .title')[0])
                    $navtitle[0] && ($navtitle[0].innerText = this.MyDataCluse.name + "-" +
                        this.title);
                }else {
                    console.log($navtitle[0]);
                    $navtitle[0] && ($navtitle[0].innerText = "");
                }
                let $clusetitle = this.$$('.cluse-title')[0];
                if ($clusetitle && (scrollTop > $clusetitle.clientHeight)) {
                    this.removeNavStyle();
                }else {
                    this.addNavStyle();
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .myDataCaluse{
        .cluse-title{
            height: auto;
            background: #f7f7f8;
            padding: 10px 27px 0;
            position: relative;
            .title{
                font-size: 28px;
                line-height: 40px;
                font-family: "PingFang SC";
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp:2;  /* 设置行数 */
                -webkit-box-orient: vertical;
            }
            .type-number{
                font-size: 10px;
                color: #B6B6B6;
                line-height: 18px;
            }
            a{
                font-size: 14px;
                line-height: 40px;
            }
        }
    }

    .my-data-search-popover {
        background: #fff;
        position: fixed;
        top: 44px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        z-index: 999999;
    }
</style>

