import Vue from 'vue'
import { destroyVM } from '../../util'
import { shallowMount } from '@vue/test-utils'
import ChartDetail from 'pages/workspace/chart-detail'

describe('ChartDetail.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(ChartDetail, {mocks: {
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
