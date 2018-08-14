import Vue from 'vue'

import DataPie from "./workspace/pie/data-pie.vue";
import DataRadar from "./workspace/radar/data-radar.vue";
import DataBar from "./workspace/chart/data-bar.vue";
import DisplayTable from './workspace/table/display-table.vue';
import HotTable from './workspace/table/hot-table.vue';
import TableLoadPanel from './workspace/table/table-load.vue';
import FileLoadPanel from './workspace/file-panel/file-load.vue';
import IndexLoadPanel from './workspace/index-panel';
import ProgressLoadPanel from './workspace/progress/data-progress.vue';
import GaugeLoadPanel from './workspace/gauge/gauge-panel.vue';
import GeoVisualizationMap from './workspace/map/geo-visualization-map.vue';
import InteractiveMap from './workspace/map/interactive-map.vue';
import PointCard from './commons/card-panel/point-card.vue';
import PointVisualTag from './commons/card-panel/visual/point-visual-tag.vue';
import PointVisualization from './commons/card-panel/visual/point-visualization.vue';
import PoiHotMap from './commons/card-panel/visual/point-hot-map.vue';
import PolygonCard from './commons/card-panel/polygon-card.vue';
import PolygonVisualization from './commons/card-panel/visual/polygon-visualization.vue';
import PolygonVisualizationByType from './commons/card-panel/visual/polygon-visualization-type.vue';
import PolylineCard from './commons/card-panel/polyline-card.vue';
import PolylineVisualization from './commons/card-panel/visual/polyline-visualization.vue';
import PolylineVisualizationByType from './commons/card-panel/visual/polyline-visualization-type.vue';

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
        Vue.component("ProgressLoadPanel", ProgressLoadPanel);
        Vue.component("GaugeLoadPanel", GaugeLoadPanel);
        Vue.component('GeoVisualizationMap', GeoVisualizationMap);
        Vue.component('InteractiveMap', InteractiveMap);
        Vue.component('PointCard', PointCard);
        Vue.component('PointVisualTag', PointVisualTag);
        Vue.component('PointVisualization', PointVisualization);
        Vue.component('PoiHotMap', PoiHotMap);
        Vue.component('PolygonCard', PolygonCard);
        Vue.component('PolygonVisualization', PolygonVisualization);
        Vue.component('PolygonVisualizationByType', PolygonVisualizationByType);
        Vue.component('PolylineCard', PolylineCard);
        Vue.component('PolylineVisualization', PolylineVisualization);
        Vue.component('PolylineVisualizationByType', PolylineVisualizationByType);
    }
}

export default comInit;
