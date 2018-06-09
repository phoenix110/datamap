import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../../util'
import { mount } from '@vue/test-utils'
import PolylineVisualizationByType from 'components/commons/card-panel/visual/polyline-visualization-type.vue'

describe('PolylineVisualizationByType.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PolylineVisualizationByType, {propsData: {mData: {
        cur_visual: {
            title: "高度",
            col: "星巴克",
            type: 2,
        },
        style: {
            "color": "#FFA74F",
            "strokeStyle": "solid"
        },
        config_2: {
            "星巴克": {
                "domain": ["l1", "L10", "L11", "L12", "L13", "L16", "L2", "L3", "L4", "L5", "L6", "__other__"],
                "range": ["#FF4F4F", "#FFA74F", "#FFFF4F", "#A7FF4F", "#4FFF4F", "#4FFFA7", "#4FFFFF", "#4FA7FF", "#4F4FFF", "#A74FFF", "#FF4FFF", "#FF4FA7"]
            }
        },
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.line_visual_title_text').text()).to.equal('按高度可视化');
  })
})
