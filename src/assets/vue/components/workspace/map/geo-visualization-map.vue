<template>
    <div :class="isDetailPg ? 'geo-map-detailpg' : 'geo-map-style'">
        <div class="dynamic-map-show" v-if="isDetailPg">
            <MapPanel 
                ref="mappanel" 
                :mapData="cData" 
                @initMapOther="initMapOther" 
                :loaded="loaded"
            ></MapPanel>
            <div class="geo-map-card" v-if="currentClickBtn.length != 0">
                <MapCardPanel 
                    :mapCardData="currentMapCardPanel" :filterIndex="filterIndex" :cardBtnWatch="cardBtnWatch"
                ></MapCardPanel>
            </div>
            <div class="geo-map-card-btn">
                <div class="geo-map-card-btn-content">
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
        </div>
        <div class="static-map-show" v-else>
            <div class="map-title">{{cData ? cData.title : ''}}</div>
            <div class="map-img">
                <div class="img-bg" :style="{'backgroundImage': cData && cData.thumb ? `url(${map_img_url+cData.thumb})` : 'url(./static/images/icon_map_default.png)'}"></div>
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
import uniq from 'lodash/uniq';
import coordtransform from 'coordtransform';
import uuidv1 from 'uuid/v1'
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import amapUtil from '../../../../js/utils/amapUtil';
import bus from '../../../../js/utils/bus';
import {setIconClass, setIconStyle} from '../../../../js/utils/getIcon';
import {model_api_url, headers, static_map_url} from '../../../../js/constants/ApiConfig';
import {
    fence_select, self_select, dis_select, buffer_select, visualization_colors, poi_icons,
    MapVisualTypes, source_customer, source_market, PolygonSourceKey, PolygonPackageIdKey,
    custom_card_menu, packet_select, geo_types, h_type_date, h_type_number, h_type_text
} from '../../../../js/constants/Constants'
import MapPanel from '../../commons/map-panel.vue';
import MapCardPanel from '../../commons/card-panel/map-card-panel.vue';

