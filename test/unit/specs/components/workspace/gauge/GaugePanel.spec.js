import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import GaugePanel from 'components/workspace/gauge/gauge-panel'

describe('GaugePanel.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(GaugePanel)
    vm = wrapper.vm
    expect(wrapper.find(".chart_loading").text()).to.equal("努力加载中...");
  })

})
