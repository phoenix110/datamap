<template>
    <div class="sketch-board">
        <div class="sketch-board-temp" v-for="(vl, dx) in contentList" :key="dx">
            <div class="sketch-board-temp-color" :style="{backgroundColor: colorList[dx]}"></div>
            <div class="sketch-board-temp-text">{{vl}}</div>
        </div>
    </div>
</template>
<script>
export default {
    name: "SketchBoard",
    props: ["colorList", "contentList"],
    data(){
        return {}
    }
}
</script>
<style lang="scss" scoped>
.sketch-board {
    width: 100%;
    display: inline-flex;
    position: relative;
    font-size: 12px;
    color: #000;
    .sketch-board-temp {
        height: 41px;
        flex: 1;
        .sketch-board-temp-color {
            height: 10px;
            margin-bottom: 8px;
        }
        .sketch-board-temp-text {
            transform: translate3d(-50%, 0, 0);
            text-align: center;
        }
    }
    &>.sketch-board-temp:last-child {
        position: absolute;
        height: 23px;
        right: -13px;
        bottom: 0;
        .sketch-board-temp-color {
            display: none;
        }
        .sketch-board-temp-text {
            transform: translate3d(0, 0, 0);
        }
    }
}
</style>