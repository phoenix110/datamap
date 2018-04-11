<template>
    <f7-page class="upload_page" navbar-through toolbar-fixed tabs>
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
        <main-tabbar :selected-index="1"></main-tabbar>
    </f7-page>
</template>
<script>
    import mainTabbar from '../../components/main-tabbar.vue'

    export default {
        components: {
            'main-tabbar':mainTabbar,
        },
        data() {
            return {
            }
        },
        on: {
            pageAfterIn(event, pageData) {
                let nav_dom = this.$$(".navbar-current")[0];
                nav_dom && (nav_dom.style.height = 0);
            },
        }
    };
</script>
