import Vue from 'vue'
import { destroyVM } from '../../util'
import { mount, shallowMount } from '@vue/test-utils'
// import MyDataPage from 'pages/dataUpload/my-data-page.vue'
import resourcesData from 'src/mocker/resourcesData.json'
import directoryConfigData from 'src/mocker/directoryConfigData.json'

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
const MyDataPageInjector = require('!!vue-loader?inject!pages/dataUpload/my-data-page.vue')
const MyDataPage = MyDataPageInjector({
  'src/assets/apis/myData': {getResourcesData, fetchDirectoryConfigData}
})

describe('MyDataPage.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', done => {
    const wrapper = shallowMount(MyDataPage, {mocks: {
      $f7Route: {
          context: {
            prePage: "MapDrawPanel",
          }
      }
    }})
    vm = wrapper.vm;
    setTimeout(() => {
      expect(wrapper.find('.page-content-list').exists()).to.be.true;
      done()
    }, 250)
  })
})
