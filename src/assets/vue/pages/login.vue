<template>
    <f7-page login-screen @page:afterin="onPageAfterin" @page:beforeremove="onPageBeforeout">
        <f7-login-screen-title></f7-login-screen-title>
        <div>
            <f7-list form autocomplete="off">
                <f7-list-item class="username">
                    <span class="username-text">用户名</span>
                    <f7-input type="text" 
                        autocapitalize="off" autocomplete="off" 
                        autocorrect="off" spellcheck="false"
                        :value="name" @change="onChangeName"
                        @keyup.native.enter="onLogin"></f7-input>
                </f7-list-item>
                <f7-list-item class="password">
                    <span class="username-password">密码</span>
                    <f7-input type="password" :value="password" @change="onChangePass"
                        @keyup.native.enter="onLogin"></f7-input>
                </f7-list-item>
            </f7-list>
            <f7-list>
                <f7-list-button class="login_btn" @click.prevent="onLogin">账号登陆</f7-list-button>
                <f7-list-button class="wxlogin_btn" @click.prevent="onWechatLogin">微信登陆</f7-list-button>
            </f7-list>
        </div>
        <div v-if="fetching" class="login-loading-panel" @click.stop.prevent>
            <div class="loading-bg">
            </div>
        </div>
    </f7-page>
</template>
<script>
import '../../sass/login.scss'
import { mapState, mapActions } from 'vuex'
import {paths} from '../../js/constants/Constants'
import indexOf from 'lodash/indexOf'
import {login, wxlogin} from 'src/assets/apis/login'
import cookieUtil from '../../js/utils/cookieUtil'
import tokenUtil from '../../js/utils/tokenUtil'
import bus from '../../js/utils/bus';
import userUtil from '../../js/utils/userUtil';
import {login_type_wx, login_type_np} from '../../js/constants/Constants.js'
import { setTimeout } from 'timers';

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
        //监听401
        console.log('login mount');
        bus.$off('401');
        bus.$on('401', this.alert401);
        document.removeEventListener("deviceready", this.onDeviceReady);
        document.addEventListener("deviceready", this.onDeviceReady, false);
        document.addEventListener("keyboardWillShow", () => {
            this.$$(".login-screen-content")[0].style.paddingTop = "22.4vh";
        });
        document.addEventListener("keyboardDidHide", () => {
            this.$$(".login-screen-content")[0].style.paddingTop = "6.2vh";
        });
        if(!!this.$$(".login-screen-content")[0])
            this.$$(".login-screen-content")[0].style.paddingTop = "22.4vh";
    },
    methods: {
        alert401() {
            if (this.$f7router.currentRoute.path !== paths.login) {
                this.$f7.dialog.alert("登录信息失效,请重新登录", "提示", () => {
                    this && this.$f7router && this.$f7router.navigate(paths.login, { reloadCurrent: true });
                    bus.has401 = false;
                })
            }else{
                bus.has401 = false;
            }
        },
        addBackBtnListener() {
            let self = this;
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
        },
        onDeviceReady() {
            document.removeEventListener("backbutton", this.addBackBtnListener);
            //返回键点击响应
            document.addEventListener("backbutton", this.addBackBtnListener, false);
        },
        onPageAfterin() {
            console.log('login page after in');
            this.$$("html").addClass("no-statusbar");
            if (tokenUtil.get()) {
                this.$f7router.navigate(paths.home, {reloadCurrent:true});
                this.$$("html").removeClass("no-statusbar");
                this.userLogged(userUtil.get());
            }
            console.log('hide splashscreen later');
            setTimeout(() => {
                console.log('hide splashscreen now,', navigator.splashscreen);                
                navigator.splashscreen && navigator.splashscreen.hide();
            }, 300)
        },
        onPageBeforeout() {
            console.log('login unmount', JSON.stringify(this.$f7route));
            this.toastName && this.toastName.close();
            this.toastPass && this.toastPass.close();
            this.$$("html").removeClass("no-statusbar");
            console.log(this.$$("html").attr('class'));
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
            this.postToService(self.name, self.password, (resp) => {
                self.fetching = false;
                localStorage.setItem(user_pass, self.password);
                let userInfo = resp.obj.customer;
                userInfo.appId = resp.obj.apps.default.id;
                userUtil.set(userInfo);
                self.userLogged({...resp.obj.customer});
                self.$f7router.navigate(paths.home, {reloadCurrent:true});
            }, () => {
                 self.fetching = false;
            });
        },

        postToService(name, password, succ, fail) {
            let _this = this;
            login(name, password).then(resp => {
                if (resp.rc == 0) {
                    cookieUtil.setCookie("login_type", login_type_np);
                    succ && succ(resp);
                } else {
                    _this.loginError = _this.$f7.toast.create({
                        text: '用户名或密码错误!',
                        closeTimeout: 2000,
                        position: 'center',
                    });
                    _this.loginError.open();
                    fail && fail();
                }
            }).catch(err => {
                console.error(err);
                _this.netError = _this.$f7.toast.create({
                    text: '登录失败!',
                    closeTimeout: 2000,
                    position: 'center',
                });
                _this.netError.open();
                fail && fail();
            });
        },

        loginFailed(text) {
            this.openFailed = this.$f7.toast.create({
                text,
                closeTimeout: 2000,
                position: 'center',
            });
            this.openFailed.open();
            this.fetching = false;
        },

        onWechatLogin() {
            let _this = this;
            _this.fetching = true;
            if (!window.Wechat) {
                _this.fetching = false;
                 _this.loginFailed('暂不支持!');
                return;
            }
            window.Wechat.isInstalled(function(installed) {
                if (!installed) {
                    _this.loginFailed('微信未安装!');
                }else{
                    var scope = "snsapi_userinfo",
                        state = "_" + (+new Date());
                    Wechat.auth(scope, state, function (response) {
                        // you may use response.code to get the access token.
                        console.log(JSON.stringify(response));
                        wxlogin(response.code).then((resp) => {
                            console.log(JSON.stringify(resp));
                            if (resp.rc || resp.Status) {//出错
                                console.log('fetch access_token err:', JSON.stringify(resp));
                                _this.loginFailed(resp.obj || resp.Msg || '微信登陆失败');
                            }else {
                                cookieUtil.setCookie("login_type", login_type_wx);
                                let userInfo = resp.obj.customer;
                                userInfo.appId = resp.obj.apps.default.id;
                                userUtil.set(userInfo);
                                _this.userLogged({...resp.obj.customer});
                                _this.$f7router.navigate(paths.home, {reloadCurrent:true});
                                _this.fetching = false;
                            }
                        }).catch(err => {
                            console.log('fetch access_token err1:', err);
                            _this.loginFailed('请求出错!');
                        })
                    }, function (reason) {
                        console.log("Failed: " + reason);
                        _this.loginFailed('授权失败!');
                    });
                }
            }, function (reason) {
                console.log("Failed: " + reason);
                _this.loginFailed('微信是否安装校验失败!');
            })
        },

        ...mapActions(['userLogged'])
    },
};

</script>
