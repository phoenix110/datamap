import { destroyVM, triggerEvent} from '../../util'
import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import bus from 'src/assets/js/utils/bus'
import userUtil from 'src/assets/js/utils/userUtil'
import tokenUtil from 'src/assets/js/utils/tokenUtil'
import Vuex from 'vuex'
const localVue = createLocalVue()

localVue.use(Vuex)
const login = (name, pass) => {
  return new Promise((resolve, reject) => {
    if (name === 'mdt' && pass === 'mdt123') {
      resolve({rc: 0, obj: {apps: {default: {id: 63}}, customer: {id: 120, name}}});
    }else if (name === 'test'){
      resolve({rc: 1});
    }else {
      reject();
    }
  })
}
const wxlogin = (code) => {
  return new Promise((resolve, reject) => {
    if (code === '123') {
      resolve({rc: 0, obj: {apps: {default: {id: 63}}, customer: {id: 120, name:'mdt'}}});
    }else if (code === '234'){
      resolve({rc: 1});
    }else {
      reject();
    }
  })
}
const LoginInjector = require('!!vue-loader?inject!pages/login.vue')
const Login = LoginInjector({
  'src/assets/apis/login': {login, wxlogin}
})

window.navigator.splashscreen = {
  hide: function() {}
}

describe('Login.vue', () => {
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

  it('trigger deviceready backbutton 返回tab页', () => {
    const wrapper = shallowMount(Login,{
        store, localVue,
        mocks: {
            $f7router: {
                currentRoute: {url: '/detail/',},
                navigate: function(){},
                back: function(){},
            }
        }
    })
    vm = wrapper.vm;
    triggerEvent(document, 'deviceready');
    triggerEvent(document, 'backbutton');
    expect(wrapper.find('.login_btn').text()).to.equal('账号登陆');
  })
  it('trigger deviceready backbutton 返回主页', () => {
    const wrapper = mount(Login,{
      mocks: {
        $f7router: {
          currentRoute: {url: '/home/',},
          navigate: function(){},
          back: function(){},
        }
      }
    })
    vm = wrapper.vm;
    window.navigator.Backbutton = {
      goHome: function (succ, fail) {
        succ && succ();
      }
    }
    triggerEvent(document, 'deviceready');
    triggerEvent(document, 'backbutton');
    expect(wrapper.find('.login_btn').text()).to.equal('账号登陆');
  })
  it('登陆界面时不提示401', done => {
    const wrapper = mount(Login, {
        mocks: {
            $f7router: {
                currentRoute: {path: '/'}
            }
        }
    })
    vm = wrapper.vm;
    bus.$emit('401');
    setTimeout(() => {
        expect(wrapper.findAll('.dialog.modal-in .dialog-text').length).to.equal(0);
        done();
    })
  })

  it('不是登录页面时401提示', done => {
    const wrapper = mount(Login, {
        mocks: {
            $f7router: {
                currentRoute: {path: '/home/'},
                navigate: function(){}
            }
        }
    })
    vm = wrapper.vm;
    bus.$emit('401');
    setTimeout(() => {
        expect(wrapper.find('.dialog.modal-in .dialog-text').text()).to.equal("登录信息失效,请重新登录");
        done()
    })
  })

  it('trigger login 提示输入用户名', () =>{
    const wrapper = mount(Login, {
        mocks: {
            $f7router: {
                currentRoute: {path: '/home/'},
                navigate: function(){}
            }
        }
    })
    vm = wrapper.vm;
    wrapper.setData({name: "",password:""});
    wrapper.find('.login_btn a').trigger("click");
    expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("请输入用户名");
  })
  it('trigger login 提示输入密码', () =>{
    const wrapper = mount(Login, {
        mocks: {
            $f7router: {
                currentRoute: {path: '/home/'},
                navigate: function(){}
            }
        }
    })
    vm = wrapper.vm;
    wrapper.setData({name: "",password:""});
    const inputName = wrapper.find('input[type="text"]');
    inputName.element.value = 'test';
    inputName.trigger('change')
    wrapper.find('.login_btn a').trigger("click");
    expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("请输入密码");
  })
  it('trigger login failed', done =>{
    const wrapper = mount(Login, {
        mocks: {
            $f7router: {
                currentRoute: {path: '/home/'},
                navigate: function(){}
            }
        }
    })
    vm = wrapper.vm;
    const inputName = wrapper.find('input[type="text"]');
    inputName.element.value = 'test';
    inputName.trigger('change')
    expect(vm.name).to.equal("test");
    const inputPass = wrapper.find('input[type="password"]');
    inputPass.element.value = 'test';
    inputPass.trigger('change')
    expect(vm.password).to.equal("test");
    wrapper.find('.login_btn a').trigger("click");
    setTimeout(() => {
      expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("用户名或密码错误!");
      done()
    })
  })
  it('trigger login reject', done =>{
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        }
      }
    })
    vm = wrapper.vm;
    const inputName = wrapper.find('input[type="text"]');
    inputName.element.value = 'xxxxx';
    inputName.trigger('change')
    expect(vm.name).to.equal("xxxxx");
    const inputPass = wrapper.find('input[type="password"]');
    inputPass.element.value = 'xxxxx';
    inputPass.trigger('change')
    expect(vm.password).to.equal("xxxxx");
    wrapper.find('.login_btn a').trigger("click");
    setTimeout(() => {
      expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("登录失败!");
      done()
    })
  })
  it('trigger login success', done =>{
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
      }
    })
    userUtil.set({});
    vm = wrapper.vm;
    vm.userLogged = function() {};
    const inputName = wrapper.find('input[type="text"]');
    inputName.element.value = 'mdt';
    inputName.trigger('change')
    const inputPass = wrapper.find('input[type="password"]');
    inputPass.element.value = 'mdt123';
    inputPass.trigger('change')
    wrapper.find('.login_btn a').trigger("click");
    setTimeout(() => {
      let customer = userUtil.get();
      expect(customer.name).to.equal("mdt");
      done()
    })
  })
  it('onPageAfterin should has no error', () => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    tokenUtil.set("test");
    window.StatusBar = {
      styleLightContent: function () {}
    }
    vm.userLogged = function() {};
    vm.onPageAfterin();
  })
  it('onPageBeforeout should has no error', () => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    tokenUtil.set("test");
    window.StatusBar = {
      styleDefault: function () {}
    }
    vm.userLogged = function() {};
    vm.onPageBeforeout();
  })
  it('微信登陆检查微信安装失败', () => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    window.Wechat = {
      isInstalled:function(succ, fail) {
        fail && fail();
      }
    }
    wrapper.find('.wxlogin_btn .list-button').trigger("click");
    expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("微信是否安装校验失败!");
  })
  it('微信登陆检查微信未安装', () => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    window.Wechat = {
      isInstalled:function(succ, fail) {
            succ && succ(false);
      }
    }
    wrapper.find('.wxlogin_btn .list-button').trigger("click");
    expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("微信未安装!");
  })
  it('微信登陆微信授权失败', () => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    window.Wechat = {
      isInstalled:function(succ, fail) {
        succ && succ(true);
      },
      auth: function (scope, state, succ, fail) {
        fail && fail();
      }
    }
    wrapper.find('.wxlogin_btn .list-button').trigger("click");
    expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("授权失败!");
  })
  it('微信登陆微信授权api请求出错', done => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    window.Wechat = {
      isInstalled:function(succ, fail) {
        succ && succ(true);
      },
      auth: function (scope, state, succ, fail) {
        succ && succ({code: 'xxx'});
      }
    }
    wrapper.find('.wxlogin_btn .list-button').trigger("click");
    setTimeout(() => {
      expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("请求出错!");
      done()
    });
  })
  it('微信登陆微信授权api请求失败', done => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    window.Wechat = {
      isInstalled:function(succ, fail) {
        succ && succ(true);
      },
      auth: function (scope, state, succ, fail) {
        succ && succ({code: '234'});
      }
    }
    wrapper.find('.wxlogin_btn .list-button').trigger("click");
    setTimeout(() => {
      expect(wrapper.find('.toast.toast-center.modal-in').text()).to.equal("微信登陆失败");
      done()
    })
  })
  it('微信登陆微信授权api请求成功', done => {
    const wrapper = mount(Login, {
      mocks: {
        $f7router: {
          currentRoute: {path: '/home/'},
          navigate: function(){}
        },
        $device: {ios: true}
      }
    })
    vm = wrapper.vm;
    vm.userLogged = function() {};
    userUtil.set({});
    window.Wechat = {
      isInstalled:function(succ, fail) {
        succ && succ(true);
      },
      auth: function (scope, state, succ, fail) {
        succ && succ({code: '123'});
      }
    }
    wrapper.find('.wxlogin_btn .list-button').trigger("click");
    setTimeout(() => {
      let customer = userUtil.get();
      expect(customer.name).to.equal("mdt");
      done()
    })
  })
})
