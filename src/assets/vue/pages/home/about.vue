<template>
    <f7-page navbar-through toolbar-through tabs>
        <f7-navbar>
            <f7-nav-left>
                <f7-link  text="我的" back icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">关于Datamap</div>
            <f7-nav-right>
            </f7-nav-right>
        </f7-navbar>
        <div class="datamap_logo"></div>
        <div class="datamap_version">V 1.0.0</div>
        <div class="datamap_connect">联系方式：tangge@metrodata.cn</div>
    </f7-page>
</template>
<script>
export default {
    
}
</script>
<style lang="scss" scoped>
.datamap_logo {
    width: 254px;
    height: 59px;
    background-image: url("../../../../static/images/datamap_logo.svg");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin: auto;
    margin-top: 71px;
}
.datamap_version {
    color: #1F89F2;
    margin-top: 12px;
    font-size: 16px;
    text-align: center;
}
.datamap_connect {
    position: absolute;
    color: #97A1A7;
    font-size: 12px;
    text-align: center;
    left: 0;
    right: 0;
    bottom: 38px;
}
</style>
