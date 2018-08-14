<template>
    <div class="line_visual_wrap">
        <div class="line_visual_title">
            <div class="line_visual_title_text">按{{mData.cur_visual.title}}可视化</div>
        </div>
        <div class="line_visual_list">
            <div class="line_visual_item" v-for="(vl, i) in breaks" :key="i">
                <div class="line_visual_item_icon">
                    <i class="icon-menu" :style="{color: current_colors[i] || visualization_colors[i] || visualization_colors[0]}"></i>
                </div>
                <div class="line_visual_item_val">{{vl === '__other__' ? '其他' : vl}}</div>
            </div>
        </div>
    </div>
</template>
<script>
import bus from '../../../../../js/utils/bus'
import {visualization_colors} from '../../../../../js/constants/Constants'
import {calculateAverageBreaks, calculateNBC} from '../../../../../js/utils/numberUtil';
export default {
    name: "PolygonVisualization",
    props: ['mData'],
    data(){
        return {
            poiVisualCol: '',
            breaks: [],
            current_colors: [],
            borderStyle: '',
        }
    },
    created(){
        bus.$on('mapFetchData', this.setTemData)
    },
    beforeDestroy() {
        bus.$off('mapFetchData', this.setTemData);
    },
    mounted(){
        this.setTemData();
    },
    methods: {
        setTemData(){
            this.borderStyle = this.mData.style.strokeStyle;
            this.poiVisualCol = this.mData.cur_visual.col;
            let vconfig = this.mData.config_2[this.poiVisualCol];
            this.current_colors = vconfig.range || [...visualization_colors];
            this.breaks = vconfig.domain;
        },
    }
}
</script>
<style lang="scss" scoped>
.line_visual_wrap {
    width: 100%;
    .line_visual_title {
        .line_visual_title_text{
            width: 100%;
            line-height: 20px;
            font-size: 14px;
            color: #38393c;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .line_visual_list {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .line_visual_item {
            width: 50%;
            line-height: 17px;
            font-size: 12px;
            color: #6b7280;
            margin-top: 12px;
            .line_visual_item_icon {
                vertical-align: top;
                display: inline-block;
                margin-right: 5px;
                .i {
                    font-size: 16px;
                }
            }
            .line_visual_item_val {
                display: inline-block;
                vertical-align: top;
                width: 8em;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
}
</style>