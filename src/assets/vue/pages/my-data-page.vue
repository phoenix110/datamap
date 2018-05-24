<template>
    <f7-page navbar-through toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回"></f7-link>
            </f7-nav-left>
            <div class="title">我的数据</div>
            <!-- <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".md-searchbar-comp" icon-f7="search"></f7-link>
            </f7-nav-right> -->
        </f7-navbar>
        <!-- <f7-searchbar key="ws_searchbar"
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
        ></f7-searchbar> -->
        <f7-searchbar
            placeholder="搜索"
            :disable-button="false"
            :clear="true"
        ></f7-searchbar>
        <TreeMenu :data="resourceList"></TreeMenu>
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
let cityList = require('./../../js/constants/city')
import fetchUtil from '../../js/utils/fetchUtil';
import queryUrl from '../../js/utils/queryUrl';
import {filter_tree, get_node, render_pid} from '../../js/utils/filter_util'
import {model_api_url, headers, paramFake} from '../../js/constants/ApiConfig';
import {geo_types, geoTypesMap, globalvals, market_level_5,
    source_customer, source_market, market_label_tip} from '../../js/constants/Constants';
import TreeMenu from "../components/upload/tree-menu.vue";
const directory_cfg = 'directory_cfg';
const sortMenus = [
    {type: 'cus', title: '自定义分类'},
    {type: 'type', title: '按类型分类'},
    // {type: 'date', title: '按上传日期分类'},
    // {type: 'source', title: '按来源分类'},
]
const pageSize = 30;
export default {
    name: "city-choose",
    data(){
        return{
            contacts: cityList,
            currentCity: '上海',
            allResource: {},
            resourceList: [],
            directoryCfg: {},
            curPageAll: 1,
            countAll: 0,
            sortType: sortMenus[0],
            searchText: '',
        }
    },
    created(){
        this.getResources();
    },
    components: {
        TreeMenu,
    },
    methods: {
        onSearchDisable(){},
        clearSearch(){},
        onSearchInput(){},

        getResources() {
            let params = {use_customer: 'True', fake_user_id: 71, fake_app_id: 7};
            fetchUtil(queryUrl(`${model_api_url}datamap/poi/v2/filters/level/4`, params))
            .then(resp => {
                let res = {
                    "customer": resp ? resp : {}
                }
                this.allResource = this.getAllRss(res);
                this.dealAllResource();
            })
            .catch(err => {
                console.error(err);
            })
        },
        dealAllResource() {
            let all = this.getRssByGeoType();
            this.fetchDirectoryConfig();
        },
        fetchDirectoryConfig() {
            var params = {fake_user_id: 71, fake_app_id: 7};
            let id = 120;

            fetchUtil(queryUrl(`${model_api_url}vault/directory/${directory_cfg}_${id}`, params))
                .then(resp => {
                    this.directoryCfg = resp.result && resp.result[0] && resp.result[0].extra || {};
                    render_pid(this.directoryCfg.dirs);
                    this.getCurResourcesBySortType();
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
        getPoiNode(name, source=source_customer, packageId='') {
            let id = `${geo_types.point}_${name}_${source}_${packageId}`;
            return {id, name, source, packageId, geo_type: geo_types.point, iconSkin: 'tree_poi_icon', isParent: false};
        },
        getPolygonNode(name, source=source_customer, packageId='') {
            let id = `${geo_types.polygon}_${name}_${source}_${packageId}`;
            return {id, name, source, packageId, geo_type: geo_types.polygon, iconSkin: 'tree_polygon_icon', isParent: false};
        },
        getLineNode(name, source=source_customer, packageId='') {
            let id = `${geo_types.line}_${name}_${source}_${packageId}`;
            return {id, name, source, packageId, geo_type: geo_types.line, iconSkin: 'tree_polyline_icon', isParent: false};
        },
        getPlainNode(name, source=source_customer, packageId='') {
            let id = `${geo_types.plain}_${name}_${source}_${packageId}`;
            return {id, name, source, packageId, geo_type: geo_types.plain, iconSkin: 'tree_plain_icon', isParent: false};
        },
        getCurResourcesBySortType() {
            var {curPageAll} = this;
            var all = this.getAllResourcesBySortType();
            this.resourceList = this.getAllByFilter(all);
            console.log('this.resourceList', this.resourceList)
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
</style>
