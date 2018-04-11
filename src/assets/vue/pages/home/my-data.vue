<template>
    <f7-page navbar-through toolbar-fixed tabs>
        <f7-navbar>
            <f7-nav-left>
            </f7-nav-left>
            <div class="title">数据</div>
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".md-searchbar-comp" icon-f7="search"></f7-link>
            </f7-nav-right>
            <f7-searchbar key="my_data_searchbar"
                          class="md-searchbar-comp"
                          search-container=".md-searchbar-comp-list"
                          search-in="a" expandable backdrop
                          disable-button-text="取消"
                          placeholder="搜索"
            >
            </f7-searchbar>
        </f7-navbar>
        <main-tabbar :selected-index="2"></main-tabbar>
    </f7-page>
</template>
<script>
    import mainTabbar from '../../components/main-tabbar.vue'

    export default {
        components: {
            'main-tabbar':mainTabbar,
        },
    };
</script>
