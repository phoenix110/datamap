<template>
    <div class="point-card-style">
        <div class="card-title">{{iData.object_type}}</div>
        <div class="visual-list">
            <div class="visual-panel" v-for="(vl1, i1) in iData.filters" :key="i1">
                <div class="visual-header">
                    <div class="header-icon">
                        <div :class="['icomoon', vl1.style.icon.icon]" :style="{'color': vl1.style.color}"></div>
                        <div class="tag-text">{{getFilterDesc(vl1.filters)}}</div>
                    </div>
                    <div class="count">{{vl1.data && vl1.data.length}}</div>
                </div>
                <div class="visual-content" v-if="!!vl1.cur_visual">
                    <VisualTag :filter="vl1"></VisualTag>
                </div>
            </div>
        </div>       
    </div>
</template>
<script>
import map from 'lodash/map';
import {h_type_text, h_type_number, h_type_date} from 'src/assets/js/constants/Constants'
const PoiVisualTags = {
    1: "PointVisualization",
    2: "PointVisualTag",
    3: "PoiHotMap",
    4: "PoiHotMap",
    5: "PoiHotMap",
}
export default {
    name: "PointCard",
    props: ['iData'],
    data(){
        return {}
    },
    components: {
        VisualTag: {
            props: ['filter'],
            render: function(createElement){
                return createElement(PoiVisualTags[this.filter.cur_visual.type], {props: {mData: this.filter, hotType: this.filter.cur_visual.type}});
            }
        }
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
        }
    }
}
</script>
<style lang="scss" scoped>
.point-card-style {
    width: 100%;
    .card-title {
        line-height: 20px;
        font-family: PingFang SC;
        font-size: 14px;
    }
    .visual-list {
        .visual-panel {
            width: 100%;
            .visual-header {
                width: 100%;
                line-height: 30px;
                display: inline-flex;
                justify-content: space-between;
                .header-icon {
                    flex: 1;
                    .icon{
                        display: inline-block;
                        vertical-align: center;
                        font-size: 12px;
                    }
                    .tag-text {
                        font-size: 12px;
                        display: inline-block;
                    }
                }
                .count {
                    font-size: 12px;
                }
            }
            .visual-content {
                width: 100%;
            }
        }
    }
}
</style>