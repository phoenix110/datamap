import { destroyVM } from '../../../../util'
import { shallowMount } from '@vue/test-utils'
import UploadInputPanel from 'components/upload/normal/upload-input-panel.vue'
describe('UploadInputPanel.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(UploadInputPanel)
    vm = wrapper.vm
    expect(wrapper.find('.panel-title-text').text()).to.equal('必填信息*');
  })

})
