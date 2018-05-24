<template>
    <chart ref="chartWrap" :options="options" :theme="theme" :init-options="initOptions" 
           :group="group" :auto-resize="autoResize"
           :watch-shallow="watchShallow"/>
</template>
<script>
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
            this.$refs.chartWrap.chart.resize();
        }
    }
}
</script>
