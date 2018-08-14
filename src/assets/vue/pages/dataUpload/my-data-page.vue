<template>
    <f7-page class="upload-data-page" navbar-through toolbar-through>
        <f7-navbar ref="uploadNavbar">
            <f7-nav-left>
                <f7-link back @click="onDataPageBack" text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">数据列表</div>
            <f7-nav-right>
                <div class="data-table-ope" @click="onClickNavbar">{{pageStatus === 2 ? '新建' : ''}}</div>
            </f7-nav-right>
        </f7-navbar>
        <f7-searchbar
            key="upload-my-data-search"
            class="upload-my-data-search"
            placeholder="搜索"
            disable-button-text="取消"
            :clear-button="false"
            @input="onSearchInput"
            @searchbar:enable="onSearchEnable"
            @searchbar:disable="onSearchDisable"
        ></f7-searchbar>
        <div :class="['page-content-list', searchContent.length === 0 && searchEnable ? 'page-search-model' : '']" >
            <div class="search-layer" @click="onSearchDisable"></div>
            <TreeMenu :data="currentList" @onItemClick="onSelectDataPg" v-show="hasData"></TreeMenu>
            <div class="no-data-content" v-show="noData">
                <div class="no-data-content-img"></div>
            </div>
            <div class="no-data-content" v-show="loading">
                <f7-preloader></f7-preloader>
            </div>
        </div>
    </f7-page>
</template>
<script>
import map from 'lodash/map'
import cloneDeep from 'lodash/cloneDeep'
import forEach from 'lodash/forEach'
import forEachRight from 'lodash/forEachRight'
import size from 'lodash/size'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import slice from 'lodash/slice'
import filter from 'lodash/filter'
import pick from 'lodash/pick'
import merge from 'lodash/merge'
import uniqWith from 'lodash/uniqWith';
import queryUrl from '../../../js/utils/queryUrl';
import bus from '../../../js/utils/bus';
import userUtil from '../../../js/utils/userUtil';
import { getResourcesData, fetchDirectoryConfigData } from 'src/assets/apis/myData';
import {filter_tree, get_node, render_pid} from '../../../js/utils/filter_util'
import {model_api_url, headers, paramFake} from '../../../js/constants/ApiConfig';
import {geo_types, geoTypesMap, market_level_5,
    source_customer, source_market, market_label_tip, GlobalKeys, paths} from '../../../js/constants/Constants';
import global from '../../../js/utils/global'
import TreeMenu from "../../components/upload/tree-menu.vue";
import PinYin from '../../../js/utils/PinYin';
const directory_cfg = 'directory_cfg';
const sortMenus = [
    {type: 'cus', title: '自定义分类'},
    {type: 'type', title: '按类型分类'},
    // {type: 'date', title: '按上传日期分类'},
    // {type: 'source', title: '按来源分类'},
]
const pageSize = 30;
export default {
    data(){
        return{
            currentItem: null,
            allResource: {},
            resourceList: [],
            currentList: [],
            directoryCfg: {},
            curPageAll: 1,
            countAll: 0,
            sortType: sortMenus[0],
            searchContent: '',
            user: {},
            searchEnable: false,
            loading: true,
            pageStatus: 1,
        }
    },
    computed:{
        hasData: function() {
            return this.currentList.length && !this.loading
        },
        noData: function() {
            return !this.currentList.length && !this.loading
        }
    },
    created(){
        setTimeout(() => {
            this.currentItem = size(this.$f7Route.context) ? this.$f7Route.context.item : null;
            this.pageStatus = size(this.$f7Route.context) ? this.$f7Route.context.pageStatus : 0;
            this.user = userUtil.get();
            this.fetchDirectoryConfig();
        }, 200)
    },
    mounted(){
        
    },
    components: {
        TreeMenu,
    },
    methods: {
        onSearchInput(e){
            this.searchContent = e.target.value;
            this.currentList = this.getAllByFilter(this.resourceList);
        },
        onSelectDataPg(vl){
            let {pageStatus} = this;
            this.currentItem = vl;
            bus.$emit("dataListPageBack", vl, pageStatus);
            this.$f7Router.back();
            let id = this.user && this.user.id;
            // if(this.prePage != "MapPanel")
            //     global.set(GlobalKeys.data_select_history + id, JSON.stringify(vl));
        },
        onDataPageBack(){
            bus.$emit("dataListPageBack", this.currentItem);
        },
        onClickNavbar(){
            // if(this.prePage === "MapPanel"){
            //     // this.currentItem = {};
            //     // bus.$emit("dataListPageBack", this.currentItem);
            //     // this.$f7Router.back();
            // }
            // else if(this.prePage === "MapDrawPanel" || this.prePage === "MapPanelToDrawPage"){
            //     this.$f7Router.navigate(paths.create_dataPkg);
            // }
            this.$f7Router.navigate(paths.create_dataPkg);
        },
        getResources() {
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
        fetchDirectoryConfig() {
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
                }
                else{
                    this.getResources();
                }
            }).catch(err => {
                console.error(err);
                this.getResources();
            })
        },
        getAllRss(resp) {
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
        getRssByGeoType() {
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
        getCurResourcesBySortType() {
            var {curPageAll} = this;
            var all = this.getAllResourcesBySortType();
            this.resourceList = all;
            this.currentList = all;
        },
        //根据sorttype 获取 tree menu
        getAllResourcesBySortType() {
            var {sortType} = this;
            var type = sortType.type;
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
        getAllByFilter(rss) {
            var {searchContent} = this;
            var filterRss = filter_tree(rss, 'name', searchContent);
            return filterRss;
        },
        getCurPageSource(src, curPage) {
            return slice(src, (curPage-1)*pageSize, pageSize * curPage);
        },
        onSearchDisable(){
            this.searchEnable=false;
            this.searchContent = "";
            this.currentList = this.getAllByFilter(this.resourceList);
            this.$f7.navbar.show(this.$$(".navbar"));
            this.$f7.searchbar.disable(this.$$(".upload-data-page .searchbar"));
            this.$$(".upload-data-page .searchbar")[0].style.top = '44px';
            this.$$(".upload-data-page .page-content")[0].style.paddingTop = '88px';
        },
        onSearchEnable(){
            this.searchEnable=true;
            this.$f7.navbar.hide(this.$$(".navbar"));
            this.$$(".upload-data-page .searchbar")[0].style.top = 0;
            this.$$(".upload-data-page .page-content")[0].style.paddingTop = '44px';
        },
    }
}
</script>
<style lang='scss' scoped>
.data-table-ope {
    line-height: 44px;
    color: #007aff;
}
.list {
  margin-top: 0;
  margin-bottom: 0;
  & > .list-group:first-child {
    .list-group-title {
      display: none;
    }
  }
}
.search-layer {
    position: absolute;
    z-index: 10;
    width: 100%;
    height: calc(100vh - 44px);
    background-color: rgba(0,0,0,0.5);
}
.page-content-list {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: #fff;
    .search-layer {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(0,0,0,0.5);
    }
}
.page-search-model {
    overflow: hidden;
    .search-layer {
        display: block;
    }
}
.searchbar {
    transition: top 200ms;
}
.my-data-search {
    background-color: #f2f2f5;
}
.my-data-search:after {
    display: none;
}
</style>
