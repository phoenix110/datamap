<template>
    <div class="poly_visual_map">
        <div class="poly_visual_title">
            <div class="poly_visual_title_text">按{{mData.cur_visual.title}}可视化</div>
        </div>
        <div class="poly_visual_slider">
            <SketchBoard :colorList="current_colors" :contentList="breaks"></SketchBoard>
        </div>
    </div>
</template>
<script>
import SketchBoard from './normal/sketchBoard.vue';
export default {
    name: "PolygonVisualization",
    props: ['mData'],
    data(){
        return {
            breaks: [],
            current_colors: [],
        }
    },
    components: {
        SketchBoard,
    },
    mounted(){
        this.getSilderData();
    },
    methods: {
        getSilderData(){
            let poiVisualCol = this.mData.cur_visual.col;
            let vconfig = this.mData.config_1[poiVisualCol];
            this.current_colors = vconfig.range || [...visualization_colors];
            this.breaks = vconfig.domain;
        }
    }
}
</script>
<style lang="scss" scoped>
.poly_visual_map {
    .poly_visual_title {
        width: 100%;
        line-height: 20px;
        font-size: 14px;
        color: #38393c;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .poly_visual_slider {
        width: 100%;
        margin-top: 20px;
    }
}
</style>