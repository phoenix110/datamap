import { destroyVM } from '../../util';
import { mount } from '@vue/test-utils';
import DataMapDraw from 'pages/dataUpload/data-map-draw.vue';

describe('DataMapDraw.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(DataMapDraw);
    vm = wrapper.vm;
    expect(wrapper.find('.title').text()).to.equal('绘制数据');
  })

})
