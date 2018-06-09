import Vue from 'vue'
import { destroyVM, createTest, createVue } from '../../../../util'
import { mount } from '@vue/test-utils'
import PointCard from 'components/commons/card-panel/point-card'

describe('PointCard.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(PointCard, {propsData: {iData: {
        object_type: '麦当劳',
        filters: [
            {
                "uid": "filter_488ba780-4a93-11e8-b421-53b3297d5b7d",
                "style": {
                    "icon": {
                        "icon": "icon-location_1",
                        "content": "\\ue900"
                    },
                    "color": "#FF4F4F"
                },
                "filters":  [
                    {
                        "db": "str",
                        "key": "分类",
                        "h_type": "text",
                        "h_value": "分类",
                        "list": ["上海","武汉"]
                    },
                    {
                        "db": "int",
                        "key": "大类",
                        "h_type": "number",
                        "h_value": "大类",
                        "min": 1,
                        "max": 2,
                    },
                    {
                        "db": "int",
                        "key": "大类2",
                        "h_type": "number",
                        "h_value": "大类2",
                        "min": 1,
                    },
                    {
                        "db": "int",
                        "key": "大类3",
                        "h_type": "number",
                        "h_value": "大类3",
                        "max": 3,
                    },
                    {
                        "db": "int",
                        "key": "日期",
                        "h_type": "datetime",
                        "h_value": "日期",
                        "start": "20170501",
                        "end": "20170520"
                    }
                ]
            }
        ]
    }}})
    vm = wrapper.vm;
    expect(wrapper.find('.card-title').text()).to.equal('麦当劳');
    expect(wrapper.find('.visual-list').text()).to.equal('分类: 上海、武汉/大类: 1-2/大类2: 1以上/大类3: 3以下/日期: 20170501 - 20170520');
  })
})
