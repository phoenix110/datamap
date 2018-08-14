import { destroyVM } from '../../util';
import { mount } from '@vue/test-utils';
import DataPackageCreate from 'pages/dataUpload/dataPackage-create.vue';

describe('DataPackageCreate.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(DataPackageCreate);
    vm = wrapper.vm;
    expect(wrapper.find('.title').text()).to.equal('新建数据包');
  })

})