const spatial_relations = {
    '1': 'intersects', //包含交叉区域
    '2': 'within', //不包含交叉区域
}

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
export default {
    name: "GeoVisualizationMap",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            mapCardData: {},
            map_img_url: static_map_url,
            map: {},
            drawpolygon: {},  //覆盖物集合
            maplayers: {},
            mapState: '',
            columnTypes: {},
            massMarkers: {}, //点位
            heatMaps: {},  //热力
            lineLayers: {}, //线数据
            markValue: {},
            buffers: {}, //buffers geos
            buffersData: {},
            geo_filter: {},
            typePanel: false,
            bgPolygonData: {},
            loaded: false,

            //新版地理卡片
            mapCardList: [],  //地理card数组
            currentClickBtn: "",  //确认当前点击的card btn
            filterIndex: 0,  //当前地理卡片filter序号
            currentMapCardPanel: {},  //当前地理卡片配置信息
            cardBtnWatch: '', //用于MapCardPanel组件检测数据更新
        }
    },
    components: {
        MapPanel,
        MapCardPanel,
    },
    watch: {
        cData: function(){
            this.init();
            this.getMapCardOptions();
        }
    },
    created(){
        if(this.cData){
            this.init();
            this.getMapCardOptions();
        }
    },
    methods: {
        init(){
            let {cards, buffer_filters} = this.cData, active_layer_ids = {};
            if(cards[0] && cards[0].geo_filters){
                this.geo_filter = cards[0].geo_filters;
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

            this.mapCardData = {
                "config": {
                    "cards": cards
                },
            };
        },
        initMapOther(mapView){
            this.map = mapView;
            setTimeout(()=>{
                this.renderMap();
            }, 1000)
        },
        renderMap() {
            var {cards} = this.cData;
            var fence_geos = [], self_select_geos = [], dis_select_geos = []
            forEach(cards, t => {
                if (t.geo_filters) {
                    if (t.geo_filters.type == self_select) {
                        self_select_geos.push(t.geo_filters.geoJson)
                    } else if (t.geo_filters.type == dis_select) {
                        dis_select_geos.push(t.geo_filters.circles)
                    } else if (t.geo_filters.type == fence_select) {
                        fence_geos.push(t)
                    }
                }
            })
            this.layers = [];
            if (size(self_select_geos)) {
                this.addSelfGeo(self_select_geos)
            }
            if (size(dis_select_geos)) {
                this.addCircleGeo(dis_select_geos)
            }
            if (size(fence_geos)) {
                this.fetchFenceGeo(fence_geos, () => {
                    this.fitMapView();
                    this.dealCfgAndFetch(cards);
                })
            } else {
                this.dealCfgAndFetch(cards)
                this.fitMapView();
            }
        },
        fitMapView() {
            setTimeout(()=>{
                if (this.map) {
                    let layers_circle = this.map.getAllOverlays('circle');
                    let layers = layers_circle.concat(this.map.getAllOverlays('polygon'));
                    this.map.setFitView(layers)
                }
            });
        },
        dealCfgAndFetch(cards) {
            var _this = this;
            var pss = [], pssMap = {}
            forEach(cards, card => {
                var {geo_filters, uid} = card
                var geo_filter
                if (geo_filters) {
                    if (geo_filters.type == fence_select) {
                        var objs = {markets: [], customers: []};
                        forEach(this.active_layer_ids && this.active_layer_ids[uid], (ids, packageId) => {
                            if (packageId) {
                                objs.markets.push({package_id: packageId, ids: map(ids, t => t.id)});
                            } else {
                                objs.customers = concat(objs.customers, map(ids, t => t.id))
                            }
                        })
                        geo_filter = {};
                        if (size(objs.markets)) {
                            geo_filter.markets = objs.markets;
                        }
                        if (size(objs.customers)) {
                            geo_filter.customers = objs.customers;
                        }
                    } else if (geo_filters.type == self_select) {
                        geo_filter = {geometry: amapUtil.geoJsonToEwkb(geo_filters.geoJson)}
                    } else if (geo_filters.type == dis_select) {
                        geo_filter = {circles: geo_filters.circles}
                    }
                }
                forEach(card.items, item => {
                    item = item || {};
                    var {object_type, geometry_type, source, packageId} = item
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
                        var {spatial_relation} = filter;
                        var params = {
                            object_type,
                            geo_type: geometry_type,
                            spatial_relation: spatial_relations[spatial_relation]
                        };
                        if (source === source_market) params.object_type = packageId;
                        if (geo_filter) params = {...params, ...geo_filter}
                        if (size(flts)) params.filters = flts
                        pss.push(this.fetchData(params, source));
                        pssMap[pss.length - 1] = {card, item, filter};
                    })
                })
            })
            Promise.all(pss)
                .then(resp => {
                    _this.loaded = true;
                    var allpoints = [];
                    forEach(resp, (r, idx) => {
                        let [dataSet, points] = this.dealDataSet(r, pssMap[idx].item.geometry_type);
                        allpoints = allpoints.concat(points);
                        pssMap[idx].filter.data = dataSet;
                        this.addDataToMap(dataSet, pssMap[idx].card, pssMap[idx].item, pssMap[idx].filter);
                    });
                    bus.$emit('mapFetchData');
                }).catch(err => {
                    console.log(err);
                    _this.loaded = true;
                })
        },
        addSelfGeo(geos) {
            this.drawpolygon = this.drawpolygon || {}
            var layersAll = []
            forEach(geos, geo => {
                var layers = amapUtil.addPolygon({geometry: geo}, activeOpt)
                var uid = 'poly_' + uuidv1();
                forEach(layers, shape => {
                    shape.setExtData({uid});
                    // shape.on('rightclick', this.onShapeRightClick)
                })
                this.map.add(layers)
                this.drawpolygon[uid] = layers;
                layersAll = layersAll.concat(layers);
            })
            if (size(layersAll)) {
                // this.intMapTools();
                this.map.setFitView(layersAll);
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
                    // layer.on('rightclick', this.onShapeRightClick)
                    layers.push(layer)
                    this.drawpolygon[uid] = layer;
                })
            })
            this.map.add(layers)
            if (size(layers)) {
                // this.intMapTools();
                this.map.setFitView(layers);
            }
        },

        
        fetchCustomerDataWithOutFilter(object_type, geometry_type, source) {
            var params = {
                geo_type: geometry_type,
                check_geometry: false,
            }
            let postdata = JSON.stringify({object_types: [object_type]})
            return new Promise((resolve, reject) => {
                var ps = source !== source_market ?
                    fetchUtil(queryUrl(`${model_api_url}upload/query`, params), {method: 'POST', body: postdata, headers})
                    : fetchUtil(queryUrl(`${model_api_url}data/market/geometry/${encodeURIComponent(object_type)}`));
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
        fetchFenceGeo(cards, callback) {
            var object_types = [], markets = [];
            forEach(cards, card => {
                forEach(card.geo_filters.filters, t => {
                    if (t[PolygonSourceKey] == source_market) {
                        markets.push(t[PolygonPackageIdKey])
                    } else {
                        if (t.pid !== undefined) {
                            object_types.push(t.pid)
                        } else {
                            object_types.push(t.id)
                        }
                    }
                })
            })
            object_types = uniq(object_types)
            markets = uniq(markets)
            var pss = [], objMap = []
            forEach(object_types, obj => {
                pss.push(this.fetchCustomerDataWithOutFilter(obj, geo_types.polygon, source_customer))
                objMap.push({source: source_customer, object_type: obj})
            })
            forEach(markets, pid => {
                pss.push(this.fetchCustomerDataWithOutFilter(pid, geo_types.polygon, source_market))
                objMap.push({source: source_market, object_type: pid})
            })
            this.objData = {}
            this.active_layer_ids = {}
            Promise.all(pss)
                .then(resp => {
                    forEach(resp, (r, i) => {
                        if (r) {
                            var {source, object_type} = objMap[i];
                            this.objData[source] = this.objData[source] || {}
                            this.objData[source][object_type] = this.objData[source][object_type] || {}
                            forEach(r, p => {
                                this.objData[source][object_type][p.id] = p
                            })
                        }
                    })
                    var layers = [], layer
                    forEach(cards, (card) => {
                        var {uid} = card;
                        this.active_layer_ids[uid] = {};
                        forEach(card.geo_filters.filters, t => {
                            var {[PolygonSourceKey]: source, [PolygonPackageIdKey]: packageId} = t;
                            source = source || source_customer;
                            packageId = packageId || '';
                            this.active_layer_ids[uid][packageId] = this.active_layer_ids[uid][packageId] || {};
                            let object_type;
                            if (t.pid !== undefined) {
                                object_type = source === source_market ? packageId : t.pid;
                                var p = this.objData[source][object_type][t.oid]
                                layer = amapUtil.addPolygon(p, normalOpt)
                                this.active_layer_ids[uid][packageId][t.oid] = {
                                    id: t.oid + '',
                                    object_type: t.pid,
                                    name: p.name,
                                    source,
                                    packageId
                                }
                            } else {
                                layer = []
                                object_type = source === source_market ? packageId : t.id;
                                forEach(this.objData[source][object_type], o => {
                                    layer.push(amapUtil.addPolygon(o, normalOpt))
                                    this.active_layer_ids[uid][packageId][o.id] = {
                                        id: o.id + '',
                                        object_type: t.id,
                                        name: o.name,
                                        source,
                                        packageId
                                    }
                                })
                            }
                            layers = layers.concat(layer)
                        })
                    })
                    this.layers = this.layers.concat(layers);
                    this.map && this.map.add(layers)
                    callback && callback()
                }).catch(err => {
                console.error(err)
                callback && callback()
            })
        },
        fetchData(data, source) {
            source = source || source_customer;
            var params = {}
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
        getMapInstance() {
            return this.map;
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
            this.generateMarkCols();        
        },
        addPoiToMapExt(dataSet, card, item, filter) {
            if (!this.map) return
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
                this.massMarkers[card.uid][filter.uid] = amapUtil.createVisualMap(this.map, dataSet, visual_cfg, option)
                // this.massMarkers[card.uid][filter.uid].on('click', e => {
                //     this.onMassClick(e, card.uid, filter.uid)
                // })
            } else if (type == 3 || type == 4 || type == 5) {
                this.heatMaps[card.uid] = this.heatMaps[card.uid] || {};
                this.heatMaps[card.uid][filter.uid] = amapUtil.createHeatMap(this.map, dataSet, visual_cfg, col);
            }
        },
        addPolygonToMapExt(dataSet, card, item, filter) {
            if (!this.map) return;
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
            this.map.add(layers);
        },
        addLineToMapExt(dataSet, card, item, filter) {
            if (!this.map) return;
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
                // forEach(layer, p => {
                //     p.on('click',  e => {
                //         this.onShowPolygonInfo(e, card.uid, filter.uid)
                //     })
                // })
            })
            this.map.add(layers);
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
                this.map && this.map.remove(this.heatMaps[card_id][filter_id]);
                this.heatMaps[card_id][filter_id] = null;
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
            var map = this.map;
            let {cards} = this.cData;
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
            var map = this.getMapInstance();
            this.infoWindow && map && map.remove(this.infoWindow);
        },
        createInfoWindow(fdFilter, pos, data) {
            if (size(fdFilter.info_cfg)) {
                var map = this.getMapInstance();
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
                        map: this.map,
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
            var map = this.map;
            if (!map) return true;
            var zoom = map.getZoom();
            var pix1 = map.lnglatToPixel(p1, zoom);
            var pix2 = map.lnglatToPixel(p2, zoom);
            var disX = pix1.getX() - pix2.getX()
            var disY = pix1.getY() - pix2.getY()
            return Math.abs(disX) < 100 && Math.abs(disY) < 20
        },
        onModelClose(){
            this.typePanel = false;
        },

        //新版地理卡片
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
    }
}
</script>
<style lang="scss" scoped>
.geo-map-style {
    width: 100%;
    .static-map-show {
        width: 100%;
        // height: 300px;
        .map-title {
            line-height: 18px;
            font-size: 13px;
            color: #4A4D51;
            box-sizing: border-box;
            padding: 25px 21px 14px 21px;
            word-wrap: break-word;
        }
        .map-img {
            width: 100%;
            box-sizing: border-box;
            padding: 0 21px 30px 21px;
            .img-bg {
                width: 100%;
                height: 244px;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
            }
        }
    }
}
.geo-map-detailpg {
    width: 100%;
    height: 100%;
    .dynamic-map-show {
        height: 100%;
        position: relative;
        .geo-map-card {
            position: absolute;
            width: 100%;
            bottom: 52px;
            box-sizing: border-box;
            padding: 0 8px 0 8px;
            z-index: 10;
        }
        .geo-map-card-btn {
            width: 100%;
            height: 48px;
            bottom: 0;
            position: absolute;
            background-color: #fff;
            overflow-x: auto;
            .geo-map-card-btn-content {
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
    }
}
</style>