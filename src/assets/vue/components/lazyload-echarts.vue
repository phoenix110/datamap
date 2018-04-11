<template>
    <div class="chart_wrap" ref="dom">
        <div class="chart_loading" v-if="!loaded">
            <f7-preloader></f7-preloader>
            <span class="ml5">努力加载中...</span>
        </div>
        <div class="chart_inner" v-else>
            <chart ref="chart" :options="getOpt()" class="echarts_cus"></chart>
        </div>
    </div>
</template>
<script>
    import bus from '../../js/util/bus'

    export default {
        props: {
            item: Object,
            animate: Boolean,
        },
        data() {
            return {
                opts: {series: []},
                loaded: false,
            }
        },

        mounted() {
            let self = this;
            bus.$on('page_scroll', self.onPageScroll)
            this.onPageScroll();
        },
        beforeDestroy() {
            let self = this;
            clearTimeout(this.timeoutId);
            bus.$off('page_scroll', self.onPageScroll)
        },
        methods: {
            onPageScroll: function() {
                let dom = this.$refs.dom;
                let top = this.$$(dom).offset().top;
                if (!this.loaded && top + 50 < this.$f7.height ) {
                    this.timeoutId = setTimeout(() => {
                        this.loaded = true;
                    }, 250);
                }
            },
            getOpt() {
                let item = this.item;
                let animate = this.animate;
                let option = {
                    title: {
                        left: 'center',
                        text: '二手房挂牌房源' + item.title,
                        show: true,
                        textStyle: {color: '#333'},
                    },
                    grid: {containLabel: true, left: '6%', right: '6%', bottom: '6%'},
                    xAxis: [
                        {
                            type: 'category',
                            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                            axisPointer: {
                                type: 'shadow'
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '水量',
                            min: 0,
                            max: 250,
                            interval: 50,
                            axisLabel: {
                                formatter: '{value} ml'
                            }
                        },
                        {
                            type: 'value',
                            name: '温度',
                            min: 0,
                            max: 25,
                            interval: 5,
                            axisLabel: {
                                formatter: '{value} °C'
                            }
                        }
                    ],
                    series: [
                        {
                            name: '蒸发量',
                            type: 'bar',
                            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
                        },
                        {
                            name: '降水量',
                            type: 'bar',
                            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
                        },
                        {
                            name: '平均温度',
                            type: 'line',
                            yAxisIndex: 1,
                            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
                        }
                    ],
                    animation: animate,
                };
                return option;
            }
        }
    }
</script>
