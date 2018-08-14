import { destroyVM } from '../../../util'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Profile from 'pages/home/profile'
import tokenUtil from 'src/assets/js/utils/tokenUtil'
import Vuex from 'vuex'
const localVue = createLocalVue()

localVue.use(Vuex)

describe('Profile.vue', () => {
  let vm
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        user: {id: 1, name: 'name'}
      },
    })
  })

  afterEach(() => {
    destroyVM(vm)
  })

  it('logout should clear token', () => {
    const wrapper = shallowMount(Profile, {
      store, localVue,
      mocks: {
        $f7router: {
          navigate: function(){}
        },
      }
    })
    vm = wrapper.vm
    tokenUtil.set("test");
    wrapper.find(".center_btn .item-content").trigger("click")
    expect(tokenUtil.get()).to.equal("");
  })

})
