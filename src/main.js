import 'es6-promise/auto';
import './normalize';
require('./chcp');
// Import Vue
import Vue from 'vue'
// Import Framework7
import Framework7 from 'framework7/dist/framework7.esm.bundle.js';
// Import Framework7 Vue
import Framework7Vue from 'framework7-vue/dist/framework7-vue.esm.bundle.js';
// Import F7 Style
import Framework7CSS from 'framework7/dist/css/framework7.css'
// Import F7 iOS Icons
import Framework7Icons from 'framework7-icons/css/framework7-icons.css'
// Import Fontawesome Theme Styles
import FontAwesome from 'font-awesome/css/font-awesome.css'
import './assets/fonts/mdt_fonts/mdt_font.css';
// Import App Custom Styles
import './assets/sass/main.scss'
//Import simple-line-icons
import './static/simple-line-icons/css/simple-line-icons.css'
// Import App Component
import app from './main.vue'
// Import Routes
import routes from './routes.js'
// Import Vuex Storage
import store from './assets/vuex/storage.js'
//高德
import './assets/js/lib/amapvplugins-0.1.0';
// register echarts
import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/radar';
import 'echarts/lib/chart/gauge';
Vue.component('chart', ECharts);
import VChart from './assets/vue/components/vchart'
Vue.component('vchart', VChart);
// reqister common components
import comInit from './assets/vue/components/com-grobal-init.js';
comInit.install(Vue);

//系统错误捕获
import {sendToSlack} from './assets/js/utils/slackHooks'
const errorHandler = (error, vm)=>{
  console.error('reportError js err', error);
  sendToSlack({err: error});
}
Vue.config.errorHandler = errorHandler;
Vue.prototype.$throw = (error)=> errorHandler(error,this);

//rewrite Framework7 needsStatusbarOverlay
Framework7.device.needsStatusbarOverlay = function() {
  let device = Framework7.device;
  console.log('needsStatusbarOverlay:', device.webView, device.iphoneX, window.orientation);
  if (device.webView) {
    if (device.iphoneX && (window.orientation === 90 || window.orientation === -90)) {
      return false;
    }
    return true;
  }
  return false;
}
// Install Plugin
Vue.use(Framework7Vue, Framework7);

let theme = 'ios';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

console.log(process.env);

// Init Vue App
export default new Vue({
  // Root Element
  el: '#app',
  store,
  render: c => c('app'),
  components: {
    app,
  },
  framework7: {
    id: 'com.maicedata.datamap',
    theme, // md or ios
  },
  routes,
});
