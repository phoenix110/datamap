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

  //example
  {
    path: '/main_test/',
    component: require('./assets/vue/pages/main_test.vue')
  },
  {
    path: '/about/',
    component: require('./assets/vue/pages/example/about.vue')
  },
  {
    path: '/form/',
    component: require('./assets/vue/pages/example/form.vue')
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: require('./assets/vue/pages/example/dynamic-route.vue')
  },
  {
    path: '/panel-left/',
    component: require('./assets/vue/pages/example/panel-left.vue')
  },
  {
    path: '/color-themes/',
    component: require('./assets/vue/pages/example/color-themes.vue')
  },
  {
    path: '/chat/',
    component: require('./assets/vue/pages/example/chat.vue')
  },
  {
    path: '/vuex/',
    component: require('./assets/vue/pages/example/vuex.vue')
  },
]
