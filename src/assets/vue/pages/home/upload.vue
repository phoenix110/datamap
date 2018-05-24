<template>
    <f7-page class="upload_page" navbar-through toolbar-fixed tabs
        @page:afterin="onPageAfterin">
        <f7-navbar>
            <f7-subnavbar>
                <f7-searchbar key="upload_searchbar"
                              class="up-searchbar-comp"
                              search-container=".up-searchbar-comp-list"
                              disable-button-text="取消"
                              placeholder="搜索"
                              backdrop
                ></f7-searchbar>
            </f7-subnavbar>
        </f7-navbar>
        <div class="up-page-content">
            <mapPanel :mapProps="mapProps" v-if="initmap"></mapPanel>
        </div>
        <main-tabbar :selected-index="1"></main-tabbar>
    </f7-page>
</template>
<script>
import mainTabbar from '../../components/main-tabbar.vue';
import mapPanel from '../../components/upload/map-panel.vue';
import '../../../sass/upload.scss';

export default {
    components: {
        'main-tabbar':mainTabbar,
        mapPanel,
    },
    data() {
        return {
            initmap: false,
            mapProps: {
                map_id: 'map_panel_1',
                // mapStyle: "amap://styles/d65140aa79f193e1cd49a4142a54fb94",
                // mapStyle: "amap://styles/normal",
                mapStyle: "amap://styles/light",
                mapCenter: [121.3866647443, 31.1500060413],
                zoom: 10,
                scrollWheel: true,
                userLocation: true,
            }
        }
    },

    on: {
        pageAfterIn(event, pageData) {
            let nav_dom = this.$$(".navbar-current")[0];
            nav_dom && (nav_dom.style.height = 0);
        },
    },
    methods: {
        onPageAfterin() {
            this.initmap = true
        }
    }
};
</script>
