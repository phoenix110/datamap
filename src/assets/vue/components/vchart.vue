<template>
    <chart ref="chartWrap" :options="options" :theme="theme" :init-options="initOptions" :group="group" :auto-resize="autoResize" :watch-shallow="watchShallow" />
</template>
<script>
// register echarts
import Vue from 'vue';
import ECharts from 'vue-echarts/components/ECharts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/radar';
import 'echarts/lib/chart/gauge';

Vue.component('chart', ECharts);
export default {
    props: {
        options: Object,
        theme: [String, Object],
        initOptions: Object,
        group: String,
        autoResize: Boolean,
        watchShallow: Boolean
    },
    mounted() {
        window.addEventListener("resize", this.resize);
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.resize);
    },
    methods: {
        resize() {
            this.$refs.chartWrap && this.$refs.chartWrap.chart.resize();
        },
    }
}
</script>
