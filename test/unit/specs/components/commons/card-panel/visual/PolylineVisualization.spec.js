import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../../util'
import { mount } from '@vue/test-utils'
import PolylineVisualization from 'components/commons/card-panel/visual/polyline-visualization.vue'

describe('PolylineVisualization.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PolylineVisualization, {propsData: {mData: {
        cur_visual: {
            title: "高度",
            col: "星巴克",
            type: 1,
        },
        style: {
            "color": "#FFA74F",
            "strokeStyle": "solid"
        },
        config_1: {
            "星巴克": {
                "domain": [1, 3, 5, 7, 10, 12, 14, 16],
                "range": ["rgb(59, 102, 233)", "rgb(114, 144, 229)", "rgb(164, 179, 222)", "rgb(204, 197, 209)", "rgb(228, 192, 187)", "rgb(236, 164, 156)", "rgb(235, 119, 118)", "#FF4F4F"]
            }
        },
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.line_visual_title_text').text()).to.equal('按高度可视化');
  })
})
