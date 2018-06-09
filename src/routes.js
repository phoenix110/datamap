import {paths} from "./assets/js/constants/Constants";

export default [
  {
    path: paths.login,
    component: require('./assets/vue/pages/login.vue')
  },
  {
    path: paths.home,
    component: require('./assets/vue/pages/home/workspace.vue'),
  },
  {
    path: paths.upload,
    component: require('./assets/vue/pages/home/upload.vue')
  },
  {
    path: paths.data,
    component: require('./assets/vue/pages/home/my-data.vue')
  },
  {
    path: paths.profile,
    component: require('./assets/vue/pages/home/profile.vue')
  },
  {
    path: paths.chart_detail,
    component: require('./assets/vue/pages/chart-detail.vue')
  },
  {
    path: paths.my_data,
    component: require('./assets/vue/pages/my-data-page.vue')
  },
  {
    path: paths.map_draw,
    component: require('./assets/vue/pages/data-map-draw.vue')
  },

]
