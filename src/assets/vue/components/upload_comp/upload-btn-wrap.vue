<template>
    <div class="upload_btn_wrap">
        <input ref="input" class="upload_btn_wrap_input" type="file" multiple
                @change="processFile($event)"
                accept="image/*"
                v-if="!isNative"/>
        <button class="upload_btn_wrap_button" 
                @click="choosePictures"
                v-else
                >
            选择照片
        </button>
        <div class="upload_btn_wrap_content"><slot></slot></div>
    </div>
</template>
<script>
import {isCordovaDevice, getFileFromPath} from './util.js'
export default {
    props: {
    },
    data() {
        return {
            isNative: isCordovaDevice(),
        }
    },
    methods: {
        processFile(event) {
            let files = event.target.files;
            let copyFiles = [...files];
            this.$refs.input.value = null;
            this.$emit("onChoose", copyFiles);
        },
        choosePictures() {
            window.ImagePicker.getPictures((results) => {
                this.$emit("onChoose", results.images);
            }, function(err) {
                // alert(err);
            }, { 
                maximumImagesCount : 9, 
                width : 1920, 
                height : 1440, 
                quality : 80 
            });
        },
    }
}
</script>
<style lang="css" scoped>
    .upload_btn_wrap {
        position: relative;
    }
    .upload_btn_wrap_input, .upload_btn_wrap_button {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        z-index: 1;
        opacity: 0;
    }
    .upload_btn_wrap_content {
        position: relative;
    }
</style>

