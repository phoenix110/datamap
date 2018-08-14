<template>
    <f7-page class="mydata" navbar-through toolbar-through tabs 
        @page:afterin="onPageAfterin">
        <f7-navbar class="navbar" ref="uploadNavbar">
            <f7-nav-left>
                <f7-link hidden></f7-link>
            </f7-nav-left>
            <div class="title" >数据</div>
            <f7-nav-right>
                <f7-link  class="link pop-link"
                          icon-f7="more_fill"
                          back-link="false"
                          @click="onShowPop">
                </f7-link>
            </f7-nav-right>
        </f7-navbar>
        <div :class="contenStytObject">
            <f7-searchbar
                key="mydata_searchbar"
                placeholder="搜索"
                disable-button-text="取消"
                @searchbar:enable="onSearchEnable"
                @searchbar:disable="onSearchDisable"
                @searchbar:clear="clearSearch"
                @input="onSearchInput"
            ></f7-searchbar>
            <f7-popover :opened="openedPop"
                        target=".pop-link"
                        @popover:closed="onHidePop">
                <f7-list class="data-sort-list">
                    <f7-list-item v-for="(item,key) in sortMenus"
                                :key="key"
                                class="list-button popover-close"
                                @click="onchangeSortType(key)"
                    >
                        {{item.title}}
                    </f7-list-item>
                </f7-list>
            </f7-popover>
            <transition name="ws-top-fade" slot="fixed" >
                <div class="content-list">
                    <div class="search-model"
                        v-show="!searchpage && searchText==''"
                        @click="onSearchDisable">
                    </div>
                    <tree-menu :data="currentList" @onItemClick="goToMyDataClause" v-show="hasData"></tree-menu>
                </div>
            </transition>
            <div class="no-data-content" v-show="noData">
                <div class="no-data-content-img"></div>
            </div>
            <div class="no-data-content" v-show="loading">
                <f7-preloader></f7-preloader>
            </div>
        </div>
        <main-tabbar :selected-index="2" v-if="searchpage"></main-tabbar>
    </f7-page>
</template>

