<template>
    <div class="point_hot_map">
        <div class="point_hot_title">
            <div class="point_hot_title_text">{{mData.cur_visual.title}}生成热力图</div>
        </div>
        <div class="point_hot_slider">
            <Slider :sliderMarksList="sliderMarksList" :value="hRadius" :color="selectExampleColor" :min="min" :max="max"></Slider>
        </div>
    </div>
</template>
<script>
import Slider from './normal/slider.vue';
export default {
    name: "PoiHotMap",
    props: ['mData', 'hotType'],
    data(){
        return {
            sliderMarksList: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
            hRadius: "",
            selectExampleColor: 0,
            min: 2,
            max: 30,
        }
    },
    components: {
        Slider,
    },
    mounted(){
        this.getSilderData();
    },
    methods: {
        getSilderData(){
            let {mData} = this;
            let hotType = mData.cur_visual.type;
            let type = 'config_' + hotType;
            let {cur_visual} = mData;
            let config = mData[type];
            let poiVisualCol = cur_visual.col;
            let value = !!config[poiVisualCol] || {};
            this.hRadius = value.module && value.module.radius && value.module.radius.value;
            this.selectExampleColor = value.selectExampleColor || 0;
        }
    }
}
</script>
<style lang="scss" scoped>
.point_hot_map {
    .point_hot_title {
        width: 100%;
        line-height: 20px;
        font-size: 14px;
        color: #38393c;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .point_hot_slider {
        width: 100%;
        margin-top: 20px;
    }
}
</style>