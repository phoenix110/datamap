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
import Framework7CSS from 'framework7/dist/css/framework7.ios.min.css'
// Import App Custom Styles
import './assets/sass/main.scss'
// Import App Component
import app from './main.vue'
// Import Routes
import routes from './routes.js'
// Import Vuex Storage
import store from './assets/vuex/storage.js'
//高德
import './assets/js/lib/amapvplugins-0.1.0';
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
    id: 'com.metrodata.datamap',
    theme, // md or ios
  },
  routes,
});
