<template>
    <div class="poi_visual_wrap">
        <div class="poi_visual_title">
            <div class="poi_visual_title_text">按{{mData.cur_visual.title}}可视化</div>
        </div>
        <div class="poi_visual_list">
            <div class="poi_visual_item" v-for="(vl, i) in breaks" :key="i" :style="{'width': (breaks.length-1)>0 ? `${100/breaks.length}%` : ''}">
                <div class="poi_visual_item_icon"><i :class="icon.icon" :style="{'color': current_colors[i] || visualization_colors[i] || visualization_colors[0]}"></i></div>
                <div class="poi_visual_item_line" :style="{'backgroundColor': current_colors[i] || visualization_colors[i] || visualization_colors[0]}"></div>
                <div class="poi_visual_item_val">{{vl}}</div>
            </div>
        </div>
    </div>
</template>
<script>
import bus from '../../../../../js/utils/bus'
import {calculateAverageBreaks, calculateNBC} from '../../../../../js/utils/numberUtil';
export default {
    name: "PointVisualization",
    props: ['mData'],
    data(){
        return {
            icon: '',
            poiVisualCol: '',
            cLen: {},
            breaks: [],
            current_colors: [],
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
            this.icon = this.mData.style.icon;
            this.poiVisualCol = this.mData.cur_visual.col;
            let vconfig = this.mData.config_1[this.poiVisualCol];
            this.current_colors = vconfig.range;
            this.cLen = vconfig.cLen || 7;
            this.breaks = vconfig.domain;
        },
        getBreaks() {
            var data = this.mData.data;
            var {cLen, breaks, poiVisualCol} = this;
            var max = 0, min = Infinity;
            var allVals = [];
            forEach(data, item => {
                let val = parseFloat(get(item, poiVisualCol));
                if (max < val) {
                    max = val
                }
                if (min > val) {
                    min = val
                }
                if (val == val) { //去除NaN
                    allVals.push(val);
                }
            });
            cLen = parseInt(cLen) || 1;
            var vals = breaks || calculateAverageBreaks(min, max, cLen);
            return [vals, allVals, min, max];
        }
    }
}
</script>
<style lang="scss" scoped>
.poi_visual_wrap {
    width: 100%;
    .poi_visual_title {
        .poi_visual_title_text{
            width: 100%;
            line-height: 17px;
            font-size: 12px;
        }
    }
    .poi_visual_list {
        width: 100%;
        margin-top: 12px;
        height: 36px;
        display: inline-flex;
        flex-wrap: nowrap;
        .poi_visual_item {
            height: 100%;
            .poi_visual_item_icon {
                width: 100%;
                text-align: center;
            }
            .poi_visual_item_line {
                width: 100%;
                height: 1px;
                margin-bottom: 8px;
            }
            .poi_visual_item_val {
                width: 100%;
                text-align: center;
            }
        }
    }
}
</style>