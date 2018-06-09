import { destroyVM } from '../../../../util'
import { mount } from '@vue/test-utils'
import FileLoad from 'components/workspace/file-panel/file-load'

describe('FileLoad.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(FileLoad)
    vm = wrapper.vm
    expect(wrapper.find(".file-load-panel").exists()).to.be.true;
  })

})
