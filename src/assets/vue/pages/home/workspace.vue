<template>
    <f7-page class="ws_page" navbar-through toolbar-fixed tabs hide-bars-on-scroll ptr @ptr:refresh="onRefresh" @page:afterin="onPageAfterin" @page:beforeout="onPageBeforeout">
        <f7-navbar>
            <f7-nav-left>
                <f7-link hidden></f7-link>
            </f7-nav-left>
            <div class="title workspace-nav-tit" :class="{open}" @click="toggleShowWorkspaces">
                <span>{{selectPage.title || "工作台"}}</span>
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
        <f7-list class="ws-searchbar-comp-list searchbar-found"
                 media-list
        >
            <f7-list-item
                    v-for="(item, index) in items"
                    :key="item.index"
                    media-item
                    link="/chart_detail/vault_type/chart/vault_id/hs1281/">
                <lazyload-echarts class="echart_card" :item="item"></lazyload-echarts>
            </f7-list-item>
        </f7-list>
        <main-tabbar :selected-index="0"></main-tabbar>
    </f7-page>
</template>
<script>

    import '../../../../assets/sass/workspace.scss'
    import mainTabbar from '../../components/main-tabbar.vue'
    import find from 'lodash/find'
    import LazyloadEcharts from "src/assets/vue/components/lazyload-echarts";
    import bus from '../../../js/util/bus'

    let CachedData = [];

    export default {
        components: {LazyloadEcharts, mainTabbar,},
        data() {
            return {
                open: false,
                pages: [
                    {id: 0, title: '上海交通流量分析'},
                    {id: 1, title: '上海楼市分析'},
                    {id: 2, title: '上海租房市场分析'},
                    {id: 3, title: '杭州旅游'},
                    {id: 4, title: '万科测试数据'},
                    {id: 5, title: '上海地块线路分析'},
                ],
                selectedPageId: 0,
                items: [],
            }
        },
        computed: {
            selectPage: function () {
                return find(this.pages, {id: this.selectedPageId}) || {};
            }
        },
        methods: {
            onPageAfterin() {
                setTimeout(() => {
                    //页面跳转后下拉刷新
                    let self = this;
                    self.refreshData(() => {
                        self.$f7.ptr.done();
                    });
                    setTimeout(() => {
                        if (!self.items.length) {
                            self.$f7.ptr.refresh();
                        }
                    }, 350);
                    this.pageContent = self.$$('.ws_page .page-content')[0]
                    // 监听这个dom的scroll事件
                    this.pageContent.addEventListener('scroll', self.onScroll, false)
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
                this.refreshData(done);
            },
            refreshData(done) {
                setTimeout(() => {
                    let items = [];
                    for (let i = 1; i <= 12; i++) {
                        items.push({
                            index: i,
                            title: 'Item ' + i,
                        });
                    }
                    CachedData = items;
                    this.items = items;
                    done();
                }, 1000)
            },
            onScroll(e) {
                bus.$emit('page_scroll', e)
            }
        },
    };
</script>
