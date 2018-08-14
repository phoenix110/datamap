import { destroyVM } from '../../../../util'
import { shallowMount } from '@vue/test-utils'
import Steps from 'components/upload/normal/steps.vue'
describe('Steps.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(Steps, {
      propsData: {
          active: 1,
          data: [{text: '步骤一'}, {text: '步骤二'}]
    }
    })
    vm = wrapper.vm
    expect(wrapper.find('.mdt-steps-item-text').text()).to.equal('步骤一');
  })

})
