import Vue from 'vue'
import comInit from 'assets/vue/components/com-grobal-init.js';


describe('com-grobal-init.js', () => {
    it('should render correct contents', () => {
        comInit.install(Vue);
        expect(Vue.options.components.DataPie.name).to.equal('VueComponent')
        expect(Vue.options.components.DataRadar.name).to.equal('VueComponent')
        expect(Vue.options.components.DataBar.name).to.equal('VueComponent')
        expect(Vue.options.components.DisplayTable.name).to.equal('VueComponent')
        expect(Vue.options.components.HotTable.name).to.equal('VueComponent')
        expect(Vue.options.components.TableLoadPanel.name).to.equal('VueComponent')
        expect(Vue.options.components.FileLoadPanel.name).to.equal('VueComponent')
        expect(Vue.options.components.IndexLoadPanel.name).to.equal('VueComponent')
        expect(Vue.options.components.GaugeLoadPanel.name).to.equal('VueComponent')
        expect(Vue.options.components.GeoVisualizationMap.name).to.equal('VueComponent')
        expect(Vue.options.components.InteractiveMap.name).to.equal('VueComponent')
        expect(Vue.options.components.PointCard.name).to.equal('VueComponent')
        expect(Vue.options.components.PointVisualTag.name).to.equal('VueComponent')
        expect(Vue.options.components.PointVisualization.name).to.equal('VueComponent')
    })
})
  