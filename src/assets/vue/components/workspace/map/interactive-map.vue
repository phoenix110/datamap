<template>
    <div :class="isDetailPg ? 'interactive-map-detailpg' : 'interactive-map-style'">
        <div class="interactive-map-show" v-if="isDetailPg">
            <MapPanel 
                ref="interactive_map" 
                :mapData="cData" 
                @initMapOther="initMapOther" 
                :loaded="loaded"
            ></MapPanel>
            <div class="interactive-map-card" v-if="(currentClickBtn.length != 0) && mapCardFlag">
                <MapCardPanel 
                    :mapCardData="currentMapCardPanel" :filterIndex="filterIndex" :cardBtnWatch="cardBtnWatch"
                ></MapCardPanel>
            </div>
            <div class="interactive-map-card-btn">
                <div class="interactive-map-card-btn-content">
                    <div class="map-card-btn-group" v-for="(vl1, dx1) in mapCardList" :key="dx1">
                        <div :class="['map-card-btn', currentClickBtn===(dx1 + '_' + dx2) ? 'map-card-btn-select' : '']" 
                        v-for="(vl2, dx2) in vl1.filters" 
                        :key="dx2" 
                        @click="onClickCardBtn(vl1, dx1, dx2)">
                            <div :class="getCardIconClass(vl1, dx2)" :style="getCardIconStyle(vl1, dx2)"></div>
                        </div>
                    </div>
                </div>
            </div>
            <transition name="setting-circle-radius">
                <div class="interactive-map-circle-radius" v-if="circleRadiusPanel">
                    <div class="panel-close-btn" @click="onClickRadiusPanel('cancel')">
                        <i class="f7-icons">close</i>
                    </div>
                    <div class="panel-content-show" @click="openRadiusPicker">
                        <div class="content-text">距离选择</div>
                        <div class="content-value">{{distanceConvert(circleRadius)+' km'}}</div>
                    </div>
                    <div class="panel-ok-btn" @click="onClickRadiusPanel('ok')">
                        <i class="f7-icons">check</i>
                    </div>
                </div>
            </transition>
            <div class="interactive-map-filter-btn" v-if="funBtnControl">
                <f7-link :class="['map-filter-rail-btn', railShow ? 'rail-show' : '']" @click="onClickRailBtn" v-if="haveRail">
                    <div></div>
                </f7-link>
                <f7-link :class="['map-filter-draw-btn', drawing ? 'map-drawing' : '']"  @click="onClickDrawBtn">
                    <div></div>
                </f7-link>
                <f7-link class="map-location-btn" @click="onClickLocation">
                    <f7-preloader v-if="positionLoading"></f7-preloader>
                    <i v-else class="f7-icons position-icon">navigation_fill</i>
                </f7-link>
            </div>
            <f7-link 
                class="interactive-map-search-btn" 
                @click="onClickFilterQuery" 
                v-if="queryBtnFlag">
                <f7-preloader v-if="queryLoading" class="color-white"></f7-preloader>
                <span v-else>启动查询</span>
            </f7-link>
        </div>
        <div class="interactive-map-static-show" v-else>
            <div class="map-title">{{cData ? cData.config.title : ""}}</div>
            <div class="map-img">
                <div class="img-bg" :style="{'backgroundImage': staticBackgroundUrl}"></div>
                <f7-link @click.prevent.stop="mapStateSwitch" v-if="mapBtnFlag">{{mapBtnStatus ? '复原' : '撤销'}}</f7-link>
            </div>
        </div>
    </div>
