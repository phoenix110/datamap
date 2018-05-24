import Vue from 'vue'

import DataPie from "./workspace/pie/data-pie.vue";
import DataRadar from "./workspace/radar/data-radar.vue";
import DataBar from "./workspace/chart/data-bar.vue";
import DisplayTable from './workspace/table/display-table.vue';
import HotTable from './workspace/table/hot-table.vue';
import TableLoadPanel from './workspace/table/table-load.vue';
import FileLoadPanel from './workspace/file-panel/file-load.vue';
import IndexLoadPanel from './workspace/index-panel';
import GaugeLoadPanel from './workspace/gauge/gauge-panel.vue';
import GeoVisualizationMap from './workspace/map/geo-visualization-map.vue';
import InteractiveMap from './workspace/map/interactive-map.vue';
import PointCard from './commons/card-panel/point-card.vue';
import PointVisualTag from './commons/card-panel/visual/point-visual-card.vue';
import PointVisualization from './commons/card-panel/visual/point-visualization.vue';

let comInit = {
    install: function(Vue){
        Vue.component("DataPie", DataPie);
        Vue.component("DataRadar", DataRadar);
        Vue.component("DataBar", DataBar);
        Vue.component("DisplayTable", DisplayTable);
        Vue.component("HotTable", HotTable);
        Vue.component("TableLoadPanel", TableLoadPanel);
        Vue.component("FileLoadPanel", FileLoadPanel);
        Vue.component("IndexLoadPanel", IndexLoadPanel);
        Vue.component("GaugeLoadPanel", GaugeLoadPanel);
        Vue.component('GeoVisualizationMap', GeoVisualizationMap);
        Vue.component('InteractiveMap', InteractiveMap);
        Vue.component('PointCard', PointCard);
        Vue.component('PointVisualTag', PointVisualTag);
        Vue.component('PointVisualization', PointVisualization);
    }
}

export default comInit;