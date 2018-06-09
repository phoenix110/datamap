import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../util'
import { mount } from '@vue/test-utils'
import polygonCard from 'components/commons/card-panel/polygon-card.vue'

describe('polygonCard.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(polygonCard, {propsData: {iData: {
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
                    "摩卡": {
                        "domain": [0, 1, 2, 3, 4, 5, 6],
                        "range": ["#FF4F4F", "#FFA74F", "#FFFF4F", "#A7FF4F", "#4FFF4F", "#4FFFA7", "#4FFFFF"],
                        "visualize_type": 2,
                    }
                },
                "cur_visual": {
                    "col": "摩卡",
                    "title": "吐司",
                    "type": 2,
                },
            }
        ]
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.polygon-card-title').text()).to.equal('星巴克');
  })
})
