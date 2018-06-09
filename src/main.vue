<template>
    <!-- App -->
    <div id="app">
        <f7-statusbar v-if="!isAndroid"></f7-statusbar>
        <div class="custom-statusbar" v-if="isAndroid && needStatusbarOverlay"></div>
        <f7-views>
            <f7-view main id="main-view" navbar-through :dynamic-navbar="true" url="/" class="ios-edges">
            </f7-view>
        </f7-views>
    </div>
</template>
<script>
import tokenUtil from './assets/js/utils/tokenUtil'
import { setTimeout } from 'timers';
export default {
    data() {
        return {
            isAndroid: this.$device.android,
            needStatusbarOverlay: false,
        }
    },
    mounted() {
        setTimeout(() => {
            let $startLoading = document.getElementById('start-loading-panel');
            $startLoading && $startLoading.remove();
        }, 250)
        let self = this;
        // this.needStatusbarOverlay = true;
        // self.$$("html").addClass("isandroid");
        document.addEventListener("deviceready", function(){
            console.log(`device.version: ${device.version}, isandroid: ${self.$device.android}`);
            setTimeout(() => {
                if (self.isAndroid && device.version >= '5.0') {
                    console.log(`device setoverlay`);
                    window.StatusBar && window.StatusBar.overlaysWebView(true);
                    self.needStatusbarOverlay = true;
                    self.$$("html").addClass("isandroid");
                    if (tokenUtil.get()) {
                        window.StatusBar && window.StatusBar.styleDefault();
                    }
                }else if (!self.isAndroid) {
                    if (tokenUtil.get()) {
                        window.StatusBar && window.StatusBar.styleDefault();
                    }
                }
            })
            window.addEventListener('keyboardDidShow', (ev) => {
                // Describe your logic which will be run each time when keyboard is about to be shown.
                setTimeout(function() {
                    document.activeElement.scrollIntoViewIfNeeded();
                }, 100);
            });
        }, false);
    },
}
</script>
