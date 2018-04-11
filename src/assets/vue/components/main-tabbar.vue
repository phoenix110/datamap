<template>
    <f7-toolbar tabbar labels bottom-md>
        <f7-link v-for="(item, index) in tab_menus"
                 tab-link
                 :href="item.href"
                 :icon-f7="index===selectedIndex ? item.icon+'_fill' : item.icon"
                 :text="item.title"
                 :tab-link-active="index===selectedIndex"
                 :key="item.id"
                 :animate="false"
        >
        </f7-link>
    </f7-toolbar>
</template>
<script>
    import {tab_menus} from '../../js/constants/Constants'
    export default {
        props: {
            selectedIndex: Number,
        },
        data() {
            return {
                tab_menus
            }
        },
    };

</script>
