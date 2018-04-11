<template>
    <f7-page login-screen>
        <f7-login-screen-title></f7-login-screen-title>
        <div v-if="login_type===1">
            <f7-list form>
                <f7-list-item>
                    <f7-input type="text" placeholder="用户名" autocapitalize="off" :value="name" @change="onChangeName"></f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-input type="password" placeholder="密码" :value="password" @change="onChangePass"></f7-input>
                </f7-list-item>
            </f7-list>
            <f7-list>
                <f7-list-button class="login_btn" @click.prevent="onLogin">登录平台</f7-list-button>
                <div class="text-right pr28i block">
                    <f7-link text="微信登陆" @click.prevent="onChangeLoginType(0)"></f7-link>
                </div>
            </f7-list>
        </div>
        <div v-else-if="login_type===0">
            <f7-list>
                <f7-list-button class="login_btn wx_login_btn">微信登陆</f7-list-button>
                <div class="text-right pr28i block">
                    <f7-link text="账号密码登录" @click.prevent="onChangeLoginType(1)"></f7-link>
                </div>
            </f7-list>
        </div>
        <div v-if="fetching" class="login-loading-panel" @click.stop.prevent>
            <div class="loading-bg">
            </div>
        </div>
    </f7-page>
</template>
<script>
    import '../../../assets/sass/login.scss'
    import { mapState, mapActions } from 'vuex'
    import {paths} from '../../js/constants/Constants'
    import indexOf from 'lodash/indexOf'

    const user_name = 'user_name';
    const user_pass = 'user_pass';

    export default {
        data() {
            return {
                login_type: 1, //0：微信登陆，1：账号密码登录
                name: localStorage.getItem(user_name)||'',
                password: localStorage.getItem(user_pass)||'',
                fetching: false,
            }
        },
        computed: {
            ...mapState({
                user: state => state.user
            })
        },
        mounted() {
            this.$$("html").addClass("no-statusbar");
            if (this.$device.ios && window.StatusBar) {
                window.StatusBar.styleLightContent();
            }
            let self = this;
            document.addEventListener("deviceready", function(){
                //返回键点击响应
                document.addEventListener("backbutton", function () {
                    //进入后台

                    console.log('current url: '+self.$f7router.currentRoute.url);
                    if (indexOf([paths.login, paths.home, paths.upload, paths.data, paths.profile], self.$f7router.currentRoute.url) != -1) {
                        navigator.Backbutton.goHome(function() {
                            console.log('go home success');
                        }, function() {
                            console.log('go home fail');
                        });
                    }else {
                        self.$f7router.back();
                    }
                }, false);
            }, false);
        },
        beforeDestroy() {
            this.toastName && this.toastName.close();
            this.toastPass && this.toastPass.close();
            this.$$("html").removeClass("no-statusbar");
//            this.$$(".custom-statusbar").addClass("blue");
            console.log(this.$$("html").attr('class'));
            if (window.StatusBar) {
                window.StatusBar.styleDefault();
            }
        },
        methods: {
            onChangeLoginType: function (lt) {
                this.login_type = lt
            },
            onChangeName: function (e) {
                this.name = e.target.value;
                localStorage.setItem(user_name, this.name)
            },
            onChangePass: function (e) {
                this.password = e.target.value;
            },
            onLogin: function () {
                let self = this;
                if (self.fetching) return;
                let {name, password} = self;
                if (!name) {
                    self.toastName = self.$f7.toast.create({
                        text: '请输入用户名',
                        position: 'center',
                        closeTimeout: 2000,
                    });
                    this.toastName.open();
                    return;
                }
                if (!password) {
                    self.toastPass = self.$f7.toast.create({
                        text: '请输入密码',
                        closeTimeout: 2000,
                        position: 'center',
                    });
                    this.toastPass.open();
                    return;
                }
                self.fetching = true;
                setTimeout(() => {
                    self.fetching = false;
                    localStorage.setItem(user_pass, self.password);
                    self.userLogged({name, id: '1'});
                    this.$f7router.navigate(paths.home, {reloadCurrent:true});
                }, 300)
            },
            ...mapActions(['userLogged'])
        },
    };

</script>
