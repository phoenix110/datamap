import Vue from 'vue'
import { destroyVM, createTest, createVue , triggerEvent} from '../../util'
import VChart from 'components/vchart'

describe('VChart.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    vm = createTest(VChart, {options: {series: []}}, true)
    triggerEvent(window, 'resize');
  })
})
