import { destroyVM, triggerEvent} from '../../../util'
import { shallowMount, mount, createLocalVue} from '@vue/test-utils'
import Workspace from 'pages/home/workspace'
import Vue from "vue";
const localVue = createLocalVue()


describe('Workspace.vue', () => {
  let vm

  afterEach(() => {
    destroyVM(vm)
  })

  it('should render', done => {
    const wrapper = shallowMount(Workspace)
    vm = wrapper.vm
    wrapper.vm.getPageList([{title: 'pagename', id: 0}])
    setTimeout(() => {
      expect(wrapper.find(".workspace-nav-tit span").text()).to.equal("pagename");
      done();
    }, 350)
  })

  it('emit search event', () => {
    const wrapper = shallowMount(Workspace)
    vm = wrapper.vm
    wrapper.vm.getPageList([{title: 'pagename', id: 0}])
    const searchbarWrapper = wrapper.find(Vue.options.components.f7Searchbar);
    expect(searchbarWrapper.exists()).to.be.true
    //enable
    searchbarWrapper.vm.$emit("searchbar:enable");
    expect(vm.searchpage).to.be.true;
    //change input
    const input = wrapper.find('input');
    input.element.value = 'some search';
    input.trigger("input");
    expect(vm.searchContent).to.equal('some search');
    //clear
    searchbarWrapper.vm.$emit("searchbar:clear");
    expect(vm.searchContent).to.equal('');
    //disable
    searchbarWrapper.vm.$emit("searchbar:disable");
    expect(vm.searchpage).to.be.false;

  })

  it('emit pageAfterIn', done => {
    const wrapper = shallowMount(Workspace, {localVue})
    vm = wrapper.vm
    vm.$$ = function (selector) {
      return vm.$el.querySelectorAll(selector);
    };
    const pageWrapper = wrapper.find(Vue.options.components.f7Page);
    expect(pageWrapper.exists()).to.be.true
    pageWrapper.vm.$emit("page:afterin");
    expect(vm.pageContent).to.equal(undefined);
    setTimeout(() => {
      expect(vm.pageContent).to.not.equal(undefined);
      triggerEvent(vm.pageContent, "scroll")
      pageWrapper.vm.$emit("page:beforeout");
      expect(vm.pageContent).to.equal(null);
      done();
    }, 400)
  })

  it('click page title should show select panel', () => {
    const wrapper = mount(Workspace)
    vm = wrapper.vm
    wrapper.vm.getPageList([{title: 'pagename', id: 0}])
    const navTitle = wrapper.find('.workspace-nav-tit')
    navTitle.trigger("click");
    expect(vm.open).to.be.true;
    const searchBtn = wrapper.find('.searchbar-enable');
    searchBtn.trigger('click');
    expect(vm.open).to.be.false;
    searchBtn.trigger('click');
    expect(vm.open).to.be.false;
  })

  it('trigger methods should has no error', () => {
    const wrapper = mount(Workspace)
    vm = wrapper.vm
    vm.onRefresh();
    expect(vm.reRandom).to.not.equal('');
    vm.onSelectPage({id: 2});
    expect(vm.selectedPageId).to.equal(2);
  })

})
