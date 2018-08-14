import Vue from 'vue';
import { mount } from '@vue/test-utils'
import { destroyVM } from '../../../util'
import  MydataEditPage from 'pages/myData/mydata-edit-page'



describe('MydataEditPage.vue',()=>{
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('内容部分渲染正确',()=>{
    const wrapper = mount(MydataEditPage,{
      mocks : {
        $f7route : {
          context : {
            coverExtra : {
              object_type : "one_point_address",
              name : 1,
              id : 4493752,
              extra:{
                '属性':'商业',
                '开发商':'中建',
              },
              geometry:{
                type : 'Point',
                coordinates : [121.514596462,31.2767614683]
              },
            }
          }
        }
      }
    });
    vm = wrapper.vm;
    expect(wrapper.find(".upload-edit-btn").exists()).to.be.true;
  })
})
