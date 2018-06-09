import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../util'
import { mount } from '@vue/test-utils'
import polylineCard from 'components/commons/card-panel/polyline-card.vue'

describe('polylineCard.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(polylineCard, {propsData: {iData: {
        object_type: '星巴克',
        filters: [
            {
                "uid": "filter_9e7e5541-67d3-11e8-b9f8-c96810f77aa0",
                "style": {
                    "strokeStyle": "solid",
                    "strokeWeight": 6,
                    "color": "#FF4F4F"
                },
                "filters":  [],
                "config_2": {
                    "美式": {
                        "domain": ["L1", "L10", "L11", "L12", "L13", "L16", "L2", "L3", "L4", "L5", "L6", "__other__"],
                        "range": ["#FF4F4F", "#FFA74F", "#FFFF4F", "#A7FF4F", "#4FFF4F", "#4FFFA7", "#4FFFFF", "#4FA7FF", "#4F4FFF", "#A74FFF", "#FF4FFF", "#FF4FA7"],
                        "visualize_type": 2,
                    }
                },
                "cur_visual": {
                    "col": "美式",
                    "title": "面包",
                    "type": 2,
                },
            }
        ]
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.polyline-card-title').text()).to.equal('星巴克');
  })
})
