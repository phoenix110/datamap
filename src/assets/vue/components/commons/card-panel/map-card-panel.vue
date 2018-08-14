<template>
    <div class="map-card-panel">
        <transition name="card-title">
            <div class="map-card-panel-title" v-if="titleSwitch">
                <div :class="['card-panel-title-icon', getGeometryType() ? 'card-panel-polygon-icon' : '']">
                    <div :class="getCardIconClass(mapCardData, filterIndex)" :style="getCardIconStyle(mapCardData, filterIndex)"></div>
                </div>
                <div class="card-panel-title-content">
                    <div class="title-content-text">{{mapCardData.object_type}}</div>
                    <div class="title-content-detail">
                        <div class="title-content-detail-text">{{getFilterDesc()}}</div>
                        <div class="title-content-detail-count">{{getAmount()}}</div>
                    </div>
                </div>
                <div class="card-panel-close-icon" @click="onClickClose('titleSwitch')">
                    <i class="f7-icons">close</i>
                </div>
            </div>
        </transition>
        <transition name="card-content">
            <div class="map-card-panel-content" v-if="contentSwitch">
                <MapCardElement 
                :filter="mapCardData.filters[filterIndex]" :geometryType="mapCardData.geometry_type"
                ></MapCardElement>
                <div class="card-panel-close-icon" @click="onClickClose('contentSwitch')">
                    <i class="f7-icons">close</i>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import map from 'lodash/map';
import size from 'lodash/size';
import {setIconClass, setIconStyle} from '../../../../js/utils/getIcon';
import {geo_types, h_type_number, h_type_text, h_type_date} from '../../../../js/constants/Constants';
const View = {
    [geo_types.point]: {
        1: "PointVisualization",
        2: "PointVisualTag",
        3: "PoiHotMap",
        4: "PoiHotMap",
        5: "PoiHotMap",
    },
    [geo_types.line]: {
        1: "PolylineVisualization",
        2: "PolylineVisualizationByType",
    },
    [geo_types.polygon]: {
        1: "PolygonVisualization",
        2: "PolygonVisualizationByType",
    },
};
export default {
    name: "MapCardPanel",
    props: ['mapCardData', 'filterIndex', 'cardBtnWatch'],
    data(){
        return {
            titleSwitch: true,
            contentSwitch: false,
        }
    },
    mounted(){
        let {mapCardData, filterIndex} = this;
        this.titleSwitch = true;
        this.contentSwitch = size(mapCardData.filters[filterIndex].cur_visual) ? true : false;
    },
    watch: {
        cardBtnWatch: function(){
            let {mapCardData, filterIndex} = this;
            this.titleSwitch = true;
            this.contentSwitch = size(mapCardData.filters[filterIndex].cur_visual) ? true : false;
        }
    },
    methods: {
        getCardIconClass(vl1, dx2){
            return setIconClass(vl1, dx2);
        },
        getCardIconStyle(vl1, dx2){
            return setIconStyle(vl1, dx2);
        },
        getLabel(column) {
            let sub = '';
            if (column.h_type === h_type_text) {
                sub = column.list.join("、");
            } else if (column.h_type === h_type_number) {
                let {min, max} = column;
                if (min !== undefined && max !== undefined) {
                    sub = `${min}-${max}`
                } else if (max !== undefined) {
                    sub = `${max}以下`
                } else if (min !== undefined) {
                    sub = `${min}以上`
                }
            } else if (column.h_type === h_type_date) {
                let {start, end, fast_type, end_is_today} = column;
                if (end_is_today) {
                    sub = `${start}至今`;
                }else if (fast_type) {
                    sub = fast_type;
                }else {
                    sub = start ? `${start} - ${end}` : '';
                }
            }
            return sub;
        },
        getFilterDescItem(col) {
            return `${col.h_value}: ${this.getLabel(col)}`
        },
        getFilterDesc() {
            let {mapCardData, filterIndex} = this;
            let filters = mapCardData.filters[filterIndex].filters
            return map(filters, t => this.getFilterDescItem(t)).join('/') || '全部';
        },
        getAmount(){
            let {mapCardData, filterIndex} = this;
            return mapCardData.filters[filterIndex].data && mapCardData.filters[filterIndex].data.length;
        },
        getGeometryType(){
            let {mapCardData} = this;
            return mapCardData.geometry_type === "polygon" ? true : false;
        },
        onClickClose(type){
            this[type] = false;
        }
    },
    components: {
        "MapCardElement": {
            props: ["filter", "geometryType"],
            data(){
                return {}
            },
            render: function(createElement){
                let {filter, geometryType} = this;
                return createElement(View[geometryType][filter.cur_visual.type], {props: {mData: filter}});
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.map-card-panel {
    width: 100%;
    .map-card-panel-title {
        width: 100%;
        padding: 16px;
        box-sizing: border-box;
        display: inline-flex;
        position: relative;
        border-radius: 10px;
        background-color: #fff;
        font-family: PingFang SC;
        .card-panel-title-icon {
            width: 48px;
            height: 100%;
            .icomoon, .icon-panel{
                text-align: center;
                font-size: 20px;
            }
        }
        .card-panel-polygon-icon {
            box-sizing: border-box;
            padding-left: 14px;
        }
        .card-panel-title-content {
            flex: 1;
            .title-content-text {
                width: 12em;
                line-height: 25px;
                font-size: 18px;
                color: #38393c;
                padding-right: 40px;
                box-sizing: border-box;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .title-content-detail {
                width: 100%;
                margin-top: 4px;
                font-size: 12px;
                color: #6B7280;
                display: inline-flex;
                .title-content-detail-text {
                    flex: 1;
                    line-height: 18px;
                    word-wrap: break-word;
                }
                .title-content-detail-count {
                    margin-left: 16px;
                    width: 40px;
                }
            }
        }
    }
    .card-panel-close-icon {
        width: 32px;
        line-height: 32px;
        text-align: center;
        top: 2px;
        right: 2px;
        position: absolute;
        i {
            font-size: 18px;
            color: #9b9b9b;
        }
        position: absolute;
    }
    .map-card-panel-content {
        width: 100%;
        margin-top: 4px;
        position: relative;
        border-radius: 10px;
        background-color: #fff;
        font-family: PingFang SC;
        box-sizing: border-box;
        padding: 16px;
    }

    .card-title-enter, .card-title-leave-active {
        opacity: 0;
        transform: rotateX(90deg)
    }
    .card-title-enter-to, .card-title-leave {
        opacity: 1;
        transform: rotateX(0deg);
    }
    .card-title-enter-active, .card-title-leave-active {
        transition: all 300ms;
    }

    .card-content-enter, .card-content-leave-active {
        opacity: 0;
        transform: rotateX(90deg)
    }
    .card-content-enter-to, .card-content-leave {
        opacity: 1;
        transform: rotateX(0deg);
    }
    .card-content-enter-active, .card-content-leave-active {
        transition: all 300ms;
    }
}
</style>