<script>
    import cloneDeep from 'lodash/cloneDeep';
    import size from 'lodash/size';
    import forEach from 'lodash/forEach';
    import filter from 'lodash/filter';
    import find from 'lodash/find'
    import uniqWith from 'lodash/uniqWith';
    import mainTabbar from '../../components/main-tabbar.vue'
    import TreeMenu from "../../components/upload/tree-menu.vue";
    import {filter_tree,  render_pid} from '../../../js/utils/filter_util'
    import userUtil from '../../../js/utils/userUtil';
    import {geo_types, geoTypesMap,  market_level_5, source_customer,
            source_market, market_label_tip, sortMenus,directory_cfg, paths, GlobalKeys} from '../../../js/constants/Constants';
    import '../../../../assets/sass/mydata.scss'
    import { getResourcesData, fetchDirectoryConfigData } from 'src/assets/apis/myData';
    import global from '../../../js/utils/global';

    export default {
        props: ["testModel"],
        data() {
            return {
                searchText:'',
                currentList:[],
                resourceList: [],
                allResource:{},
                directoryCfg: {},
                sortType: sortMenus[0],
                sortMenus:sortMenus,
                user: {},
                searchpage:true,
                openedPop: false,
                loading: false,
            }
        },
        components: {//引用子组件
            'main-tabbar':mainTabbar,
            'tree-menu':TreeMenu,
        },
        computed:{
            contenStytObject: function () {
                return {
                    'mydata-content-search':this.searchpage,
                    'mydata-content':!this.searchpage,
                }
            },
            hasData: function() {
                return this.currentList.length && !this.loading
            },
            noData: function() {
                return !this.currentList.length && !this.loading
            }
        },
        created(){
            this.user = userUtil.get();
            this.fetchDirectoryConfig();
        },
        methods: {
            onPageAfterin() {
                (!this.searchpage) && this.$f7.navbar.hide('.navbar');
            },
            onSearchEnable(){
                this.$f7.navbar.hide('.navbar');
                this.searchpage = false;
                this.$f7.searchbar.enable()
            },
            onSearchDisable(){
                this.$f7.navbar.show('.navbar');
                this.searchpage = true;
                this.clearSearch()
                this.$f7.searchbar.disable()
            },
            clearSearch(){
                this.searchText = "";
                this.currentList = this.getAllByFilter(this.resourceList);
            },
            onSearchInput(e){
                this.searchText = e.target.value;
                this.currentList = this.getAllByFilter(this.resourceList);
            },
            onchangeSortType(key){
                this.sortType = this.sortMenus[key];
                this.getResources()
            },
            onShowPop() {
                this.openedPop = true;
            },
            onHidePop() {
                this.openedPop = false;
            },
            goToMyDataClause(value){
                global.set(GlobalKeys.package_id,JSON.stringify(value.ids));
                global.set(GlobalKeys.my_data_item,JSON.stringify(value));
                this.$f7Router.navigate(paths.my_data_clause,{context: {myDataCluseValue: value,package_id:value.ids}})
            },
            getAllByFilter(rss) {
                var {searchText} = this;
                var filterRss = filter_tree(rss, 'name', searchText);
                return filterRss;
            },
            getResources() {//获得用户数据
                getResourcesData().then(resp => {
                    let res = {
                        "customer": resp ? resp : {}
                    }
                    this.allResource = this.getAllRss(res);
                    this.getCurResourcesBySortType();
                    this.loading = false;
                })
                .catch(err => {
                    console.error(err);
                    this.loading = false;
                })
            },
            getAllRss(resp) {//处理用户的点线面polygon私有数据
                var rss = [];
                if (5 === market_level_5) {
                    let {customer, market} = resp || {};
                    if (customer) {
                        let {point, polygon, line, plain} = customer;
                        forEach(point, (p, k) => {
                            rss.push(this.getPoiNode(k, p[0]));
                        })
                        forEach(polygon, (p, k) => {
                            rss.push(this.getPolygonNode(k, p[0]));
                        })
                        forEach(line, (p, k) => {
                            rss.push(this.getLineNode(k, p[0]));
                        })
                        // forEach(plain, (p, k) => {
                        //     rss.push(this.getPlainNode(k));
                        // })
                    }
                    if (market) {
                        let {point, polygon, line, plain} = market;
                        forEach(point, p => {
                            rss.push(this.getPoiNode(`${p.object_type}${market_label_tip}`, source_market, p.id));
                        })
                        forEach(polygon, p => {
                            rss.push(this.getPolygonNode(`${p.object_type}${market_label_tip}`, source_market, p.id));
                        })
                        forEach(line, p => {
                            rss.push(this.getLineNode(`${p.object_type}${market_label_tip}`, source_market, p.id));
                        })
                        forEach(plain, p => {
                            rss.push(this.getPlainNode(`${p.object_type}${market_label_tip}`, source_market, p.id));
                        })
                    }
                } else {
                    let {point, polygon, line, plain} = resp || {};
                    forEach(point, (p, k) => {
                        rss.push(this.getPoiNode(k));
                    })
                    forEach(polygon, (p, k) => {
                        rss.push(this.getPolygonNode(k));
                    })
                    forEach(line, (p, k) => {
                        rss.push(this.getLineNode(k));
                    })
                    forEach(plain, (p, k) => {
                        rss.push(this.getPlainNode(k));
                    })
                }
                return rss;
            },
            dealAllResource() {
                let all = this.getRssByGeoType();
                this.fetchDirectoryConfig();
            },
            getRssByGeoType() {//处理用户数据结构
                var all = [];
                var pois = filter(this.allResource, t => t.geo_type == geo_types.point);
                var polygons = filter(this.allResource, t => t.geo_type == geo_types.polygon);
                var lines = filter(this.allResource, t => t.geo_type == geo_types.line);
                var plains = filter(this.allResource, t => t.geo_type == geo_types.plain);
                all.push({
                    id: 0,
                    name: geoTypesMap[geo_types.point],
                    geometry_type: geo_types.point,
                    children: pois,
                    isParent: true,
                })
                all.push({
                    id: 1,
                    name: geoTypesMap[geo_types.polygon],
                    geometry_type: geo_types.polygon,
                    children: polygons,
                    isParent: true,
                })
                all.push({
                    id: 2,
                    name: geoTypesMap[geo_types.line],
                    geometry_type: geo_types.line,
                    children: lines,
                    isParent: true,
                })
                all.push({
                    id: 3,
                    name: geoTypesMap[geo_types.plain],
                    geometry_type: geo_types.plain,
                    children: plains,
                    isParent: true,
                })
                return all
            },
            fetchDirectoryConfig() {//获得用户私有数据的文件夹列表
                var params = {};
                let id =  this.user && this.user.id;
                this.loading = true;
                fetchDirectoryConfigData(directory_cfg, id).then(resp => {
                    if(!resp.Status){
                        this.directoryCfg = resp.result && resp.result[0] && resp.result[0].extra || {};
                        render_pid(this.directoryCfg.dirs);
                        let dirs = cloneDeep(this.directoryCfg.dirs);
                        dirs.forEach((vl, dx, input) => {
                            input[dx].children = [];
                        })
                        this.resourceList = dirs;
                        this.currentList = dirs;
                        this.getResources();
                    }else {
                        this.getResources();
                    }
                }).catch(err => {
                    console.error(err);
                    this.getResources();
                })
            },
            getCurResourcesBySortType() {
                var {curPageAll} = this;
                var all = this.getAllResourcesBySortType();
                this.resourceList = all;
                this.currentList = all;
            },
            //根据sorttype 获取 tree menu
            getAllResourcesBySortType() {
                var {sortType:{type}} = this;
                let all = [];
                if (type == sortMenus[0].type) { // 文件夹分类
                    var leftRss = []; //剩余未分类
                    var dirs = this.directoryCfg && this.directoryCfg.dirs || [];
                    dirs = cloneDeep(dirs);
                    if (size(dirs)) {
                        forEach(dirs, d => {
                            var s = [];
                            d.children = uniqWith(d.children, (t,m) => {
                                return t.name == m.name && t.source == m.source && t.packageId == m.packageId && t.geo_type == m.geo_type;
                            })
                            forEach(d.children, t => {
                                let fd = find(this.allResource, a => {
                                    let isGeo = a.name === t.name && a.geo_type === t.geo_type;
                                    if (isGeo && a.source === source_market) {
                                        return a.packageId === t.packageId;
                                    }
                                    return isGeo;
                                });
                                if (fd) {
                                    s.push(fd);
                                }
                            })
                            d.children = s;
                        })
                        forEach(this.allResource, t => {
                            let hasF = find(dirs, d => find(d.children, c => {
                                let isGeo = c.name == t.name && c.geo_type == t.geo_type;
                                if (isGeo && c.source === source_market) {
                                    return c.packageId === t.packageId;
                                }
                                return isGeo;
                            }));
                            if (!hasF) {
                                leftRss.push(t);
                            }
                        })
                    }else {
                        leftRss = this.allResource;
                    }
                    all = [...dirs, ...leftRss];
                }else if (type == sortMenus[1].type){ // 类型分类
                    all = this.getRssByGeoType();
                }
                return all
            },

            getPoiNode(name, ids, source=source_customer, packageId='') {
                let id = `${geo_types.point}_${name}_${source}_${packageId}`;
                return {id, ids, name, source, packageId, geo_type: geo_types.point, iconSkin: 'tree_poi_icon', isParent: false};
            },
            getPolygonNode(name, ids, source=source_customer, packageId='') {
                let id = `${geo_types.polygon}_${name}_${source}_${packageId}`;
                return {id, ids, name, source, packageId, geo_type: geo_types.polygon, iconSkin: 'tree_polygon_icon', isParent: false};
            },
            getLineNode(name, ids, source=source_customer, packageId='') {
                let id = `${geo_types.line}_${name}_${source}_${packageId}`;
                return {id, ids, name, source, packageId, geo_type: geo_types.line, iconSkin: 'tree_polyline_icon', isParent: false};
            },
            getPlainNode(name, ids, source=source_customer, packageId='') {
                let id = `${geo_types.plain}_${name}_${source}_${packageId}`;
                return {id, ids, name, source, packageId, geo_type: geo_types.plain, iconSkin: 'tree_plain_icon', isParent: false};
            },
        }
    };
</script>

<style lang="scss" scoped>
    .search-model {
        position: absolute;
        z-index: 10;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    .mydata-content{
        position: absolute;;
        top: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        background-color: #fff;
    }
    .mydata-content-search {
        position: absolute;;
        top: 44px;
        height: calc(100vh - 44px);
        padding-bottom: 50px;
        width: 100%;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        background-color: #fff;
    }
    .popover-backdrop{
        top:44px;
    }
</style>

