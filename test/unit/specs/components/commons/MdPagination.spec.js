import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../util'
import { mount } from '@vue/test-utils'
import MdPagination from 'components/commons/md-pagination'

describe('MdPagination.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(MdPagination, {propsData: {total: 0}})
    vm = wrapper.vm;
    expect(wrapper.find('.total').text()).to.equal('共 0 页');

    wrapper.setProps({total: 301});
    expect(wrapper.vm.totalPage).to.equal(26);

    const prependBtn = wrapper.find('.prepend-btn');
    prependBtn.trigger('click');
    expect(wrapper.vm.skipPage).to.equal(1);

    const appendBtn = wrapper.find('.append-btn');
    appendBtn.trigger('click');
    expect(wrapper.vm.skipPage).to.equal(2);

    prependBtn.trigger('click');
    expect(wrapper.vm.skipPage).to.equal(1);

    const input = wrapper.find('input')
    input.element.value = 12
    input.trigger('input')
    expect(wrapper.vm.skipBtnDis).to.be.false;

    const skipBtn = wrapper.find('.skip-btn');
    skipBtn.trigger('click');
    expect(wrapper.vm.skipPage).to.equal(12);
  })
})
