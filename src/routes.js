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
    path: paths.about,
    component: require('./assets/vue/pages/home/about.vue'),
  },
  {
    path: paths.chart_detail,
    component: require('./assets/vue/pages/workspace/chart-detail.vue')
  },
  {
    path: paths.my_data,
    component: require('./assets/vue/pages/dataUpload/my-data-page.vue')
  },
  {
    path: paths.my_data_clause,
    component: require('./assets/vue/pages/myData/my-data-clause.vue')
  },
  {
    path: paths.my_data_detail,
    component: require('./assets/vue/pages/myData/my-data-detail.vue')
  },
  {
    path: paths.my_data_detail_cont,
    component: require('./assets/vue/pages/myData/my-data-detail-cont.vue')
  },
  {
    path: paths.mydata_edit_page,
    component: require('./assets/vue/pages/myData/mydata-edit-page.vue')
  },
  {
    path: paths.add_feeds,
    component: require('./assets/vue/pages/myData/add_feeds.vue')
  },
  {
    path: paths.map_draw,
    component: require('./assets/vue/pages/dataUpload/data-map-draw.vue')
  },
  {
    path: paths.create_dataPkg,
    component: require('./assets/vue/pages/dataUpload/dataPackage-create.vue')
  },
  {
    path: paths.upload_edit,
    component: require('./assets/vue/pages/dataUpload/upload-edit-page.vue'),
  },
  {
    path: paths.more_data,
    component: require('./assets/vue/pages/dataUpload/more-data-page.vue'),
  },
  {
    path: paths.picture_list,
    component: require('./assets/vue/pages/dataUpload/picture-list-page.vue'),
  },
  {
    path: paths.filters_page,
    component: require('./assets/vue/pages/workspace/filters-page.vue'),
  },
]
