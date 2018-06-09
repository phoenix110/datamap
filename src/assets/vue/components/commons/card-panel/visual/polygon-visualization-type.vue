<template>
    <div class="poly_visual_wrap">
        <div class="poly_visual_title">
            <div class="poly_visual_title_text">按{{mData.cur_visual.title}}可视化</div>
        </div>
        <div class="poly_visual_list">
            <div class="poly_visual_item" v-for="(vl, i) in breaks" :key="i">
                <div class="poly_visual_item_icon" :style="{borderColor: current_colors[i] || visualization_colors[i] || visualization_colors[0], borderStyle: borderStyle}"></div>
                <div class="poly_visual_item_val">{{vl === '__other__' ? '其他' : vl}}</div>
            </div>
        </div>
    </div>
</template>
<script>
import bus from '../../../../../js/utils/bus'
import {visualization_colors} from '../../../../../js/constants/Constants'
import {calculateAverageBreaks, calculateNBC} from '../../../../../js/utils/numberUtil';
export default {
    name: "PolygonVisualizationByType",
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
        bus.$on('mapFetchData', ()=>{
            this.setTemData();
        })
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
.poly_visual_wrap {
    width: 100%;
    .poly_visual_title {
        .poly_visual_title_text{
            width: 100%;
            line-height: 17px;
            font-size: 12px;
        }
    }
    .poly_visual_list {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .poly_visual_item {
            width: 50%;
            line-height: 30px;
            font-size: 12px;
            .poly_visual_item_icon {
                width: 10px;
                height: 10px;
                margin-right: 5px;
                border-radius: 50%;
                border: 1px solid;
                vertical-align: center;
                display: inline-block;
            }
            .poly_visual_item_val {
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