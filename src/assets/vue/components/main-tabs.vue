<template>
    <f7-tabs routable>
        <f7-tab v-for="(item, index) in tab_menus"
                :id="item.id"
                :tab-active="index===selectedIndex"
                :key="item.id"
        >
        </f7-tab>
    </f7-tabs>
</template>
<script>
    import {tab_menus} from '../../js/constants/Constants'
    export default {
        props: {
            selectedIndex: Number,
        },
        data() {
            return {
                tab_menus,
            }
        },
    };

</script>
