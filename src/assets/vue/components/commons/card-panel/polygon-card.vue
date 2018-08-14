<template>
    <div class="polygon-card-style">
        <div class="polygon-card-title">{{iData.object_type}}</div>
        <div class="polygon-visual-list">
            <div class="polygon-visual-panel" v-for="(vl1, i1) in iData.filters" :key="i1">
                <div class="polygon-visual-header">
                    <div class="header-icon">
                        <div class="icon" :style="setIconStyle(vl1)"></div>
                        <div class="tag-text">{{getFilterDesc(vl1.filters)}}</div>
                    </div>
                    <div class="count">{{vl1.data && vl1.data.length}}</div>
                </div>
                <div class="polygon-visual-content" v-if="!!vl1.cur_visual">
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
    1: "PolygonVisualization",
    2: "PolygonVisualizationByType",
}
export default {
    name: "PolygonCard",
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
        getFilterDesc(filters) {
            return map(filters, t => this.getFilterDescItem(t)).join('/') || '全部';
        },
        setIconStyle(vl){
            let {hidden, uid, data, style: polygon_icon, filters, fake, info_cfg} = vl || {};
            let borderColor = !hidden ? polygon_icon && polygon_icon.color : '#687495';
            let borderStyle = polygon_icon.strokeStyle || "solid";
            return {
                'borderColor': borderColor,
                'borderStyle': borderStyle,
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.polygon-card-style {
    width: 100%;
    .polygon-card-title {
        line-height: 20px;
        font-family: PingFang SC;
        font-size: 14px;
    }
    .polygon-visual-list {
        .polygon-visual-panel {
            width: 100%;
            .polygon-visual-header {
                width: 100%;
                line-height: 30px;
                display: inline-flex;
                justify-content: space-between;
                .header-icon {
                    flex: 1;
                    .icon{
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        border: 1px solid;
                        vertical-align: center;
                        display: inline-block;
                    }
                    .tag-text {
                        font-size: 12px;
                        vertical-align: top;
                        display: inline-block;
                    }
                }
                .count {
                    font-size: 12px;
                }
            }
            .polygon-visual-content {
                width: 100%;
            }
        }
    }
}
</style>