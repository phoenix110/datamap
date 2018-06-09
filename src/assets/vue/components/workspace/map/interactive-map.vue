<template>
    <div :class="isDetailPg ? 'interactive-map-detailpg' : 'interactive-map-style'">
        <div class="dynamic-map-show" v-if="isDetailPg">
            <MapPanel :mapData="cData" @initMapOther="initMapOther" :loaded="loaded"></MapPanel>
            <div class="page-btn">
                <div class="info-btn" @click="typePanel=true"><i class="icon-wallet"></i>
                </div>
            </div>
            <transition name="type-panel">
                <div class="type-panel" v-if="typePanel">
                    <MapCardPanel :iData="cData" @modelClose="onModelClose"></MapCardPanel>
                </div>
            </transition>
        </div>
        <div class="static-map-show" v-else>
            <div class="map-title">{{cData ? cData.config.title : ""}}</div>
            <div class="map-img">
                <div class="img-bg" :style="{'backgroundImage': cData && cData.thumb ? `url(${map_img_url+cData.thumb})` : 'url(./static/images/skeleton.png)'}"></div>
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
import uuidv1 from 'uuid/v1'
import fetchUtil from '../../../../js/utils/fetchUtil';
import queryUrl from '../../../../js/utils/queryUrl';
import amapUtil from '../../../../js/utils/amapUtil';
import bus from '../../../../js/utils/bus'
import {model_api_url, headers, paramFake, static_map_url, fakeParamObj} from '../../../../js/constants/ApiConfig';
import {
    fence_select, self_select, dis_select, buffer_select, visualization_colors, poi_icons,
    MapVisualTypes, source_customer, source_market, PolygonSourceKey, PolygonPackageIdKey,
    custom_card_menu, packet_select, geo_types, h_type_date, h_type_number, h_type_text
} from '../../../../js/constants/Constants'
import MapPanel from '../../commons/map-panel.vue';
import MapCardPanel from '../../commons/map-card-panel.vue';
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
export default {
    name: "InteractiveMap",
    props: ['cData', 'isDetailPg'],
    data(){
        return {
            map_img_url: static_map_url,
            map: {},
            drawpolygon: {},  //覆盖物集合
            maplayers: {},
            mapState: '',
            columnTypes: {},
            massMarkers: {}, //点位
            heatMaps: {},  //热力
            polygonLayers: {}, //围栏数据
            lineLayers: {}, //线数据
            markValue: {},
            buffers: {}, //buffers geos
            buffersData: {},
            geo_filter: {},
            typePanel: false,
            bgPolygonData: {},
            loaded: false,
            fetchDataFlag: false,
            getColumnTypesFlag: false,
        }
    },
    watch: {
        cData: function(){
            this.init();
        }
    },
    components: {
        MapPanel,
        MapCardPanel,
    },
    created(){
        if(this.cData){
            this.init();
        }
    },
    methods: {
        init(){
            let {cards, buffer_filters, geo_filter} = this.cData.config, active_layer_ids = {};
            this.geo_filter = geo_filter || {};
            if(cards[0] && cards[0].geo_filters){
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
            this.map = mapView;
            if(this.cData){
                this.renderMap();
            }
        },
        renderMap() {
            var {cards, geo_filter, supp_filters} = this.cData.config;
            var fence_geos = [], self_select_geos = [], dis_select_geos = []
            forEach(cards, c => {
                if (c.geo_filters) {
                    if (c.geo_filters.type == self_select) {
                        self_select_geos.push(c.geo_filters.geoJson)
                    } else if (c.geo_filters.type == dis_select) {
                        dis_select_geos.push(c.geo_filters.circles)
                    } else if (c.geo_filters.type == fence_select) {
                        fence_geos.push(c)
                    }
                }
                forEach(c.items, t => {
                    this['render_style_' + t.geometry_type] = size(t.filters);
                })
            })
            if (size(this.buffersData)) {
                this.addBufferGeos(this.buffersData);
                this.fetchData();
            }else {
                if (size(self_select_geos)) {
                    this.addSelfGeo(self_select_geos)
                }
                if (size(dis_select_geos)) {
                    this.addCircleGeo(dis_select_geos)
                }
                if (size(geo_filter) >= 2) {
                    this.fetchFenceGeo(() => {
                        this.fetchData()
                    });
                } else {
                    this.fetchData()
                }
            }
            this.getColumnTypes();
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
                    this.map.add(layers)
                    all = all.concat(layers);
                })
            })
            this.map.setFitView(all);
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
        fetchData(isClick) {
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
                // buffer_filters = {type: buffer_select, filters: this.buffersData}
            }
            console.log('cards2222', cards);
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
                                var {start, end} = r
                                return [r.key, r.h_type, [start, end]]
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
                    // mapIns && mapIns.setMapBlocking(false)
                    this.map = this.getMapInstance();
                    var allpoints = [];
                    forEach(resp, (r, idx) => {
                        let [dataSet, points] = this.dealDataSet(r, pssMap[idx].item.geometry_type);
                        allpoints = allpoints.concat(points);
                        pssMap[idx].filter.data = dataSet;
                        this.addDataToMap(dataSet, pssMap[idx].card, pssMap[idx].item, pssMap[idx].filter);
                    });
                    // this.map && this.map.setFitView();
                    bus.$emit('mapFetchData');
                })
                .catch(err => {
                    console.error(err);
                    if(this.getColumnTypesFlag){
                        this.loaded = true;
                    }
                    this.fetchDataFlag = true;
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
            if (!this.maplayers) return;
            this.maplayers[source] = {[packageId]: {[object_type]: {}}};
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
                this.maplayers[source][packageId][object_type][id + ''] = layer
            })
            var mapIns = this.getMapInstance()
            if (size(layers)) {
                mapIns && mapIns.add(layers)
                mapIns && mapIns.setFitView(layers);
            }
        },
        dealPolygonAct(polygon) {
            // // 移入
            // polygon.on('mousemove', ({lnglat}) => {
            //     let extData = polygon.getExtData() || {}
            //     let text = extData.name
            //     this.updateMapHelper(lnglat, text)
            // })
            // // 移除
            // polygon.on('mouseout', (e) => {
            //     this.hideMapHelper()
            // })

            // // polygon点击
            // polygon.on('click', this.onClickPolygon)
        },
        getMapInstance() {
            return this.map;
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
                // forEach(layer, p => {
                //     p.on('click',  e => {
                //         this.onShowPolygonInfo(e, card.uid, filter.uid)
                //     })
                // })
            })
            this.map.add(layers);
            this.map.setFitView(layers);
            this.polygonLayers[card.uid] = this.polygonLayers[card.uid] || {}
            this.polygonLayers[card.uid][filter.uid] = layersMap;
        },
        addLineToMapExt(dataSet, card, item, filter) {
            if (!this.map) return;
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
        updatePoiOnMap(card_id, filter_id) {
            var {cards} = this.cData.config;
            var [card, fdItem, fdFilter] = this.findCardAndFilter(cards, card_id, filter_id)
            var mapIns = this.getMapInstance()
            if (!mapIns) return;
            //清除
            // this.removeLayerOrHeatMap(card_id, filter_id);
            var dataSet = fdFilter.data || [];
            if (fdFilter.hidden) { //隐藏
                return
            }
            var {cur_visual} = fdFilter
            var visual_cfg = null
            var {type, col, title} = cur_visual || {};
            visual_cfg = fdFilter["config_" + type];
            visual_cfg = visual_cfg || {};
            visual_cfg = visual_cfg[col]
            if (!type || type == 1 || type == 2) {
                var option = amapUtil.getVisualMapOption(fdFilter.style)
                option.fitView = false
                this.massMarkers[card_id] = this.massMarkers[card_id] || {};
                this.massMarkers[card_id][filter_id] = amapUtil.createVisualMap(mapIns, dataSet, visual_cfg, option)
                // this.massMarkers[card_id][filter_id].on('click', e => {
                //     this.onMassClick(e, card_id, filter_id)
                // })
                this.generateMarkCols();
            } else if (type == 3 || type == 4 || type == 5) {
                this.heatMaps[card_id] = this.heatMaps[card_id] || {};
                this.heatMaps[card_id][filter_id] = amapUtil.createHeatMap(mapIns, dataSet, visual_cfg, col);
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
        }
    }
}
</script>
<style lang="scss" scoped>
.interactive-map-style {
    width: 100%;
    .static-map-show {
        width: 100%;
        // height: 300px;
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
.interactive-map-detailpg {
    width: 100%;
    height: 100%;
    .dynamic-map-show {
        height: 100%;
        position: relative;
        .page-btn {
            position: absolute;
            width: 40px;
            right: 14px;
            top: 18px;
            .info-btn, .map-switch {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: #409eff;
                margin-left: 4px;
                text-align: center;
                line-height: 32px;
                i{
                    color: #fff;
                }
            }
            .map-switch {
                margin-top: 16px;
            }
        }
        .type-panel {
            position: absolute;
            width: 320px;
            // height: 344px;
            max-height: 344px;
            top: 7px;
            right: 7px;
            background-color: #fff;
        }

        .type-panel-enter, .type-panel-leave-active {
            opacity: 0;
            right: -320px;
        }
        .type-panel-enter-to, .type-panel-leave {
            opacity: 1;
            right: 7px;
        }
        .type-panel-enter-active, .type-panel-leave-active {
            transition: all 300ms;
        }
    }
}
</style>