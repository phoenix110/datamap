<template>
    <div class="com_slider">
        <div class="com_slider_prepend">
            <div class="slider_heat_icon" :style="{'backgroundImage': `url(./static/images/heat_icon/heat_icon_${color}.png)`}"></div>
        </div>
        <div class="com_slider_content">
            <div class="slider-line">
                <div class="line">
                    <div class="color-line" :style="{'width': value <= 2 && max ? 0 : value/max*100+'%'}"></div>
                </div>
                <div class="pointer" :style="{'left': value/max*100+'%'}"></div>
            </div>
            <div class="slider-scale">
                <li v-for="(vl, dx) in sliderMarksList" :key="dx">{{vl}}</li>
            </div>
        </div>
        <div class="com_slider_append">
            <div class="slider_heat_icon" :style="{'backgroundImage': `url(./static/images/heat_icon/heat_icon_${color}.png)`}"></div>
        </div>
    </div>
</template>
<script>
export default {
    name: "Slider",
    props: ['sliderMarksList', 'value', 'color', 'max', 'min'],
    data(){
        return {}
    },
}
</script>
<style lang="scss" scoped>
.com_slider {
    width: 100%;
    height: 45px;
    display: inline-flex;
    .com_slider_prepend {
        width: 25px;
        height: 25px;
        padding-top: 6px;
        box-sizing: border-box;
        .slider_heat_icon {
            width: 12px;
            height: 11px;
            background-size: 100% 100%;
        }
    }
    .com_slider_append {
        width: 36px;
        height: 25px;
        .slider_heat_icon {
            width: 25px;
            height: 100%;
            margin-left: 11px;
            background-size: 100% 100%;
        }
    }
    .com_slider_content {
        flex: 1;
        height: 100%;
        .slider-line {
            width: 100%;
            height: 25px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            .line {
                width: 100;
                height: 1px;
                background-color: #abe2fb;
                .color-line {
                    height: 1px;
                    background-color: #ff0000;
                }
            }
            .pointer {
                position: absolute;
                top: 5px;
                width: 6px;
                height: 15px;
                background-color: #ff0000;
            }
        }
        .slider-scale {
            width: 100%;
            line-height: 20px;
            display: inline-flex;
            justify-content: space-between;
            li {
                list-style-type: none;
                font-size: 12px;
            }
        }
    }
}
</style>