import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../util'
import { mount } from '@vue/test-utils'
import ChartDetail from 'pages/chart-detail'

describe('ChartDetail.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(ChartDetail, {mocks: {
        $f7Route: {
            context: {
                isDetailPg: false,
                isStatic: true,
                data: {}
            }
        }
    }})
    vm = wrapper.vm;
    vm.setPageTitle("你好")
    expect(wrapper.find('.title').text()).to.equal('你好');
  })
})
