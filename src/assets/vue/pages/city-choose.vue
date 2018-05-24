<template>
    <f7-page navbar-through toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回"></f7-link>
            </f7-nav-left>
            <div class="title">城市选择</div>
            <f7-nav-right>
                <f7-link class="searchbar-enable" data-searchbar=".md-searchbar-comp" icon-f7="search"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <div class="current-city">当前城市：{{currentCity}}</div>
        <f7-list contacts>
            <f7-list-group v-for="(group, key) in contacts" :key="key">
                <f7-list-item :title="key" group-title></f7-list-item>
                <f7-list-item v-for="(name, i1) in group" :title="name" :key="i1"></f7-list-item>
            </f7-list-group>
        </f7-list>
    </f7-page>
</template>
<script>
let cityList = require('./../../js/constants/city')
export default {
    name: "city-choose",
    data(){
        return{
            contacts: cityList,
            currentCity: '上海',
        }
    }
}
</script>
<style lang='scss' scoped>
.current-city{
    width: 100%;
    line-height: 28px;
    background-color: #F3F2F3;
    border: 0px solid #979797;
    box-shadow: 0 2px 4px rgb(155, 155, 155);
    font-family: PingFang SC;
    font-size: 11px;
    font-weight: bold;
    color: #555555;
    box-sizing: border-box;
    padding-left: 15px;
}
.list{
    margin-top: 0;
    margin-bottom: 0;
    &>.list-group:first-child{
        .list-group-title{
            display: none;
        }
    }
}
</style>
