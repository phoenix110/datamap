<template>
    <f7-page navbar-through toolbar-through @page:afterin="onPageAfterin">
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"  @click="onClickSave('back')"></f7-link>
            </f7-nav-left>
            <div class="title">{{title}}</div>
            <f7-nav-right v-if="saveBtn && !pageData.isStatic">
                <f7-link back text="保存" @click="onClickSave('save')"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <ChartPanel 
            :listData="pageData.data" :isDetailPg="pageData.isDetailPg" :geoFilters="pageData.geoFilters" :isStatic="pageData.isStatic" @setPageTitle="setPageTitle" 
            v-if="initChartPanel"
            ref="chartDetailPanel"></ChartPanel>
    </f7-page>
</template>

<script>
import bus from '../../../js/utils/bus';
import LazyloadEcharts from "../../components/lazyload-echarts";
import ChartPanel from "../../components/workspace/chart-panel.vue";
export default {
    name: "chart-detail",
    components: {LazyloadEcharts, ChartPanel},
    props: [],
    data(){
        return {
            pageData: {},
            title: '',
            initChartPanel: false,
            saveBtn: false,
        }
    },
    created(){
        if(this.$f7Route.context){
            this.pageData = this.$f7Route.context;
            this.saveBtn = this.$f7Route.context.data ? this.$f7Route.context.data.vault === 'interactive_map' : false;
        }
    },
    methods: {
        setPageTitle(vl){
            this.title = vl;
        },
        onPageAfterin(){
            this.initChartPanel = true;
        },
        onClickSave(type){
            bus.$emit("interactiveMapFilterBack", type);
            bus.$off("graphFilterListener");
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
