import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import IndexPanel from 'components/workspace/index-panel/index'

describe('IndexPanel.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(IndexPanel)
    vm = wrapper.vm
    expect(wrapper.find('.index-load-panel').exists()).to.be.true;
  })

})
