<template>
    <f7-page class="upload_page" navbar-through toolbar-through tabs
        @page:afterin="onPageAfterin" >
        <f7-navbar>
            <f7-subnavbar>
                <f7-searchbar key="upload_searchbar"
                              class="up-searchbar-comp"
                              search-container=".up-searchbar-comp-list"
                              disable-button-text="取消"
                              placeholder="搜索"
                              @searchbar:enable="enableTest"
                              @searchbar:disable="onSearchDisable"
                              @input="onSearchInput"
                              backdrop
                ></f7-searchbar>
            </f7-subnavbar>
        </f7-navbar>
        <div class="up-page-content">
            <mapPanel :mapProps="mapProps" v-if="initmap && !testModel" :searchContent="searchContent" :searchEnable="searchEnable" @panelCallBack="panelCallBack"></mapPanel>
        </div>
        <main-tabbar v-if="tabbarStatus && !searchEnable" :selected-index="1"></main-tabbar>
    </f7-page>
</template>
<script>
import mainTabbar from '../../components/main-tabbar.vue';
import mapPanel from '../../components/upload/map-panel.vue';
import '../../../sass/upload.scss';
import bus from '../../../js/utils/bus'

export default {
    components: {
        'main-tabbar':mainTabbar,
        mapPanel,
    },
    props: ["testModel"],
    data() {
        return {
            tabbarStatus: true,
            initmap: false,
            mapProps: {
                map_id: 'map_panel_1',
                mapStyle: "amap://styles/d4e9338d74853aa23bedaf367126e113",
                mapCenter: [121.3866647443, 31.1500060413],
                zoom: 9,
                setMapCenter: [110.3866647443, 34.1500060413],
                setZoom: 4,
                zooms: [4, 18],
                scrollWheel: true,
                userLocation: true,
            },
            searchEnable: false,
            searchContent: "",
        }
    },
    mounted(){
        bus.$on("listenerUploadTabbarStatus", (value) => {
            this.tabbarStatus = value;
        });
    },
    beforeDestroy(){
        bus.$off("listenerUploadTabbarStatus");
    },
    methods: {
        onPageAfterin() {
            this.initmap = true
            let nav_dom = this.$$(".navbar-current")[0];
            nav_dom && (nav_dom.style.height = 0);
        },
        onSearchDisable(){
            this.searchEnable = false;
            this.searchContent = "";
        },
        onSearchInput(e){
            this.searchContent = e.target.value;
        },
        enableTest(e){
            this.targetff = e;
            this.searchEnable=true;
        },
        panelCallBack(){
            this.targetff && this.targetff.disable();
        },
    }
};
</script>
