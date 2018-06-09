import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import DataRadar from 'components/workspace/radar/data-radar'

describe('DataRadar.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(DataRadar)
    vm = wrapper.vm
    expect(wrapper.find(".chart_loading").text()).to.equal("努力加载中...");
  })

})
