import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import DataPie from 'components/workspace/pie/data-pie'

describe('DataPie.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(DataPie)
    vm = wrapper.vm
    expect(wrapper.find('.chart_loading').exists()).to.be.true;
  })

})
