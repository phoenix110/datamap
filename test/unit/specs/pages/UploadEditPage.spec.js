import Vue from 'vue'
import { destroyVM } from '../../util'
import { mount } from '@vue/test-utils'
import UploadEditPage from 'pages/dataUpload/upload-edit-page.vue';

describe('UploadEditPage.vue', () => {
  let vm
  
  afterEach(() => {
    destroyVM(vm)
  })

  it('should render correct contents', () => {
    const wrapper = mount(UploadEditPage, {mocks: {
        $f7Route: {
            context: {
                tableInfo: {
                    geo_type: 'point',
                    name: "上传数据表"
                },
                up_object: {
                    getPosition(){
                        return ['121.03058420274324', '31.366711656673544']
                    }
                },
            }
        }
    }})
    vm = wrapper.vm;
    expect(wrapper.find('.upload-edit-btn').exists()).to.be.true;
  })
})
