<template>
    <div class="polyline-card-style">
        <div class="polyline-card-title">{{iData.object_type}}</div>
        <div class="polyline-visual-list">
            <div class="polyline-visual-panel" v-for="(vl1, i1) in iData.filters" :key="i1">
                <div class="polyline-visual-header">
                    <div class="header-icon">
                        <div class="line-icon">
                            <i class="icon-menu" :style="{color:  setIconStyle(vl1)}"></i>
                        </div>
                        <div class="tag-text">{{getFilterDesc(vl1.filters)}}</div>
                    </div>
                    <div class="count">{{vl1.data && vl1.data.length}}</div>
                </div>
                <div class="polyline-visual-content" v-if="!!vl1.cur_visual">
                    <VisualTag :filter="vl1"></VisualTag>
                </div>
            </div>
        </div>       
    </div>
</template>
<script>
import map from 'lodash/map';
import {h_type_text, h_type_number, h_type_date} from 'src/assets/js/constants/Constants'
const PolygonVisualTags = {
    1: "PolylineVisualization",
    2: "PolylineVisualizationByType",
}
export default {
    name: "PolylineCard",
    props: ['iData'],
    data(){
        return {}
    },
    components: {
        VisualTag: {
            props: ['filter'],
            render: function(createElement){
                return createElement(PolygonVisualTags[this.filter.cur_visual.type], {props: {mData: this.filter}});
            }
        },
    },
    methods: {
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
                let {start, end} = column;
                sub = start ? `${start} - ${end}` : '';
            }
            return sub;
        },
        getFilterDescItem(col) {
            return `${col.h_value}: ${this.getLabel(col)}`
        },
        getFilterDesc(filters) {
            return map(filters, t => this.getFilterDescItem(t)).join('/') || '全部';
        },
        setIconStyle(vl){
            let {hidden, style: polygon_icon} = vl || {};
            return !hidden ? polygon_icon && polygon_icon.color : '#687495';
        }
    }
}
</script>
<style lang="scss" scoped>
.polyline-card-style {
    width: 100%;
    .polyline-card-title {
        line-height: 20px;
        font-family: PingFang SC;
        font-size: 14px;
    }
    .polyline-visual-list {
        .polyline-visual-panel {
            width: 100%;
            .polyline-visual-header {
                width: 100%;
                line-height: 30px;
                display: inline-flex;
                justify-content: space-between;
                .header-icon {
                    flex: 1;
                    .line-icon{
                        display: inline-block;
                        vertical-align: center;
                        margin-right: 5px;
                        i {
                            font-size: 16px;
                        }
                    }
                    .tag-text {
                        font-size: 12px;
                        line-height: 30px;
                        vertical-align: top;
                        display: inline-block;
                    }
                }
                .count {
                    font-size: 12px;
                }
            }
            .polyline-visual-content {
                width: 100%;
            }
        }
    }
}
</style>