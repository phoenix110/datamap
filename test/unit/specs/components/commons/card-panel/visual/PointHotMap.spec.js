import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../../util'
import { mount } from '@vue/test-utils'
import PointHotMap from 'components/commons/card-panel/visual/point-hot-map.vue'

describe('PointHotMap.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PointHotMap, {propsData: {mData: {
        cur_visual: {
            title: "按面积",
            col: "area",
        },
        style: {
            icon: 'icon-location_1'
        },
        config_3: {
            "area": {
                range: [],
            }
        },
        config_4: {
            "area": {
                range: [],
            }
        },
        config_5: {
            "area": {
                range: [],
            }
        },
        data: [
            {area: 1.1},{area: 1.2},{area: 1.3},{area:1.4},
            {area: 2.1},{area: 3.2},{area: 4.3},{area:5.4},
            {area: 6.1},{area: 7.2},{area: 8.3},{area:9.4},
            {area: 11.1},{area: 12.2},{area: 13.3},{area:14.4}
        ]
    }, hotType: 4}});
    vm = wrapper.vm;
    expect(wrapper.find('.point_hot_title_text').text()).to.equal('按面积生成热力图');
  })
})
