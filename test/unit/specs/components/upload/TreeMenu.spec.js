import { destroyVM } from '../../../util'
import { mount } from '@vue/test-utils'
import TreeMenu from 'components/upload/tree-menu'

describe('TreeMenu.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(TreeMenu)
    vm = wrapper.vm
    expect(wrapper.find(".tree-menu").exists()).to.be.true;
  })

})
