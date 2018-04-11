<template>
    <f7-page navbar-through toolbar-fixed tabs>
        <f7-navbar>
            <f7-nav-left>
                <f7-link class="panel-open" open-panel="left" icon="fa fa-bars"></f7-link>
            </f7-nav-left>
            <div class="title">我的</div>
            <f7-nav-right>
            </f7-nav-right>
        </f7-navbar>
        <main-tabbar :selected-index="3"></main-tabbar>
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
