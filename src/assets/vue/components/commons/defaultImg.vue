<template>
    <div class="com-default-img-content" :style="{width: getSize('width'), height: getSize('height'), backgroundColor: bgc}">
        <img :class="{'img-show': imgShow}" :src="getSrc()" @load="onImgLoad" :alt="alt" @click="onClickImg"/>
        <div class="img-close-btn" v-if="closeIconShow && !notClose" @click.prevent="onCloseImg">
            <i class="f7-icons">close</i>
        </div>
    </div>
</template>
<script>
export default {
    name: "DefaultImg",
    props: {
        src: {
            type: String,
            default: ""
        },
        alt: {
            type: String,
            default: "",
        },
        size: {
            type: String,
            default: "100% 100%",
        },
        bgc: {
            type: String,
            default: "#fff",
        },
        width: {
            type: Number,
            default: 0,
        },
        height: {
            type: Number,
            default: 0,
        },
        dx: {
            type: Number,
            default: 0,
        },
        notClose: {
            type: Boolean,
            default: false,
        },
        resize: {
            type: Boolean,
            default: false,
        }
    },
    data(){
        return {
            imgShow: false,
            closeIconShow: false,
        }
    },
    methods: {
        onLoad(){},
        onCloseImg(){
            this.$emit("onCloseImg", this.dx);
        },
        onClickImg(){
            this.$emit("onClickImg", this.dx);
        },
        onImgLoad(){
            this.imgShow=true;
            this.closeIconShow = true;
        },
        getSize(key){
            return this[key] === 0 ? "100%" : (this[key]+'px');
        },
        getSrc(){
            let {resize, src, height, width} = this;
            return resize ? `${src}?x-oss-process=image/resize,m_fill,h_${height},w_${width}` : src;
        }
    }
}
</script>
<style lang="scss" scoped>
.com-default-img-content {
    background-image: url("../../../../static/images/img_loading_failed.svg");
    background-position: 50% 50%;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    position: relative;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: none;
        background-color: #fff;
    }
    &.img-show {
        opacity: 1;
        transition: opacity 1s;
    }
    .img-close-btn {
        width: 24px;
        height: 24px;
        top: 5px;
        right: 6px;
        text-align: center;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        background-color: #ffffff96;
        i {
            color: #000;
            font-size: 16px;
        }
    }
    .img-close-btn:hover {
        background-color: #ffffffc4;
    }
}
</style>