</template>
<script>
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import get from 'lodash/get'
import find from 'lodash/find'
import size from 'lodash/size';
import indexOf from 'lodash/indexOf';
import cloneDeep from 'lodash/cloneDeep';
import coordtransform from 'coordtransform';
import domtoimage from '../../../../js/lib/dom2image/dom-to-image';
import html2canvas from 'html2canvas';
import uuidv1 from 'uuid/v1';
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import amapUtil from '../../../../js/utils/amapUtil';
import bus from '../../../../js/utils/bus'
import {setIconClass, setIconStyle} from '../../../../js/utils/getIcon';
import {model_api_url, headers, paramFake, static_map_url, fakeParamObj} from '../../../../js/constants/ApiConfig';
import {geoMapLocation} from '../../../../js/utils/amapUtil';
import {uploadFilePromise, cordovaDeviceType} from '../../upload_comp/util.js';
import {
    fence_select, self_select, dis_select, buffer_select, visualization_colors, poi_icons,
    MapVisualTypes, source_customer, source_market, PolygonSourceKey, PolygonPackageIdKey,
    custom_card_menu, packet_select, geo_types, h_type_date, h_type_number, h_type_text, radiusPickCols,
} from '../../../../js/constants/Constants'
import MapPanel from '../../commons/map-panel.vue';
import MapCardPanel from '../../commons/card-panel/map-card-panel.vue';
const normalOpt = {
    strokeColor: '#00968e', strokeOpacity: 1, strokeWeight: 1,
    fillColor: '#00968e', fillOpacity: 0, zIndex: 10
}
const activeOpt = {
    strokeColor: '#41D9FF', strokeOpacity: 1, strokeWeight: 3,
    fillColor: '#41D9FF', fillOpacity: 0, zIndex: 20
}
const bgNormalOpt = {...normalOpt, zIndex: 8};
const lineOpt = {
    ...normalOpt, strokeOpacity: 0.6, strokeWeight: 6,
}
const unusedCols = ['id', 'address', 'lng', 'lat', 'name'];
const fake_point = [122, 31];
const uploadType = "snapshot";
export default {
    name: "InteractiveMap",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            map: {},
            mapIns: {},
            drawpolygon: {},  //覆盖物集合
            mapState: '',
            columnTypes: {},
            massMarkers: {}, //点位
            heatMaps: {},  //热力
            polygonLayers: {}, //面数据
            lineLayers: {}, //线数据
            markValue: {},
            buffers: {}, //buffers geos
            buffersData: {},
            geo_filter: {},
            bgPolygonData: {},
            loaded: false,
            fetchDataFlag: false,
            getColumnTypesFlag: false,
            polygonLayer: [],
            circlesPolygon: [],   //pc端配置显示的距离选择区域集合


            //新版地理卡片
            active_layer_ids: {},
            railShow: false,
            haveRail: false,
            drawing: false,
            startDrawing: false,
            positionLoading: false,
            mapCardList: [],
            cardBtnWatch: '',
            currentClickBtn: "",
            currentMapCardPanel: {},
            filterIndex: 0,
            circleRadius: 1000,
            circleCenter: [],
            queryBtnFlag: false,  //查询按钮
            drawFilter: {},
            firstRenderMap: true, //是否是首次执行renderMap
            toastTop: {}, //    提示弹窗
            pickerValues: ['0', '公里', '100', '米'],
            circleRadiusPanel: false,
            mapBtnFlag: false,  //是否显示首页地图按钮
            mapBtnStatus: true, //地图按钮的状态
            mapCardFlag: true,
            staticBackgroundUrl: "",
            deviceType: "",
            queryLoading: false,
            geoFilterFlag: false,
            funBtnControl: false,
        }
    },
    watch: {
        cData: function(){
            let {cData} = this;
            this.getMapBtnStatus();
            if(!cData.is_static){
                this.funBtnControl = true;
            }
            if(!this.geoFilterFlag){
                this.init();
                this.getMapCardOptions();
            }
            if(cData.filter_img){
                this.getMapPng();
            }
            else{
                this.staticBackgroundUrl = cData && cData.thumb ? `url(${static_map_url+cData.thumb})` : 'url(./static/images/skeleton.png)';
            }
        }
    },
    components: {
        MapPanel,
        MapCardPanel,
    },
    created(){
        let {cData} = this;
        if(cData){
            this.init();
            this.getMapBtnStatus();
            this.getMapCardOptions();
            if(!cData.is_static){
                this.funBtnControl = true;
            }
            if(this.cData.filter_img){
                this.getMapPng();
            }
            else{
                this.staticBackgroundUrl = cData && cData.thumb ? `url(${static_map_url+cData.thumb})` : 'url(./static/images/skeleton.png)';
            }
        }
    },
    mounted(){
        this.isDetailPg && this.createPicker();
        localStorage.setItem("mdt_map_edit", JSON.stringify({edit: false}));
        bus.$on("interactiveMapFilterBack", (type) => {
            let {toastTop, cData} = this;
            if(size(toastTop) && !toastTop.destroyed){
                toastTop.close();
            }
            if(type === "back"){
                let item = `mdt_geo_filters_${cData.thumb}`;
                let local = localStorage.getItem(item);
                let mapEdit = localStorage.getItem("mdt_map_edit");
                mapEdit = JSON.parse(mapEdit);
                if(size(local) && mapEdit.edit){
                    localStorage.setItem("mdt_map_edit", JSON.stringify({edit: false}));
                    localStorage.removeItem(item);
                    bus.$emit("interactiveMapGetData");
                    this.mapBtnFlag = false;
                }
            }
            else if(type === "save"){
                bus.$emit("interactiveMapGetData");
            }
        });
        this.deviceType = cordovaDeviceType();
    },
    beforeDestroy(){
        bus.$off("interactiveMapFilterBack")
    },
    methods: {
        getState(key){
            return this[key];
        },
        init(){
            let {cards, buffer_filters, geo_filter} = this.cData.config, active_layer_ids = {};
            this.geo_filter = geo_filter || {};
            if(cards[0] && cards[0].geo_filters){
                if(cards[0].geo_filters.type === fence_select)
                    this.haveRail = true;
                this.mapState = cards[0].geo_filters.type;
                forEach(cards[0].geo_filters.filters, t => {
                    active_layer_ids[t.oid] = {
                        id: t.oid + "", object_type: t.pid, name: t.name,
                        source: t.source || source_customer, packageId: t.packageId || ''
                    }
                });
                this.active_layer_ids = active_layer_ids;
            };
            if(buffer_filters){
                this.mapState = buffer_select;
            }
            this.buffersData = cloneDeep(buffer_filters && buffer_filters.filters) || {};
        },
        initMapOther(mapView){
            // this.map = mapView;
            this.mapIns = mapView;
            if(this.cData){
                this.renderMap();
            }
        },
        renderMap(source) {
            let {cData: {config: {cards, geo_filter, supp_filters}}, startDrawing, mapIns, firstRenderMap} = this;
            let fence_geos = [], self_select_geos = [], dis_select_geos = [];
            forEach(cards, c => {
                if (c.geo_filters) {
                    if (c.geo_filters.type == self_select) {  //获取自定义区域选择
                        self_select_geos.push(c.geo_filters.geoJson)
                    } else if (c.geo_filters.type == dis_select) {   //获取自定义距离选择
                        dis_select_geos.push(c.geo_filters.circles)
                    } else if (c.geo_filters.type == fence_select) {   //获取自定义围栏选择
                        fence_geos.push(c)
                        if(!startDrawing)
                            this.railShow = true;
                    }
                }
                forEach(c.items, t => {
                    this['render_style_' + t.geometry_type] = size(t.filters);
                })
            })
            if (size(this.buffersData)) {
                this.addBufferGeos(this.buffersData);
                this.fetchData(source);
            }else {
                if (size(self_select_geos) && firstRenderMap) {
                    this.addSelfGeo(self_select_geos)
                }
                if (size(dis_select_geos) && firstRenderMap) {
                    this.addCircleGeo(dis_select_geos)
                }
                if (size(geo_filter) >= 2 && firstRenderMap) {
                    this.fetchFenceGeo(() => {
                        this.fetchData(source)
                    });
                } 
                else {
                    this.fetchData(source);
                }
            }
            this.getColumnTypes();
            if(firstRenderMap)
                this.firstRenderMap = false;
        },
        addBufferGeos(buffers){
            let all = [];
            forEach(buffers, (c, card_id) => {
                this.buffers[card_id] = this.buffers[card_id] || {};
                forEach(c, (b, filter_id) => {
                    let layers = [];
                    forEach(b, t => {
                        let layer = amapUtil.addPolygon({geometry: t}, activeOpt)
                        layers = layers.concat(layer);
                    })
                    this.buffers[card_id][filter_id] = layers;
                    this.mapIns.add(layers)
                    all = all.concat(layers);
                })
            })
            this.mapIns.setFitView(all);
            all.length = 0;
        },
        addSelfGeo(geos) {
            this.drawpolygon = this.drawpolygon || {}
            var layersAll = []
            forEach(geos, geo => {
                var layers = amapUtil.addPolygon({geometry: geo}, activeOpt)
                var uid = 'poly_' + uuidv1();
                forEach(layers, shape => {
                    shape.setExtData({uid});
                })
                this.mapIns.add(layers)
                this.drawpolygon[uid] = layers;
                layersAll = layersAll.concat(layers);
            })
            if (size(layersAll)) {
                this.mapIns.setFitView(layersAll);
            }
        },
        //添加circle图层
        addCircleGeo(geos) {
            this.drawpolygon = this.drawpolygon || {}
            var layers = []
            forEach(geos, geo => {
                forEach(geo, circle => {
                    var [lng, lat, dis] = circle
                    var ps = coordtransform.wgs84togcj02(lng, lat)
                    var layer = new AMap.Circle({radius: dis, center: ps, ...activeOpt})
                    var uid = 'poly_' + uuidv1();
                    layer.setExtData({uid});
                    layers.push(layer)
                    this.drawpolygon[uid] = layer;
                })
            })
            this.mapIns.add(layers)
            this.circlesPolygon = layers;
            if (size(layers)) {
                this.mapIns.setFitView(layers);
            }
        },
        fetchData(source) {
            var {cards} = this.cData.config;
            let active_layer_ids = this.active_layer_ids;
            let bgdt = {};
            var pss = [], pssMap = {}, buffer_geo = null;
            if (size(this.buffersData)) {
                var cds = []
                forEach(this.buffersData, (c, card_id) => {
                    forEach(c, (b, filter_id) => {
                        cds = cds.concat(map(b, geo => geo.coordinates))
                    })
                })
                var geoJson = amapUtil.wrapMultiPolygon(cds)
                buffer_geo = amapUtil.geoJsonToEwkb(geoJson);
            }
            forEach(cards, card => {
                var {geo_filters, uid} = card
                var geo_filter
                if (buffer_geo) {
                    geo_filter = {geometry: buffer_geo};
                } else if (geo_filters) {
                    if (geo_filters.type === fence_select) { //如果未选择，查询全部
                        if (size(active_layer_ids)) {
                            let {source, packageId, object_type} = geo_filters;
                            source = source || source_customer;
                            packageId = packageId || '';
                            let isMarket = source === source_market;
                            let keyword = isMarket ? 'markets' : 'customers';
                            let ids = map(active_layer_ids, t => t.id);
                            if (active_layer_ids["0"]) { //如果全部
                                let bgdata = bgdt[source] && bgdt[source][packageId] && bgdt[source][packageId][object_type]
                                ids = map(bgdata, t => t.id);
                                isMarket && (ids = [{package_id: packageId, ids: ids}]);
                            } else if(isMarket){
                                ids = [{package_id: packageId, ids: ids}];
                            }
                            geo_filter = {[keyword]: ids};
                        }
                    } else if (geo_filters.type === self_select) {
                        geo_filter = {geometry: amapUtil.geoJsonToEwkb(geo_filters.geoJson)}
                    } else if (geo_filters.type === dis_select) {
                        geo_filter = {circles: geo_filters.circles}
                    }
                }
                forEach(card.items, item => {
                    item = item || {}
                    var {object_type, geometry_type, source, packageId} = item;
                    forEach(item.filters, filter => {
                        var flts = map(filter.filters, r => {
                            if (r.h_type === h_type_text) {
                                return [r.key, r.h_type, r.list]
                            } else if (r.h_type === h_type_number) {
                                var {min, max} = r
                                return [r.key, r.h_type, [min === undefined ? null : min, max === undefined ? null : max]]
                            } else if (r.h_type === h_type_date) {
                                var {start, end, fast_type, end_is_today} = r
                                return [r.key, r.h_type, {start, end: end_is_today ? undefined : end, fast_type, end_is_today}]
                            }
                        })
                        var params = {object_type, geo_type: geometry_type,}
                        if (source === source_market) {
                            params.object_type = packageId || 0;
                        }
                        if (geo_filter) params = {...params, ...geo_filter}
                        if (size(flts)) params.filters = flts
                        pss.push(this.fetchDataPromise(params, source));
                        pssMap[pss.length - 1] = {card, item, filter};
                    })
                })
            })
            Promise.all(pss)
                .then(resp => {
                    if(this.getColumnTypesFlag){
                        this.loaded = true;
                    }
                    this.fetchDataFlag = true;
                    forEach(resp, (r, idx) => {
                        let [dataSet, points] = this.dealDataSet(r, pssMap[idx].item.geometry_type);
                        pssMap[idx].filter.data = dataSet;
                        this.addDataToMap(dataSet, pssMap[idx].card, pssMap[idx].item, pssMap[idx].filter);
                    });
                    bus.$emit('mapFetchData');
                    if(source === "query"){
                        localStorage.setItem("mdt_map_edit", JSON.stringify({edit: true}));
                        let timer = setTimeout(()=>{
                            this.saveFilters();
                            clearTimeout(timer);
                        }, 1000);
                    }
                })
                .catch(err => {
                    console.error(err);
                    if(this.getColumnTypesFlag){
                        this.loaded = true;
                    }
                    this.fetchDataFlag = true;
                    this.queryLoading = false;
                })
        },
        fetchFenceGeo(callback) {
            var {geo_filter, cards} = this.cData.config;
            var {object_type, geometry_type, filters, source, packageId} = geo_filter;
            source = source || source_customer;
            packageId = packageId || ''
            this.fetchCustomerDataPromise(geo_filter)
                .then(resp => {
                    if (resp) {
                        var bgPolygonData = this.bgPolygonData;
                        var data = resp;
                        forEach(data, t => {
                            t.object_type = object_type;
                            t[PolygonSourceKey] = source;
                            t[PolygonPackageIdKey] = packageId;
                        })
                        if (!filters) {
                            geo_filter.filters = [{
                                uid: 'filter_' + uuidv1(),
                                style: {
                                    ...this.getRenderStyle(geometry_type),
                                    color: normalOpt.fillColor, fillOpacity: normalOpt.fillOpacity
                                },
                                data,
                            }]
                        } else {
                            geo_filter.filters[0].data = data;
                        }
                        bgPolygonData[source] = bgPolygonData[source] || {}
                        bgPolygonData[source][packageId] = bgPolygonData[source][packageId] || {}
                        bgPolygonData[source][packageId][object_type] = data;
                        if (this.mapState === fence_select) {
                            this.addBgPolygon(source, packageId, object_type, data)
                        }
                        this.bgPolygonData = bgPolygonData;
                        callback && callback();
                    } else {
                        callback && callback();
                    }
                }).catch(err => {
                console.error(err);
                callback && callback();
            });
        },
        getColumnTypes() {
            var {supp_filters, geo_filter} = this.cData.config;
            var pss = [];
            forEach(supp_filters, supp => {
                pss.push(this.fetchDataColumnTypePromise(supp))
            })
            if (size(geo_filter)) {
                pss.push(this.fetchDataColumnTypePromise(geo_filter))
            }
            Promise.all(pss).then(infos => {
                if(this.fetchDataFlag){
                    this.loaded = true;
                }
                this.getColumnTypesFlag = true;
                //////////
                var columnTypes = this.columnTypes;
                forEach(infos, (rs, idx) => {
                    if (!rs || !rs.resp) return true;
                    var {args: {object_type, geometry_type, source, packageId}} = rs;
                    var {columns, types} = rs.resp;
                    columnTypes[source] = columnTypes[source] || {};
                    columnTypes[source][packageId] = columnTypes[source][packageId] || {};
                    columnTypes[source][packageId][geometry_type] = columnTypes[source][packageId][geometry_type] || {};
                    columnTypes[source][packageId][geometry_type][object_type] = [];
                    forEach(columns, (col, index) => {
                        if (indexOf(unusedCols, col) == -1) {
                            let db = types[index], h_type = ''
                            if (db === 'int' || db === 'float') {
                                h_type = h_type_number
                            } else if (db === 'str') {
                                h_type = h_type_text
                            } else {
                                h_type = db
                            }
                            columnTypes[source][packageId][geometry_type][object_type].push({
                                h_value: col,
                                h_type,
                                db,
                                key: col
                            })
                        }
                    })
                })
                this.columnTypes = columnTypes;
            }).catch(err => {
                console.error(err);
                if(this.fetchDataFlag){
                    this.loaded = true;
                }
                this.getColumnTypesFlag = true;
            })
        },
        fetchCustomerDataPromise({object_type, geometry_type, source, packageId}) {
            var params = {
                ...fakeParamObj,
                geo_type: geometry_type,
                check_geometry: false,
            }
            let postdata = JSON.stringify({object_types: [object_type]})
            return new Promise((resolve, reject) => {
                var ps = source !== source_market ?
                    fetchUtil(queryUrl(`${model_api_url}upload/query`, params), {method: 'POST', body: postdata, headers})
                    : fetchUtil(queryUrl(`${model_api_url}data/market/geometry/${packageId}`));
                return ps.then(resp => {
                    if (resp && resp.result) {
                        resolve && resolve(resp.result)
                    } else {
                        resolve && resolve()
                    }
                }).catch(err => {
                    console.error(err)
                    resolve && resolve()
                })
            })
        },
        fetchDataColumnTypePromise(args) {
            return new Promise((resolve) => {
                return this.fetchDataColumnType(args, (resp) => {
                    resolve && resolve({args, resp});
                }, () => {
                    resolve && resolve();
                })
            });
        },
        fetchDataColumnType({object_type, geometry_type, source, packageId}, succ, fail) {
            source = source || source_customer;
            var params = {
                ...fakeParamObj,
                geometry_type: geometry_type,
                offset: 0,
                limit: 0,
            }
            if (source === source_market) {
                object_type = packageId || 0;
            }
            if (!object_type) {
                fail && fail(1)
                return;
            }
            fetchUtil(queryUrl(`${model_api_url}graph/sample/${source}/${encodeURIComponent(object_type)}`, params))
                .then((resp) => {
                    if (resp && !resp.Status) {
                        succ && succ(resp);
                    } else {
                        fail && fail(1, resp);
                    }
                }).catch(err => {
                console.error(err);
                fail && fail(2, err);
            })
        },
        getRenderStyle(geometry_type) {
            this['render_style_' + geometry_type] = this['render_style_' + geometry_type] || 0;
            let len = this['render_style_' + geometry_type];
            this['render_style_' + geometry_type]++;
            switch (geometry_type) {
                case geo_types.point:
                    return {
                        color: visualization_colors[len] || visualization_colors[0],
                        icon: poi_icons[0],
                    }
                case geo_types.polygon:
                    return {
                        color: visualization_colors[len] || visualization_colors[0],
                        strokeStyle: 'solid',
                        strokeDasharray: [0, 0, 0, 0],
                        strokeWeight: 1,
                        strokeOpacity: 1,
                        fillOpacity: 0.5,
                    }
                case geo_types.line:
                    return {
                        color: visualization_colors[len] || visualization_colors[0],
                        strokeStyle: 'solid',
                        strokeDasharray: [0, 0, 0, 0],
                        strokeWeight: 6,
                    }
            }
        },
        addBgPolygon(source, packageId, object_type, data) {
            var active_layer_ids = this.active_layer_ids;
            var {geo_filter: {filters}} = this.cData.config;
            var layers = []
            var filter = filters && filters[0] || {};
            var {cur_visual, hidden, style: robj} = filter;
            var visual_cfg = null
            var {type, col, title} = cur_visual || {};
            visual_cfg = filter["config_" + type] || {};
            visual_cfg = visual_cfg[col]
            var opt = {...bgNormalOpt};
            if (robj) {
                opt = {
                    ...bgNormalOpt,
                    ...robj,
                    strokeColor: robj.color,
                    fillColor: robj.color,
                }
            }
            forEach(data, t => {
                var {id} = t;
                let layer = amapUtil.addPolygon(t, opt)
                var val = visual_cfg ? get(t, visual_cfg.deps) : '';
                forEach(layer, (polygon) => {
                    amapUtil.setOnePolygonByVal(polygon, val, opt, robj, visual_cfg)
                    if (hidden) {
                        polygon.hide();
                    }
                    var extData = polygon.getExtData() || {};
                    var {fillColor, strokeColor, fillOpacity, strokeWeight, strokeStyle, strokeDasharray} = polygon.getOptions();
                    extData.lastOpt = {fillColor, strokeColor, fillOpacity, strokeWeight, strokeStyle, strokeDasharray};
                    polygon.setExtData(extData);
                    this.dealPolygonAct(polygon)
                    if (active_layer_ids[0] || active_layer_ids[id]) {
                        polygon.setOptions(activeOpt)
                    }
                })

                layers = layers.concat(layer)
            })
            var mapIns = this.mapIns;
            if (size(layers)) {
                mapIns && mapIns.add(layers)
            }
            this.polygonLayer = [];
            this.polygonLayer = layers;
        },
        dealPolygonAct(polygon) {
            // polygon点击
            polygon.on('click', this.onClickPolygon)
        },
        onClickPolygon(e){
            var polygon = e.target
            let extData = polygon.getExtData() || {}
            let {object_type, id, name, [PolygonSourceKey]: source, [PolygonPackageIdKey]: packageId, lastOpt} = extData
            let {active_layer_ids, bgPolygonData} = this;
            // let {bgPolygonData} = this, active_layer_ids = {};
            var bgData = bgPolygonData[source] && bgPolygonData[source][packageId] && bgPolygonData[source][packageId][object_type]
            if (active_layer_ids[0]) { //全选;
                delete active_layer_ids[0];
                forEach(bgData, t => {
                    active_layer_ids[t.id] = {id: t.id + '', object_type, name: t.name, source, packageId}
                })
                delete active_layer_ids[id];
                polygon.setOptions(lastOpt)
            } else {
                if (active_layer_ids[id]) {
                    polygon.setOptions(lastOpt)
                    delete active_layer_ids[id]
                } else {
                    polygon.setOptions(activeOpt)
                    active_layer_ids[id] = {id: id + '', object_type, name: name, source, packageId}
                    var allSelect = true;
                    var fence_data = bgData;
                    forEach(fence_data, t => {
                        if (!active_layer_ids[t.id] && t.id) {
                            allSelect = false;
                            return false;
                        }
                    })
                    if (allSelect) {
                        active_layer_ids = {0: {id: 0, name: `全部 ( ${object_type} )`, object_type, source, packageId}}
                    }
                }
            }
            var {cards} = this.cData.config;
            if(size(active_layer_ids)){
                this.queryBtnFlag = true;
                if(size(this.toastTop) && !this.toastTop.destroyed){
                    this.toastTop.close();
                }
            }
            else{
                this.queryBtnFlag = false;
                if(size(this.toastTop) && this.toastTop.destroyed){
                    this.createToast("开始选择围栏");
                }
            }
            this.updateCardsGeoFilters(cards, active_layer_ids, object_type, source, packageId);
        },
        updateCardsGeoFilters(cards, active_layer_ids, object_type, source, packageId) {
            let geo_filters = {
                type: fence_select,
                object_type, source, packageId,
                filters: map(active_layer_ids, t => {
                    var sid = `${t.object_type}_${t.id}`;
                    return {id: sid, pid: t.object_type, oid: t.id, name: t.name, source, packageId}
                }),
            };
            this.geoFilterFlag = true;
            this.cData.config.cards[0].geo_filters = geo_filters;
        },
        fetchDataPromise(data, source) {
            source = source || source_customer;
            var params = {
                ...fakeParamObj
            }
            var postdata = JSON.stringify(data)
            return new Promise((resolve, reject) => {
                return fetchUtil(queryUrl(`${model_api_url}datamap/poi/v2/${source}/query`, params), {
                    method: 'POST',
                    body: postdata,
                    headers
                }).then(resp => {
                    if (resp && !resp.Status) {
                        resolve && resolve(resp.result)
                    } else {
                        resolve && resolve()
                    }
                }).catch(err => {
                    console.error(err)
                    resolve && resolve()
                })
            })
        },
        dealDataSet(rslt, geo_type) {
            let dataSet = [], points = [];
            if (geo_type == geo_types.point) {
                forEach(rslt, poi => {
                    var point = poi.geometry && poi.geometry.coordinates || []
                    let ps = coordtransform.wgs84togcj02(point[0], point[1])
                    ps[0] = ps[0] || fake_point[0]
                    ps[1] = ps[1] || fake_point[1]
                    points.push(ps);
                    dataSet.push({lnglat: `${ps[0]},${ps[1]}`, ...poi})
                })
            } else {
                dataSet = rslt || [];
            }
            return [dataSet, points];
        },
        addDataToMap(dataSet, card, item, filter) {
            var {geometry_type} = item;
            switch (geometry_type) {
                case geo_types.point:
                    this.addPoiToMapExt(dataSet, card, item, filter);
                    break;
                case geo_types.polygon:
                    this.addPolygonToMapExt(dataSet, card, item, filter);
                    break;
                case geo_types.line:
                    this.addLineToMapExt(dataSet, card, item, filter);
                    break;
            }
            this.mapIns && this.mapIns.setFitView();
            this.generateMarkCols();        
        },
        addPoiToMapExt(dataSet, card, item, filter) {
            if (!size(this.mapIns)) return;
            this.removeLayerOrHeatMap(card.uid, filter.uid);
            var {cur_visual, hidden} = filter || {}
            if (hidden) {
                return;
            }
            var visual_cfg = null
            var {type, col, title} = cur_visual || {};
            visual_cfg = filter["config_" + type];
            visual_cfg = visual_cfg || {};
            visual_cfg = visual_cfg[col]
            if (!type || type == 1 || type == 2) {
                var option = amapUtil.getVisualMapOption(filter.style)
                if (size(this.layers) || size(this.drawpolygon)) {
                    option.fitView = false;
                }
                this.massMarkers[card.uid] = this.massMarkers[card.uid] || {};
                this.massMarkers[card.uid][filter.uid] = amapUtil.createVisualMap(this.mapIns, dataSet, visual_cfg, option)
            } else if (type == 3 || type == 4 || type == 5) {
                this.heatMaps[card.uid] = this.heatMaps[card.uid] || {};
                this.heatMaps[card.uid][filter.uid] = amapUtil.createHeatMap(this.mapIns, dataSet, visual_cfg, col);
            }
        },
        addPolygonToMapExt(dataSet, card, item, filter) {
            if (!size(this.mapIns)) return;
            this.removeDataOnMapFilter(card.uid, filter.uid);
            var {cur_visual, hidden, style: robj} = filter || {}
            var visual_cfg = null
            var {type, col, title} = cur_visual || {};
            visual_cfg = filter["config_" + type];
            visual_cfg = visual_cfg || {};
            visual_cfg = visual_cfg[col]
            var {color} = robj || {};
            var layersMap = {}, layers = [];
            forEach(dataSet, d => {
                var {id} = d;
                var layer = amapUtil.addPolygon(d, {
                    ...normalOpt,
                    ...robj,
                    strokeColor: color,
                    fillColor: color,
                });
                var val = visual_cfg ? get(d, visual_cfg.deps) : '';
                forEach(layer, polygon => {
                    amapUtil.setOnePolygonByVal(polygon, val, normalOpt, robj, visual_cfg)
                    if (hidden) {
                        polygon.hide();
                    }
                })
                layersMap[id] = layer;
                layers = layers.concat(layer);
            })
            this.mapIns.add(layers);
            this.polygonLayers[card.uid] = this.polygonLayers[card.uid] || {}
            this.polygonLayers[card.uid][filter.uid] = layersMap;
        },
        addLineToMapExt(dataSet, card, item, filter) {
            if (!size(this.mapIns)) return;
            var {cur_visual, hidden, style: robj} = filter || {}
            var visual_cfg = null
            var {type, col, title} = cur_visual || {};
            visual_cfg = filter["config_" + type];
            visual_cfg = visual_cfg || {};
            visual_cfg = visual_cfg[col]
            var {color} = robj || {};
            var layersMap = {}, layers = [];
            forEach(dataSet, d => {
                var {id} = d;
                var layer = amapUtil.addPolyline(d, {
                    ...lineOpt,
                    ...robj,
                    strokeColor: color,
                    fillColor: color,
                });
                var val = visual_cfg ? get(d, visual_cfg.deps) : '';
                forEach(layer, polygon => {
                    amapUtil.setOnePolygonByVal(polygon, val, lineOpt, robj, visual_cfg)
                    if (hidden) {
                        polygon.hide();
                    }
                })
                layersMap[id] = layer;
                layers = layers.concat(layer);
            })
            this.mapIns.add(layers);
            this.lineLayers[card.uid] = this.lineLayers[card.uid] || {}
            this.lineLayers[card.uid][filter.uid] = layersMap;
        },
        removeLayerOrHeatMap(card_id, filter_id) {
            var massMarks = this.massMarkers[card_id] && this.massMarkers[card_id][filter_id]
            if (massMarks) {
                this.removeLayer(massMarks)
                this.massMarkers[card_id][filter_id] = null
            }
            var heatMap = this.heatMaps[card_id] && this.heatMaps[card_id][filter_id]
            if (heatMap) {
                if (this.heatMaps[card_id][filter_id].destroy) {
                    this.heatMaps[card_id][filter_id].destroy();
                }
                this.mapIns && this.mapIns.remove(this.heatMaps[card_id][filter_id]);
                this.heatMaps[card_id][filter_id] = null;
            }
        },
        removeLayer(layer) {
            layer && layer.destroy()
            layer = null
        },
        removeDataOnMapFilter(card_id, filter_id) {
            if (this.massMarkers[card_id]) {
                this.removeLayer(this.massMarkers[card_id][filter_id])
                delete this.massMarkers[card_id][filter_id]
            }
            if (this.heatMaps[card_id]) {
                this.removeLayerOrHeatMap(card_id, filter_id)
                delete this.heatMaps[card_id][filter_id]
            }
            if (this.polygonLayers[card_id]) {
                var layersMap = this.polygonLayers[card_id][filter_id];
                var layers = [];
                forEach(layersMap, t => {
                    t && (layers = layers.concat(t));
                })
                this.mapIns && layers && this.mapIns.remove(layers);
                delete this.polygonLayers[card_id][filter_id]
            }
            if (this.lineLayers[card_id]) {
                var layersMap = this.lineLayers[card_id][filter_id];
                var lines = [];
                forEach(layersMap, t => {
                    t && (lines = lines.concat(t));
                })
                this.mapIns && lines && this.mapIns.remove(lines);
                delete this.lineLayers[card_id][filter_id]
            }
        },
        findCardAndFilter(cards, card_id, filter_id) {
            var card = find(cards, c => c.uid == card_id) || {}
            var fdFilter = {};
            var fdItem = find(card.items, t => {
                var tmp = t && find(t.filters, f => f.uid == filter_id);
                if (tmp) {
                    fdFilter = tmp;
                    return true;
                } else {
                    return false;
                }
            }) || {}
            return [card, fdItem, fdFilter]
        },
        onMassClick(e, card_id, filter_id) {
            var data = e.originalData.rawData;
            var pos = e.originalData.target.getPosition();
            var {cards} = this.state
            var [card, fdItem, fdFilter] = this.findCardAndFilter(cards, card_id, filter_id)
            this.hideInfoWindow();
            this.createInfoWindow(fdFilter, pos, data);
        },
        generateMarkCols() {
            var map = this.mapIns;
            let {cards} = this.cData.config;
            this.markerData = [];
            forEach(this.markValue, (c, card_id) => {
                forEach(c, (f, filter_id) => {
                    map.remove(this.markValue[card_id][filter_id]);
                    delete this.markValue[card_id][filter_id];
                })
            })
            forEach(cards, (c, i) => {
                forEach(c.items, (item, j) => {
                    forEach(item.filters, (f, k) => {
                        !f.hidden && f.show_col && f.data && this.addMarkValToMap(c.uid, f.uid, f.data, f.show_col);
                    })
                })
            })
            forEach(this.geo_filter.filters, (f, k) => {
                !f.hidden && f.show_col && f.data && this.addMarkValToMap('geo_filter', f.uid, f.data, f.show_col);
            })
        },
        hideInfoWindow() {
            var map = this.mapIns;
            this.infoWindow && map && map.remove(this.infoWindow);
        },
        createInfoWindow(fdFilter, pos, data) {
            if (size(fdFilter.info_cfg)) {
                var map = this.mapIns;
                var content = document.createElement('div');
                content.className = 'info_window_wrap'
                var close = document.createElement('div');
                close.className = 'info_window_close'
                close.onclick = this.hideInfoWindow;
                var closeSpan = document.createElement('i');
                closeSpan.className = 'material-icons'
                closeSpan.innerText = 'close';
                close.appendChild(closeSpan);
                content.appendChild(close);
                var inner = document.createElement('div');
                inner.className = 'info_window_inner'
                forEach(fdFilter.info_cfg, t => {
                    var valKey = '';
                    if (t.key == 'name' || t.key == 'address') {
                        valKey = t.key;
                    } else {
                        valKey = `extra.${t.key}`;
                    }
                    var val = get(data, valKey) || '-';
                    var tit = document.createElement('div');
                    tit.className = 'info_window_label';
                    tit.innerText = t.h_value;
                    inner.appendChild(tit);
                    var cont = document.createElement('div');
                    cont.className = 'info_window_content';
                    cont.innerText = val;
                    inner.appendChild(cont);
                })
                content.appendChild(inner);
                var trig = document.createElement('span');
                trig.className = 'info_window_triggle'
                content.appendChild(trig)
                var marker = new AMap.Marker({
                    map: map,
                    position: pos,
                    content: content,
                })
                this.infoWindow = marker;
            }
        },
        addMarkValToMap(card_id, filter_id, dataSet, col) {
            this.markValue[card_id] = this.markValue[card_id] || {};
            this.markValue[card_id][filter_id] = []
            var pois = this.markerData || [];
            forEach(dataSet, data => {
                var valKey = '';
                if (col == 'name' || col == 'address') {
                    valKey = col;
                } else {
                    valKey = `extra.${col}`;
                }
                var val = get(data, valKey);
                if (!val) return;
                if (val * 1 === val * 1) {
                    val = parseFloat(val);
                    if (Math.abs(val) > 1) {
                        val = trimFloatZero(val);
                    } else {
                        val = val.toPrecision(2);
                    }
                }
                let valContent = document.createElement('div');
                valContent.className = 'card-tip';
                valContent.title = `${val}`;
                valContent.innerHTML = '';
                valContent.innerHTML = `${val}`;

                let lnglat = this.getCenterLngLat(data);
                if (!lnglat) return;
                let lng = lnglat[0];
                let lat = lnglat[1];
                let pos = coordtransform.wgs84togcj02(lng, lat);
                if (!this.checkDisPoints(pois, pos)) {
                    pois.push(pos);
                    var marker = new AMap.Marker({
                        map: this.mapIns,
                        position: pos,
                        content: valContent,
                        offSet: new AMap.Pixel(0, 0),
                        zIndex: 100
                    })
                    this.markValue[card_id][filter_id].push(marker);
                }
            })
            this.markerData = pois;
        },
        getCenterLngLat(data) {
            if (data.geometry.type == "Point") {
                return data.geometry.coordinates;
            }
            if (data.geometry.type == "Polygon") {
                var points = data.geometry.coordinates[0];
                var lngTat = 0, latTat = 0;
                forEach(points, p => {
                    lngTat = lngTat + p[0];
                    latTat = latTat + p[1];
                })
                return [lngTat / points.length, latTat / points.length];
            }
            if (data.geometry.type == "MultiPolygon") {
                var points = data.geometry.coordinates[0][0];
                var lngTat = 0, latTat = 0;
                forEach(points, p => {
                    lngTat = lngTat + p[0];
                    latTat = latTat + p[1];
                })
                return [lngTat / points.length, latTat / points.length];
            }
            if (data.geometry.type == "LineString") {
                var len = data.geometry.coordinates.length;
                return data.geometry.coordinates[Math.floor((len - 1) / 2)];
            }
            if (data.geometry.type == "MultiLineString") {
                var len = data.geometry.coordinates[0].length;
                return data.geometry.coordinates[0][Math.floor((len - 1) / 2)];
            }
        },
        //是否有交叉，有则返回true
        checkDisPoints(points, point) {
            var found = false;
            forEach(points, p => {
                if (this.checkDis(p, point)) {
                    found = true;
                    return false;
                }
            })
            return found;
        },
        //是否有交叉，有则返回true
        checkDis(p1, p2) {
            var map = this.mapIns;
            if (!map) return true;
            var zoom = map.getZoom();
            var pix1 = map.lnglatToPixel(p1, zoom);
            var pix2 = map.lnglatToPixel(p2, zoom);
            var disX = pix1.getX() - pix2.getX()
            var disY = pix1.getY() - pix2.getY()
            return Math.abs(disX) < 100 && Math.abs(disY) < 20
        },



        //新改版部分
        onClickRailBtn(){
            let {railShow, mapIns, polygonLayer, circleRail, centerMark, btnMark, toastTop} = this;
            this.railShow = !railShow;
            if(this.railShow){
                if(size(toastTop) && !toastTop.destroyed){
                    toastTop.close();
                }
                mapIns.add(polygonLayer);
                this.drawing = false;
                this.startDrawing = false;
                size(btnMark) && mapIns.remove(btnMark);
                size(circleRail) && mapIns.remove(circleRail);
                size(centerMark) && mapIns.remove(centerMark);
                this.mapRemoveEvent("click");
                this.createToast("开始选择围栏");
            }
            else{
                mapIns.remove(polygonLayer);
                if(size(toastTop) && !toastTop.destroyed){
                    toastTop.close();
                }
            }
            this.queryBtnFlag = false;
        },
        onClickDrawBtn(){
            let {drawing, startDrawing, mapIns, polygonLayer, circlesPolygon} = this;
            this.drawing = !drawing;
            this.queryBtnFlag = false;
            if(this.drawing){
                this.createToast("点击地图开始绘制");
                this.mapAddEvent("click");
                this.railShow = false;
                this.startDrawing = false;
                size(circlesPolygon) && mapIns.remove(circlesPolygon);
                mapIns.remove(polygonLayer);
            }
            else{
                if(startDrawing)
                    this.clearDrawMark();
                else
                    size(this.toastTop) && this.toastTop.close();
                this.mapRemoveEvent("click");
            }
        },
        onClickLocation(){
            geoMapLocation(this);
        },
        getMapCardOptions(){
            let {cards, geo_filter, supp_filters} = this.cData.config, mapCardList = [];
            cards.map(vl1 => {
                mapCardList = mapCardList.concat(vl1.items);
            })
            this.mapCardList = mapCardList;
        },
        onClickCardBtn(value, index1, index2){
            let currentMapCardPanel;
            currentMapCardPanel = value;
            this.mapCardFlag = true;
            this.filterIndex = index2;
            this.currentClickBtn = index1 + '_' + index2;
            this.currentMapCardPanel = currentMapCardPanel;
            this.cardBtnWatch = new Date();
        },
        getCardIconClass(vl1, dx2){
            return setIconClass(vl1, dx2);
        },
        getCardIconStyle(vl1, dx2){
            return setIconStyle(vl1, dx2);
        },
        addMarkToMap(type){
            let {circleRail, centerMark, btnMark, mapIns, circleCenter, circleRadius, btnMarklnglat} = this;
            if(type === "polygon"){
                if(size(circleRail)){
                    mapIns.remove(circleRail);
                }
                circleRail = new AMap.Circle({
                    center: circleCenter,
                    radius: circleRadius,
                    strokeColor: "#007AFF", //线颜色
                    strokeOpacity: 0.9, //线透明度
                    strokeWeight: 2,    //线宽
                    fillOpacity: 0//填充透明度
                });
                mapIns.add(circleRail);
                this.circleRail = circleRail;
            }
            else if(type === "centerMark"){
                if(size(centerMark)){
                    mapIns.remove(centerMark);
                }
                centerMark = new AMap.Marker({
                    position: circleCenter,
                    offset: new AMap.Pixel(-15, -36),
                    icon: "./static/images/icon_search_fixed_small.svg",
                });
                mapIns.add(centerMark);
                this.centerMark = centerMark;
            }
            else if(type === "btnMark"){
                if(size(btnMark)){
                    mapIns.remove(btnMark);
                }
                btnMark = new AMap.Marker({
                    position: btnMarklnglat,
                    draggable: true,
                    offset: new AMap.Pixel(-14, -10),
                    icon: "./static/images/icon_workspace/icon_move_btn.svg",
                });
                btnMark.on('dragging', (e) => {
                    let location = e.target.getPosition();
                    this.circleRadius = this.circleCenter.distance(location);
                    this.setDrawCircleFilters();
                })
                mapIns.add(btnMark);
                this.btnMark = btnMark;
            }
        },
        mapAddEvent(eventName){
            let {mapIns, btnMark} = this;
            size(mapIns) && mapIns.on(eventName, (e) => {
                this.circleCenter = new AMap.LngLat(e.lnglat.lng, e.lnglat.lat);
                this.btnMarklnglat = this.circleCenter.offset(707.1, -707.1);
                this.startDrawing = true;
                this.circleRadiusPanel = true;
                if(size(this.toastTop) && !this.toastTop.destroyed)
                    this.toastTop.close();
                this.circleRadius = 1000;
                this.addMarkToMap('polygon');
                this.addMarkToMap('centerMark');
                this.addMarkToMap('btnMark');
                this.setDrawCircleFilters();
                mapIns.setFitView(this.circleRail);
            })
        },
        mapRemoveEvent(eventName){
            let {mapIns} = this;
            size(mapIns) && mapIns.off(eventName, (e) => {
                this.btnMark = false;
            })
        },
        clearDrawMark(){
            let {circleRail, centerMark, btnMark, mapIns, startDrawing} = this;
            mapIns.remove(circleRail);
            mapIns.remove(centerMark);
            mapIns.remove(btnMark);
            this.startDrawing = false;
        },
        createToast(text){
            this.toastTop = this.$f7.toast.create({
                text: text,
                position: 'top',
                cssClass: "map-card-toast",
                destroyOnClose: true,
            });
            this.toastTop.open();
        },
        createPicker(){
            let {testCancel} = this;
            this.pickerRadius = this.$f7.picker.create({
                inputEl: '<input />',
                rotateEffect: true,
                renderToolbar: function(){
                    return `<div class="toolbar"><div class="toolbar-inner"><div class="left"><a href="#" class="link sheet-close radiusPickerCancel" click=${testCancel}>取消</a></div><div class="right"><a href="#" class="link sheet-close popover-close radiusPickerOk">确定</a></div></div></div>`;
                },
                cols: radiusPickCols,
                on: {
                    change: (picker, value, displayValue) => {
                        this.pickerValues = value;
                    },
                }
            });
        },
        setDrawCircleFilters(){
            let {circleCenter, circleRadius} = this;
            let ps = coordtransform.gcj02towgs84(circleCenter.lng, circleCenter.lat);
            let circles = [];
            circles.push([...ps, circleRadius])
            this.addMarkToMap('polygon');
            this.drawFilter = {
                type: dis_select,
                circles,
            };
        },
        onClickFilterQuery(){
            let {drawFilter, startDrawing, circleRail, mapIns, queryLoading} = this;
            if(queryLoading) return;
            this.queryLoading = true;
            this.mapCardFlag = false;
            if(startDrawing){
                this.cData.config.cards[0].geo_filters = drawFilter;
                this.renderMap("query");
            }
            else
                this.renderMap("query");
        },
        openRadiusPicker(){
            size(this.pickerRadius) && this.pickerRadius.open();
            this.$$('.radiusPickerOk')[0] && this.$$('.radiusPickerOk')[0].addEventListener('click', () => {
                let {pickerValues, mapIns, circleCenter} = this;
                let radius = pickerValues[0]*1000 + pickerValues[2]*1;
                this.circleRadius = radius;
                let scale = radius*0.7071;
                this.btnMarklnglat = circleCenter.offset(scale, -scale);
                this.addMarkToMap('polygon');
                this.addMarkToMap('btnMark');
                this.setDrawCircleFilters();
                mapIns.setFitView(this.circleRail);
                this.$$('.radiusPickerOk')[0].removeEventListener('click', ()=>{});
            });
        },
        onClickRadiusPanel(type){
            let {circleRail, centerMark, btnMark, mapIns} = this;
            if(type === "ok"){
                this.queryBtnFlag = true;
            }
            else if(type === "cancel"){
                mapIns.remove(circleRail);
                this.queryBtnFlag = false;
            }
            mapIns.remove(centerMark);
            mapIns.remove(btnMark);
            this.circleRadiusPanel = false;
        },
        distanceConvert(value){
            return Math.ceil(value/10)/100;
        },
        productMapPng(){
            let node = this.$refs.interactive_map, {deviceType} = this;
            if(!node) return;
            if(deviceType === "ios"){
                return html2canvas(node.$refs.map_panel_tem);
            }
            else{
                return domtoimage.toBlob(node.$refs.map_panel_tem, {quality: 1})
            }
        },
        saveFilters(){
            let _this = this;
            let {drawFilter, startDrawing, circleRail, mapIns, cData: {thumb}, deviceType} = _this;
            let geo_filters = _this.cData.config.cards[0].geo_filters;

            _this.productMapPng().then(function (dataUrl) {
                let path = 
                localStorage.setItem(`mdt_geo_filters_${_this.cData.thumb}`, JSON.stringify({filters: geo_filters, status: true}));
                if(deviceType === "ios"){
                    let blob = _this.canvasToBlob(dataUrl);
                    _this.saveMapPng(blob);
                }
                else
                    _this.saveMapPng(dataUrl);
                _this.queryLoading = false;
            })
            .catch(function (error) {
                _this.queryLoading = false;
                console.error('oops, something went wrong!', error);
            });
        },
        mapStateSwitch(){
            let {mapBtnStatus, cData: {thumb}} = this;
            this.mapBtnStatus = !mapBtnStatus;
            let local = localStorage.getItem(`mdt_geo_filters_${thumb}`);
            local = JSON.parse(local);
            local.status = this.mapBtnStatus;
            localStorage.setItem(`mdt_geo_filters_${thumb}`, JSON.stringify(local));
            bus.$emit("interactiveMapGetData");
        },
        getMapBtnStatus(){
            let local = localStorage.getItem(`mdt_geo_filters_${this.cData.thumb}`);
            if(size(local)){
                local = JSON.parse(local);
                this.mapBtnFlag = true;
                this.mapBtnStatus = local.status;
            }
        },
        saveMapPng: async function(dataUrl){
            let {thumb} = this.cData;
            let resp = await uploadFilePromise(dataUrl, uploadType);
            let local = localStorage.getItem(`mdt_geo_filters_${thumb}`);
            local = JSON.parse(local);
            if(!!resp.oss_path){
                local.imgPath = resp.oss_path;
            }
            else{
                local.imgPath = "";
                console.error("缩略图保存失败");
            }
            localStorage.setItem(`mdt_geo_filters_${thumb}`, JSON.stringify(local));
            let mm = localStorage.getItem(`mdt_geo_filters_${thumb}`);
        },

        getMapPng(){
            let {thumb} = this.cData;
            let local = localStorage.getItem(`mdt_geo_filters_${thumb}`);
            local = JSON.parse(local);
            let imgPath = local.imgPath;
            if(size(imgPath)){
                this.staticBackgroundUrl = `url(${imgPath})`;
            }
            else{
                this.staticBackgroundUrl = 'url(./static/images/skeleton.png)';
            }
        },
        canvasToBlob(canvas) {
            let dataurl = canvas.toDataURL();
            let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }
    }
}
</script>
<style lang="scss" scoped>
.interactive-map-style {
    width: 100%;
    .interactive-map-static-show {
        width: 100%;
        .map-title {
            line-height: 18px;
            font-size: 15px;
            font-weight: 700;
            color: #4A4D51;
            box-sizing: border-box;
            padding: 25px 21px 14px 21px;
            word-wrap: break-word;
        }
        .map-img {
            width: 100%;
            box-sizing: border-box;
            padding: 0 21px 30px 21px;
            position: relative;
            .img-bg {
                width: 100%;
                height: 244px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
            }
            img {
                width: 100%;
                height: 244px;
                object-fit: cover;
            }
            a {
                position: absolute;
                width: 72px;
                height: 32px;
                bottom: 37px;
                right: 28px;
                color: #fff;
                font-size: 14px;
                font-family: PingFang SC;
                border-radius: 10px;
                background-color: #007aff;
            }
        }
    }
}
.interactive-map-detailpg {
    width: 100%;
    height: 100%;
    .interactive-map-show {
        height: 100%;
        position: relative;
        .interactive-map-card {
            position: absolute;
            width: 100%;
            bottom: 52px;
            box-sizing: border-box;
            padding: 0 8px 0 8px;
            z-index: 10;
        }
        .interactive-map-card-btn {
            width: 100%;
            height: 48px;
            bottom: 0;
            position: absolute;
            background-color: #fff;
            overflow-x: auto;
            .interactive-map-card-btn-content {
                .map-card-btn-group {
                    display: inline-block;
                    vertical-align: top;
                    .map-card-btn {
                        width: 48px;
                        height: 48px;
                        margin-left: 8px;
                        padding-top: 8px;
                        box-sizing: border-box;
                        display: inline-block;
                        .icomoon, .icon-panel{
                            text-align: center;
                            font-size: 20px;
                        }
                        .icon-panel {
                            margin-top: 4px;
                        }
                        .icon-polygon {
                            margin-left: 12px;
                        }
                    }
                    .map-card-btn-select {
                        border: solid 1px rgba(0, 122, 255, 0.4);
                        background-color: rgba(0, 122, 255, 0.1);
                        box-shadow: 0 0 2px 0 rgba(0, 122, 255, 0.5);
                    }
                }
            }
        }
        .interactive-map-circle-radius {
            width: 100%;
            height: 48px;
            bottom: 0;
            background-color: #fff;
            position: absolute;
            z-index: 10;
            display: inline-flex;
            .panel-close-btn, .panel-ok-btn {
                height: 48px;
                width: 48px;
                text-align: center;
                font-size: 16px;
                i {
                    line-height: 48px;
                }
            }
            .panel-ok-btn i {
                color: #007aff;
            }
            .panel-content-show {
                flex: 1;
                height: 48px;
                text-align: center;
                .content-text {
                    line-height: 28px;
                    font-size: 16px;
                }
                .content-value {
                    line-height: 18px;
                    font-size: 14px;
                }
            }
        }
        .setting-circle-radius-enter, .setting-circle-radius-leave-active {
            bottom: -50px;
        }
        .setting-circle-radius-enter-to, .setting-circle-radius-leave {
            bottom: 0;
        }
        .setting-circle-radius-enter-active, .setting-circle-radius-leave-active {
            transition: all 300ms;
        }
        .interactive-map-filter-btn {
            width: 56px;
            right: 16px;
            bottom: 64px;
            position: absolute;
            a {
                width: 56px;
                height: 56px;
                display: block;
                box-sizing: border-box;
                opacity: 85%;
                margin-top: 16px;
                border-radius: 50%;
                background-color: #fff;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }
            .map-filter-rail-btn {
                padding: 15px 19px;
                div {
                    width: 18px;
                    height: 26px;
                    background-size: 100% 100%;
                    background: url('../../../../../static/images/icon_workspace/icon_rail_btn.svg') no-repeat;
                }
            }
            .rail-show {
                background-color: #007aff;
                div {
                    background: url('../../../../../static/images/icon_workspace/icon_rail_show_btn.svg') no-repeat;
                }
            }
            .map-filter-draw-btn {
                padding: 13px;
                div {
                    width: 30px;
                    height: 30px;
                    background-size: 100% 100%;
                    background: url('../../../../../static/images/icon_workspace/icon_draw_btn.svg') no-repeat;
                }
            }
            .map-drawing {
                background-color: #007aff;
                div {
                    background: url('../../../../../static/images/icon_workspace/icon_start_draw_btn.svg') no-repeat;
                }
            }
            .map-location-btn {
                padding: 20px;
                .position-icon {
                    font-size: 20px;
                    color: #007aff;
                }
            }
        }
        .interactive-map-search-btn {
            position: absolute;
            width: 120px;
            height: 44px;
            line-height: 44px;
            border-radius: 24px;
            left: 0;
            right: 0;
            bottom: 64px;
            margin: auto;
            z-index: 10;
            color: #fff;
            font-size: 14px;
            text-align: center;
            background-color: #007aff;
            .preloader {
                width: 24px;
                height: 24px;
            }
        }
    }
}
</style>