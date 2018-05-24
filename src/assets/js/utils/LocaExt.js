/**
 * Created by hzz on 2017/12/3.
 */
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import {interpolateRgbBasis} from 'd3-interpolate'
import {isNon} from './strUtil'
import Loca from '../lib/loca-0.1.3-rc1'

function getData() {
    return this._dataSet._data;
}

function getMarkerStyleById(id) {
    if (!this._markerGroup) return {};
    var overlays = this._markerGroup._overlays;
    var data = find(overlays, e => e._data.id == id);
    if (!data) return;
    return data._options.style;
}

function render() {
    var t = this
        , e = this._options
        , n = e["lnglat"]
        , r = e["invisible"]
        , i = e["type"]
        , fitView = e["fitView"]
        , a = e["blendMode"]
        , u = e["opacity"];
    if (!n)
        throw new Error("Set lnglat column name, first!");
    this._whenReady(function () {
        var _visualconf = t._visualconf;
        var {domain, deps, range, visualize_type} = _visualconf || {};
        var __other_idx__ = indexOf(domain, '__other__');
        for (var e = t._dataSet.getData(n), c = [], f = -1, s = e.length, l = t._normalizedList; ++f < s;) {
            var h = t._dataSet.getRow(f);

            var lnglat = e[f];
            var style = {...l.style};
            if (_visualconf) {
                let idx = -1;
                var val = get(h, deps);
                if (visualize_type == 1) {
                    forEach(domain, (t, dix) => {
                        if (dix == 0 && t === val) {
                            idx = dix;
                            return false;
                        }
                        if (val <= t) {
                            idx = dix - 1;
                            return false;
                        }
                    })
                    // if (idx == -1) idx = 0;
                    style.color = range[idx] || 'transparent';
                } else if (visualize_type == 2) {
                    forEach(domain, (t, dix) => {
                        if (val === t) {
                            idx = dix;
                            return false;
                        }
                    })
                    style.color = idx !== -1 ? range[idx] : range[__other_idx__];
                }
            }
            var marker = new Loca.MapMarker(h, {
                type: i,
                position: function () {
                    return lnglat.split(",")
                },
                style: style
            });
            ["click", "dblclick", "contextmenu", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave"].forEach(function (e) {
                marker.on(e, function (n) {
                    var r = n.originalData.event
                        , i = n.target
                        , o = i.getData()
                        , a = i.getPosition();
                    t.emit(e, {
                        target: i,
                        originalEvent: r,
                        rawData: o,
                        lnglat: a
                    })
                })
            });
            c.push(marker)
        }
        (t._markerGroup = new Loca.AMapMarkerGroup(c, {
            fitView: fitView,
            blendMode: a,
            opacity: u
        })).addTo(t._container)
    })
}

module.exports = {
    getData,
    render,
    getMarkerStyleById,
}
