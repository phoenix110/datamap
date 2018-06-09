import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../../util'
import { mount } from '@vue/test-utils'
import PolygonVisualizationByType from 'components/commons/card-panel/visual/polygon-visualization-type.vue'

describe('PolygonVisualizationByType.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PolygonVisualizationByType, {propsData: {mData: {
        cur_visual: {
            title: "金额",
            col: "星巴克",
            type: 2,
        },
        style: {
            "color": "#FFA74F",
            "fillOpacity": 0.5,
            "strokeStyle": "solid"
        },
        config_2: {
            "星巴克": {
                "domain": [0, 1, 2, 3, 4, 5],
                "range": ["#FF4F4F", "#FFA74F", "#FFFF4F", "#A7FF4F", "#4FFF4F", "#4FFFA7", "#4FFFFF"]
            }
        },
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.poly_visual_title_text').text()).to.equal('按金额可视化');
  })
})
