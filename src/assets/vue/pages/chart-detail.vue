<template>
    <f7-page navbar-through toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回"></f7-link>
            </f7-nav-left>
            <div class="title">{{title}}</div>
        </f7-navbar>
        <ChartPanel :listData="pageData.data" :isDetailPg="pageData.isDetailPg" :isStatic="pageData.isStatic" @setPageTitle="setPageTitle"></ChartPanel>
    </f7-page>
</template>

<script>
import bus from '../../js/utils/bus';
import LazyloadEcharts from "../components/lazyload-echarts";
import ChartPanel from "../components/workspace/chart-panel.vue";
export default {
    name: "chart-detail",
    components: {LazyloadEcharts, ChartPanel},
    props: [],
    data(){
        return {
            pageData: this.$f7Route.context,
            title: ''
        }
    },
    methods: {
        setPageTitle(vl){
            this.title = vl;
        }
    }
}
</script>
<style lang="scss" scoped>
.title {
    max-width: 12em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
