import Vue from "vue";
import { destroyVM, triggerEvent } from '../../../util'
import { mount, shallowMount } from "@vue/test-utils"
const MyDataClauseInjector = require('!!vue-loader?inject!pages/myData/my-data-clause.vue')
import {MyCluseDataData, feedsCount, searchClusItems} from 'src/mocker/getMyCluseData'
const getCluseDataApi = () => {
  return new Promise((resolve) => {
    resolve({result: MyCluseDataData});
  })
}
const getFeedsColApi = () => {
  return new Promise((resolve) => {
    resolve({result: feedsCount});
  })
}
const fuzzySearchcluseApi = () => {
  return new Promise((resolve) => {
    resolve({result: searchClusItems});
  })
}
const MyDataClause = MyDataClauseInjector({
 'src/assets/apis/myDataCluse' : {getCluseDataApi , getFeedsColApi, fuzzySearchcluseApi}
})

describe('MyDataClause.vue',()=> {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(MyDataClause, {
      mocks: {
        $f7Route: {
          context: {
            myDataCluseValue: {
              geo_type: 'point',
              iconSkin: 'tree_poi_icon',
              id: "point_轨交站点流量（上海）_customer_",
              ids: 4202,
              isParent: false,
              name: "轨交站点流量（上海）",
              packageId: '',
              source: "customer"
            },
            package_id: 4202,
          }
        }
      }
    })
    vm = wrapper.vm;
    expect(wrapper.find('.detail_data_list').exists()).to.be.true;
  })

   it('searchbar事件', (done) => {
     //默认状态
       const wrapper = mount(MyDataClause, {
         mocks: {
           $f7Route: {
             currentRoute: {path: '/upload/'},
             context: {
               item:{
                 geo_type: 'point',
                 iconSkin: 'tree_poi_icon',
                 id: "point_轨交站点流量（上海）_customer_",
                 ids: 4202,
                 isParent: false,
                 name: "轨交站点流量（上海）",
                 packageId: '',
                 source: "customer"
               }
             }
           },
           $f7router: {
             navigate: function(){},
           }
         }
       })
       vm = wrapper.vm;
       expect(wrapper.find('.cluse-searchbar-comp.searchbar-expandable').exists()).to.be.true;
       //触发search bar
       const rightBth = wrapper.find('.navbar-inner .right a');
       rightBth.trigger('click');
       setTimeout(() => {
          const searchbarWrapper = wrapper.find('.searchbar.cluse-searchbar-comp.searchbar-expandable.searchbar-enabled')
          expect(searchbarWrapper.exists()).to.be.false;
              //change input
          const input = wrapper.find('input');
          input.element.value = 'some search';
          input.trigger("input");
          expect(vm.searchContent).to.equal('some search');
          done()
       }, 300)
   })

  it('addScrollListen on onPageAterin', ()=>{
    const wrapper = mount(MyDataClause, {
      mocks: {
        $f7Route: {
          currentRoute: {path: '/upload/'},
          context: {
            item:{
              geo_type: 'point',
              iconSkin: 'tree_poi_icon',
              id: "point_轨交站点流量（上海）_customer_",
              ids: 4202,
              isParent: false,
              name: "轨交站点流量（上海）",
              packageId: '',
              source: "customer"
            }
          }
        },
      }
    })
    vm = wrapper.vm;
    vm.onPageScroll({target: {scrollTop: 60}});
    expect()
  })

  it('emit pageAfterIn', done => {
    const wrapper = shallowMount(MyDataClause,{
      mocks: {
        $f7Route: {
          currentRoute: {path: '/upload/'},
          context: {
            item:{
              geo_type: 'point',
              iconSkin: 'tree_poi_icon',
              id: "point_轨交站点流量（上海）_customer_",
              ids: 4202,
              isParent: false,
              name: "轨交站点流量（上海）",
              packageId: '',
              source: "customer"
            }
          }
        },
      }
    })
    vm = wrapper.vm
    const pageWrapper = wrapper.find(Vue.options.components.f7Page);
    expect(pageWrapper.exists()).to.be.true
    setTimeout(() => {
      done();
    }, 400)
  })

  it('infiniteScroll', done => {
    const wrapper = shallowMount(MyDataClause,{
      mocks: {
        $f7Route: {
          currentRoute: {path: '/upload/'},
          context: {
            item:{
              geo_type: 'point',
              iconSkin: 'tree_poi_icon',
              id: "point_轨交站点流量（上海）_customer_",
              ids: 4202,
              isParent: false,
              name: "轨交站点流量（上海）",
              packageId: '',
              source: "customer"
            }
          }
        },
      }
    })
    vm = wrapper.vm;
    const wrap = wrapper.find('.myDataCaluse .infinite-scroll-content')
    wrapper.setData({pageNum:0,});
    expect(vm.pageNum).to.equal(0);
    wrapper.setData({searchAllowInfinite:false})
    wrap.trigger('infinite');
    expect(vm.searchAllowInfinite).to.be.false;
    setTimeout(() => {
      done();
    }, 400)
  })


})


