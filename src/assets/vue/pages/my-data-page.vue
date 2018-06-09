<template>
    <f7-page navbar-through toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回"></f7-link>
            </f7-nav-left>
            <div class="title">我的数据</div>
        </f7-navbar>
        <f7-searchbar
            placeholder="搜索"
            :disable-button="false"
            :clear="true"
            @searchbar:clear="clearSearch"
            @input="onSearchInput"
        ></f7-searchbar>
        <div class="page-content-list">
            <!-- <div class="search-layer" v-if="searchpage"></div> -->
            <TreeMenu :data="currentList" @onItemClick="onSelectDataPg"></TreeMenu>
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
import userUtil from '../../js/utils/userUtil';
import fetchUtil from '../../js/utils/fetchUtil';
import queryUrl from '../../js/utils/queryUrl';
import bus from '../../js/utils/bus';

import {filter_tree, get_node, render_pid} from '../../js/utils/filter_util'
import {model_api_url, headers, paramFake} from '../../js/constants/ApiConfig';
import {geo_types, geoTypesMap, globalvals, market_level_5,
    source_customer, source_market, market_label_tip} from '../../js/constants/Constants';
import TreeMenu from "../components/upload/tree-menu.vue";
import PinYin from '../../js/utils/PinYin';
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
            currentCity: '上海',
            allResource: {},
            resourceList: [],
            currentList: [],
            directoryCfg: {},
            curPageAll: 1,
            countAll: 0,
            sortType: sortMenus[0],
            searchText: '',
            user: {},
            prePage: ''
        }
    },
    created(){
        let timer = setTimeout(()=>{
            clearTimeout(timer);
            this.prePage = this.$f7Route.context ? this.$f7Route.context.prePage : "";
            this.user = userUtil.get();
            this.fetchDirectoryConfig();
        }, 200);
    },
    components: {
        TreeMenu,
    },
    methods: {
        clearSearch(){
            this.searchText = "";
            this.currentList = this.getAllByFilter(this.resourceList);
        },
        onSearchInput(e){
            this.searchText = e.target.value;
            this.currentList = this.getAllByFilter(this.resourceList);
        },
        onSelectDataPg(vl){
            if(this.prePage === "MapDrawPanel"){
                bus.$emit("selectUploadData", vl);
                this.$f7Router.back();
            }
            else{
                this.$f7Router.navigate('/upload/', {context: {item: vl}});
            }
        },
        getResources() {
            let params = {use_customer: 'True'};
            fetchUtil(queryUrl(`${model_api_url}datamap/poi/v2/filters/level/4`, params))
            .then(resp => {
                let res = {
                    "customer": resp ? resp : {}
                }
                this.allResource = this.getAllRss(res);
                this.getCurResourcesBySortType();
            })
            .catch(err => {
                console.error(err);
            })
        },
        fetchDirectoryConfig() {
            var params = {};
            let id = this.user.id;

            fetchUtil(queryUrl(`${model_api_url}vault/directory/${directory_cfg}_${id}`, params))
                .then(resp => {
                    this.directoryCfg = resp.result && resp.result[0] && resp.result[0].extra || {};
                    render_pid(this.directoryCfg.dirs);
                    let dirs = cloneDeep(this.directoryCfg.dirs);
                    dirs.forEach((vl, dx, input) => {
                        input[dx].children = [];
                    })
                    this.resourceList = dirs;
                    this.currentList = dirs;
                    this.getResources();
                }).catch(err => {
                console.error(err);
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
            // this.resourceList = this.getAllByFilter(all);
            // var count = size(all);
            // var resources = this.getCurPageSource(all, curPageAll);
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
            var {searchText} = this;
            var filterRss = filter_tree(rss, 'name', searchText);
            return filterRss;
        },
        getCurPageSource(src, curPage) {
            return slice(src, (curPage-1)*pageSize, pageSize * curPage);
        },
    }
}
</script>
<style lang='scss' scoped>
.current-city {
  width: 100%;
  line-height: 28px;
  background-color: #f3f2f3;
  border: 0px solid #979797;
  box-shadow: 0 2px 4px rgb(155, 155, 155);
  font-family: PingFang SC;
  font-size: 11px;
  font-weight: bold;
  color: #555555;
  box-sizing: border-box;
  padding-left: 15px;
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
.page-content-list {
    width: 100%;
    height: 100%;
    position: relative;
    .search-layer {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(0,0,0,0.5);
    }
}
</style>
