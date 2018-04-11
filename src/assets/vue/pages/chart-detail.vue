<template>
    <f7-page navbar-through toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回"></f7-link>
            </f7-nav-left>
            <div class="title">二手挂牌房源价格分布</div>
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
        <lazyload-echarts class="echart_card_detail" :item="{title:'test'}" animate></lazyload-echarts>
    </f7-page>
</template>

<script>
    import LazyloadEcharts from "../components/lazyload-echarts";
    export default {
        name: "chart-detail",
        components: {LazyloadEcharts}
    }
</script>
