<template>
    <div class="chart_wrap" ref="dom">
        <div class="chart_inner">
            <EleChart
                :chartData="listData" :isDetailPg="!!isDetailPg ? true : false" :isStatic="isStatic" :cpRandom="cpRandom" :geoFilters="geoFilters" @setTitle="setTitle" :viewLoaded="loaded"></EleChart>
        </div>
    </div>
</template>
<script>
import bus from '../../../js/utils/bus';
import fetchUtil from '../../../js/utils/fetchUtil';
import {chart_type_statistics, chart_type_bar,
    chart_type_stack, chart_type_per_stack, chart_type_line,
    chart_type_pie_rose, chart_type_pie, chart_type_pie_circle,
    chart_type_gauge, chart_type_index, chart_type_radar,
    chart_type_display_table, chart_type_file, chart_type_hot_table, chart_type_progress,
    map_type_interactive, map_type_geo_visualization,filter_type_interactive_map, vault_geo_visualization, vault_interactive_map
} from '../../../js/constants/Constants.js';
import {model_api_url, headers, paramFake, static_map_url} from '../../../js/constants/ApiConfig';
import size from 'lodash/size';
const viewConfig = {
    [chart_type_statistics]: "TableLoadPanel",
    [chart_type_bar]: "DataBar",
    [chart_type_stack]: "DataBar",
    [chart_type_per_stack]: "DataBar",
    [chart_type_line]: "DataBar",
    [chart_type_pie]: "DataPie",
    [chart_type_pie_rose]: "DataPie",
    [chart_type_pie_circle]: "DataPie",
    [chart_type_gauge]: "GaugeLoadPanel",
    [chart_type_index]: "IndexLoadPanel",
    [chart_type_progress]: "ProgressLoadPanel",
    [chart_type_radar]: "DataRadar",
    [chart_type_display_table]: "DisplayTable",
    [chart_type_file]: "FileLoadPanel",
    [chart_type_hot_table]: "HotTable",
    [map_type_interactive]: "InteractiveMap",
    [map_type_geo_visualization]: "GeoVisualizationMap",
};
export default {
    name: "chart-panel",
    props: ["listData", "isDetailPg", "isStatic", "rfRandom", "geoFilters"],
    data(){
        return {
            loaded: false,
            testData: [],
            delayShow: false,
            cpRandom: this.rfRandom,
        }
    },
    watch: {
        rfRandom: function(newVl, oldVl){
            this.cpRandom = newVl;
        }
    },
    mounted(){
        let self = this;
        bus.$on('page_scroll', self.onPageScroll)
        this.onPageScroll();
    },
    beforeDestroy(){
        let self = this;
        this.timeoutId && clearTimeout(this.timeoutId);
        this.timeoutId = null;
        bus.$off('page_scroll', self.onPageScroll)
    },
    methods: {
        onPageScroll: function() {
            let dom = this.$refs.dom;
            let top = this.$$(dom).offset().top;
            if (!this.loaded && (top + 50 < this.$f7.height) && (dom.clientHeight + top > 0)) {
                if (!this.timeoutId) {
                    this.timeoutId = setTimeout(() => {
                        this.loaded = true;
                        this.timeoutId = null;
                    }, 250);
                }
            }else {
                this.timeoutId && clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        },
        setTitle(vl){
            this.$emit('setPageTitle', vl);
        }
    },
    components: {
        'EleChart': {
            props: ["chartData", "isDetailPg", "isStatic", "cpRandom", "geoFilters", "viewLoaded"],
            data(){
                return {
                    setProps: null,
                    panel_type: null,
                    chartTitle: "",
                }
            },
            watch: {
                cpRandom: function(){
                    this.getConfig();
                }
            },
            created(){

                this.getConfig();
            },
            methods: {
                getConfig(){
                    let _this = this;
                    let {chartData: {vault, graph, chart_type}, geoFilters} = _this;
                    if (vault === vault_interactive_map) {
                        if(_this.isStatic){
                            fetchUtil(`${model_api_url}vault/interactive_map/${graph}`)
                            .then(resp => {
                                if(!resp.Status){
                                    _this.setProps = {
                                        'config': resp.result[0] ? resp.result[0].extra : [],
                                        'thumb': _this.chartData.thumb,
                                        'is_static': true,
                                    };
                                    if(_this.isDetailPg){
                                        _this.chartTitle = _this.setProps.config.title;
                                        _this.$emit('setTitle', _this.setProps.config.title);
                                    }
                                }
                                else{
                                    _this.setProps = {};
                                }
                                _this.loaded = true;
                            })
                        }
                        else{
                            _this.setProps = _this.chartData;
                            if(_this.isDetailPg){
                                _this.chartTitle = _this.setProps.config.title;
                                _this.$emit('setTitle', _this.setProps.config.title);
                            }
                        }
                    } else if (vault === chart_type_file || vault === vault_geo_visualization) {
                        let vault = chart_type === chart_type_file ? 'files' : vault_geo_visualization;
                        fetchUtil(`${model_api_url}vault/${vault}/${graph}`)
                            .then(resp=>{
                                if(!resp.Status){
                                    let getData = resp.result[0] ? resp.result[0].extra : {};
                                    _this.setProps = Object.assign({}, _this.chartData, getData);
                                    if(_this.isDetailPg){
                                        _this.chartTitle = _this.setProps.title;
                                        _this.$emit('setTitle', _this.setProps.title);
                                    }
                                }
                                else{
                                    _this.setProps = {};
                                }
                                _this.loaded = true;
                            })
                    } else {
                        fetchUtil(`${model_api_url}vault/graph/${graph}`)
                            .then(resp => {
                                if(!resp.Status){
                                    _this.setProps = resp.result[0] ? resp.result[0].extra : [];
                                    if(!size(geoFilters.filters)){
                                        _this.geoFilters.filters = (resp.result[0] && resp.result[0].extra.filters) ? resp.result[0].extra.filters : [];
                                    }
                                    if(_this.isDetailPg){
                                        _this.chartTitle = _this.setProps.title;
                                        _this.$emit('setTitle', _this.setProps.title);
                                    }
                                }
                                else{
                                    _this.setProps = {};
                                }
                                _this.loaded = true;
                            })
                    }
                }
            },
            render: function(createElement){
                //根据vault/page接口返回的数据加载组件
                let type = this.chartData.vault === "graph" ? this.chartData.chart_type : this.chartData.vault;
                return createElement(viewConfig[type], {props: {"cData": this.setProps, "isDetailPg": this.isDetailPg, "geoFilters": this.geoFilters, chartTitle: this.chartTitle, viewLoaded: this.viewLoaded && this.loaded}});
            }
        },
    }
}
</script>
<style lang="scss" scoped>
.chart_wrap {
    width: 100%;
    height: 100%;
}
</style>
