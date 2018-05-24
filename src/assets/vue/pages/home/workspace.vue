<template>
    <f7-page class="ws_page" :class="{ws_nodata: !hasData}" navbar-through toolbar-fixed tabs  ptr @ptr:refresh="onRefresh" @page:afterin="onPageAfterin" @page:beforeout="onPageBeforeout">
        <f7-navbar v-if="hasData">
            <f7-nav-left>
                <f7-link hidden></f7-link>
            </f7-nav-left>
            <div class="title workspace-nav-tit" :class="{open}" @click="toggleShowWorkspaces">
                <span v-if="titleShow">{{selectPage.title || "工作台"}}</span>
                <f7-icon f7="chevron_down"></f7-icon>
            </div>
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".ws-searchbar-comp" icon-f7="search"
                         @click.native.stop.prevent="hideWss"></f7-link>
            </f7-nav-right>
            <f7-searchbar key="ws_searchbar"
                          class="ws-searchbar-comp"
                          search-container=".ws-searchbar-comp-list"
                          search-in="a" expandable backdrop
                          disable-button-text="取消"
                          placeholder="搜索"
                          @searchbar:enable="searchpage=true"
                          @searchbar:disable="onSearchDisable"
                          @searchbar:clear="clearSearch"
                          @input="onSearchInput"
                          ref="searchbarf7"
            ></f7-searchbar>
        </f7-navbar>
        <transition name="ws-top-fade" slot="fixed" >
            <div class="ws-nav-top-list" v-if="open" @click.prevent="hideWss" @touchstart.prevent="hideWss">
                <f7-list @touchstart.native.stop @click.native.stop>
                    <f7-list-item v-for="item in pages"
                                  :key="item.id"
                                  @click="onSelectPage(item)"
                                  :class="{selected: item.id===selectedPageId}"
                    >
                        {{item.title}}
                    </f7-list-item>
                </f7-list>
            </div>
        </transition>
        <div class="search-model" v-if="searchpage && searchContent.length === 0"></div>
        <div v-show="hasData" :class="searchpage && searchContent.length === 0 ? 'content-noscroll' : ''">
            <div class="charts-draw-area">
                <lazyload-echarts class="echart_card" @getPageList="getPageList" :selectPageIndex="selectedPageId" :searchContent="searchContent" :reRandom="reRandom"></lazyload-echarts>
                <!-- <div class="layer" @click="layerClick"></div> -->
            </div>
        </div>
        <main-tabbar :selected-index="0" v-if="!searchpage"></main-tabbar>
    </f7-page>
</template>
<script>
import '../../../../assets/sass/workspace.scss'
import mainTabbar from '../../components/main-tabbar.vue'
import find from 'lodash/find'
import LazyloadEcharts from "src/assets/vue/components/lazyload-echarts";
import bus from '../../../js/utils/bus'
import { setTimeout } from 'timers';
let CachedData = [];
export default {
    components: {LazyloadEcharts, mainTabbar},
    data() {
        return {
            open: false,
            pages: [],
            selectedPageId: 0,
            titleShow: false,
            items: [],
            searchpage: false,
            searchContent: '',
            searchHistory: [{name: '苏州', key: 'su'}, {name: '杭州', key: 'hang'}],
            searchList: [{name: '上海', key: 'shang'}, {name: '北京', key: 'bei'}],
            reRandom: '',
        }
    },
    computed: {
        selectPage: function () {
            return find(this.pages, {id: this.selectedPageId}) || {};
        },
        hasData: function () {
            return this.pages.length > 0;
        }
    },
    methods: {
        layerClick(e){
            console.log(e);
        },
        onSearchDisable(){
            this.searchpage=false;
            this.searchContent = '';
        },
        clearSearch(){
            this.searchContent = '';
        },
        onSearchInput(e){
            this.searchContent = e.target.value;
        },
        getPageList(list){
            this.pages = list;
            this.titleShow = true;
            //为了看起来有个加载效果，加个延时
            setTimeout(() => {
                this.$f7.ptr.done();
            }, 300)
        },
        onPageAfterin() {
            setTimeout(() => {
                //页面跳转后下拉刷新
                let self = this;
                setTimeout(() => {
                    if (!self.pages.length) {
                        self.$f7.ptr.refresh();
                    }
                }, 350);
                this.pageContent = self.$$('.ws_page .page-content').length === 1 ? self.$$('.ws_page .page-content')[0] : self.$$('.ws_page .page-content')[1];
                // 监听这个dom的scroll事件
                this.pageContent.addEventListener('scroll', self.onScroll, false);
            })
        },
        onPageBeforeout() {
            let self = this;
            this.pageContent && this.pageContent.removeEventListener('scroll', self.onScroll, false)
        },
        //处理选择pages
        toggleShowWorkspaces: function () {
            this.open = !this.open;
        },
        hideWss: function () {
            if (!this.open) return;
            this.open = false;
        },
        onSelectPage: function (item) {
            this.selectedPageId = item.id;
            this.open = false;
        },

        onRefresh(event, done) {
            this.reRandom = Date();
        },
        onScroll(e) {
            bus.$emit('page_scroll', e)
        },
    },
};
</script>
<style scoped lang="scss">
.ws_page {
    .search-template {
        width: 100%;
        height: 100%;
        ul {
            width: 100%;
            box-sizing: border-box;
            padding-left: 16px;
            margin: 0;
            font-family: PingFang SC;
            li {
                list-style-type: none;
                transition: all 0.5s;
            }
        }
        .history-list {
            .text {
                font-size: 14px;
                color: #C8C7CC;
                line-height: 25px;
            }
            .history {
                font-size: 18px;
                color: #0076FF;
                line-height: 30px;
            }
            .active {
                background-color: #FFFFFF;
            }
        }
        .result-list {
            .result {
                width: 100%;
                line-height: 45px;
                border-bottom: solid 1px #B4BAC4;
                font-size: 18px;
                display: block;
            }
            .active {
                background-color: #F2F2F5;
            }
        }
    }
    .search-model {
        position: absolute;
        z-index: 10;
        width: 100%;
        height: calc(100vh - 44px);
        background-color: rgba(0,0,0,0.5);
    }
    .content-noscroll {
        width: 100%;
        height: calc(100vh - 44px);
        overflow-y: hidden;
    }
    .charts-draw-area {
        width: 100%;
        position: relative;
        .layer {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 100;
            background-color: #fff;
            opacity: 0;
        }
    }
}
</style>
