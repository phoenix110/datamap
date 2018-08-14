import Vue from "vue";
import { destroyVM, triggerEvent } from '../../../util'
import { mount, shallowMount } from "@vue/test-utils"
import {geo_types, geoTypesMap, paths, GlobalKeys, } from 'assets/js/constants/Constants';
import global from 'assets/js/utils/global';
import MapPanelCom from 'components/commons/map-panel-comp.vue';
import UploadBtnWrap from 'components/upload_comp/upload-btn-wrap';

const getSingleData = () => {
  return new Promise((resolve) => {
    resolve({result: []});
  }) 
}
const getImgList = () => {
  return new Promise((resolve) => {
    resolve({result: []});
  }) 
}
const getuserInfo = () => {
  return new Promise((resolve) => {
    resolve({result: []});
  }) 
}
const getFeeds = () => {
  return new Promise((resolve) => {
    resolve({result: []});
  }) 
}
const getFeedCount = () => {
  return new Promise((resolve) => {
    resolve({result: []});
  }) 
}

const MyDataDetailInjector = require('!!vue-loader?inject!pages/myData/my-data-detail.vue')
const MyDataDetail = MyDataDetailInjector({
  'src/assets/apis/myDataDetail' : {getSingleData, getImgList, getuserInfo, getFeeds, getFeedCount}
 })

describe('MyDataDetail.vue',()=> {
    let vm

    afterEach(() => {
      destroyVM(vm)
    })

    it('渲染地图和UploadBtnWrap组件',()=>{
      global.set(GlobalKeys.package_id, 122);
      global.set(GlobalKeys.record_id, 122);
      const wrapper = mount(MyDataDetail)
      vm = wrapper.vm
      expect(wrapper.contains(MapPanelCom)).to.be.true;
      expect(wrapper.contains(UploadBtnWrap)).to.be.true;
    })

    it('beforeDestroy',() => {
      const wrapper = mount(MyDataDetail)
      vm = wrapper.vm
      expect(vm.toastBottom).to.not.equal(null);
      vm.toastBottom && vm.toastBottom._destory();
      vm.toastBottom = null;
      expect(vm.toastBottom).to.equal(null)
    })

    it('hidePreloader',()=>{
       const wrapper = mount(MyDataDetail)
       vm = wrapper.vm;
       vm.allowInfinite = true;
       const preLoad = wrapper.find('.preloader.infinite-scroll-preloader')
       vm.hidePreloader();
       expect(preLoad.hasStyle('display','none')).truthy;
    })
   
})
