import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../../util'
import { mount } from '@vue/test-utils'
import PolygonVisualization from 'components/commons/card-panel/visual/polygon-visualization.vue'

describe('PolygonVisualization.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PolygonVisualization, {propsData: {mData: {
        cur_visual: {
            title: "金额",
            col: "星巴克",
            type: 1,
        },
        style: {
            "color": "#FF4F4F",
            "fillOpacity": 0.5,
            "strokeStyle": "solid"
        },
        config_1: {
            "星巴克": {
                "domain": [6000, 6429, 6857, 7286, 7714, 8143, 8571, 9000],
                "range": ["rgb(59, 102, 233)", "rgb(114, 144, 229)", "rgb(164, 179, 222)", "rgb(204, 197, 209)", "rgb(228, 192, 187)", "rgb(236, 164, 156)", "rgb(235, 119, 118)", "#FF4F4F"]
            }
        },
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.poly_visual_title_text').text()).to.equal('按金额可视化');
  })
})
