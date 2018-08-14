import Vue from "vue";
import { shallowMount, createLocalVue} from '@vue/test-utils'
import {destroyVM } from '../../../util'
import resourcesData from 'src/mocker/resourcesData.json'
import directoryConfigData from 'src/mocker/directoryConfigData.json'
const MyDataInjector = require('!!vue-loader?inject!pages/home/my-data.vue')
const localVue = createLocalVue()

const getResourcesData = () => {
  return new Promise((resolve) => {
    resolve(resourcesData);
  })
}
const fetchDirectoryConfigData = () => {
  return new Promise((resolve) => {
    resolve(directoryConfigData);
  })
}
const MyData = MyDataInjector({
  'src/assets/apis/myData': {getResourcesData, fetchDirectoryConfigData}
})

describe('MyData.vue',()=>{
  let vm
  afterEach( ()=>{
    destroyVM(vm)
  })

  it('should render', () => {
    const wrapper = shallowMount(MyData, {propsData:{testModel: true}})
    vm = wrapper.vm
    expect(wrapper.find(".content-list").exists()).to.be.true;
  })

  it('点击popover 改变type的分类', () => {
    const wrapper = shallowMount(MyData, {propsData:{testModel: true}})
    vm = wrapper.vm

    //打开模态框
    const rightBth = wrapper.find('.navbar .right a');
    rightBth.trigger("click");
    expect(vm.openedPop).to.be.true;

    //关闭模态框
    const popoverdom = wrapper.find(Vue.options.components.f7Popover);
    popoverdom.vm.$emit("popover:closed");
    expect(vm.openedPop).to.be.false;

    //点击改变key值
    const popItem = wrapper.find('.popover .list-button');
    popItem.trigger("click");
    expect(vm.openedPop).to.be.false;
  })
  it('搜索框事件', () => {
    const wrapper = shallowMount(MyData, {propsData:{testModel: true}})
    vm = wrapper.vm

    //存在searchbar
    const searchbarWrapper = wrapper.find(Vue.options.components.f7Searchbar);
    expect(searchbarWrapper.exists()).to.be.true;

    //enable
    searchbarWrapper.vm.$emit("searchbar:enable");
    expect(vm.searchpage).to.be.false;

    //change input
    const input = wrapper.find('input');
    input.element.value = 'some search';
    input.trigger("input");
    expect(vm.searchText).to.equal('some search');

    //clear
    searchbarWrapper.vm.$emit("searchbar:clear");
    expect(vm.searchText).to.equal('');

    //disable
    searchbarWrapper.vm.$emit("searchbar:disable");
    expect(vm.searchpage).to.be.true;

  })
})
