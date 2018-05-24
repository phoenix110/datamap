<template>
    <f7-page login-screen @page:afterin="onPageAfterin" @page:beforeremove="onPageBeforeout">
        <f7-login-screen-title></f7-login-screen-title>
        <div>
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
                    <f7-link text="微信登陆" @click.prevent="onWechatLogin"></f7-link>
                </div>
            </f7-list>
        </div>
    </f7-page>
</template>
<script>
import '../../sass/login.scss'
import { mapState, mapActions } from 'vuex'
import {paths} from '../../js/constants/Constants'
import indexOf from 'lodash/indexOf'
import uniq from 'lodash/uniq'
import fetchUtil from '../../js/utils/fetchUtil';
import queryUrl from '../../js/utils/queryUrl';
import {getMd5Str} from '../../js/utils/strUtil';
import cookieUtil from '../../js/utils/cookieUtil'
import tokenUtil from '../../js/utils/tokenUtil'
import bus from '../../js/utils/bus';
import userUtil from '../../js/utils/userUtil';
import {model_api_url, headers, paramFake, mdtauth_api_url, auth, user_login, app_id} from '../../js/constants/ApiConfig';
import {login_type_wx, login_type_np} from '../../js/constants/Constants.js'

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
    },
    beforeDestroy() {
        
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
            if (this.$device.ios && window.StatusBar) {
                window.StatusBar.styleLightContent();
            }
            if (tokenUtil.get()) {
                this.$f7router.navigate(paths.home, {reloadCurrent:true});
                this.$$("html").removeClass("no-statusbar");
                this.userLogged(userUtil.get());
            }
        },
        onPageBeforeout() {
            console.log('login unmount', JSON.stringify(this.$f7route));
            this.toastName && this.toastName.close();
            this.toastPass && this.toastPass.close();
            this.$$("html").removeClass("no-statusbar");
            if (window.StatusBar) {
                window.StatusBar.styleDefault();
            }
            console.log(this.$$("html").attr('class'));
        },
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
            this.postToService(self.name, self.password, (resp) => {
                self.fetching = false;
                localStorage.setItem(user_pass, self.password);
                userUtil.set(resp.obj.customer);
                self.userLogged({...resp.obj.customer});
                self.$f7router.navigate(paths.home, {reloadCurrent:true});
            }, () => {
                 self.fetching = false;
            });
        },
       
        postToService(name, password, succ, fail) {
            let _this = this;
            let bodyData = JSON.stringify({name: name, password: getMd5Str(password), appid: app_id});
            let url = mdtauth_api_url + "login", urlData = {method: "POST", body: bodyData, headers};
            fetchUtil(url, urlData).then(resp => {
                let errorMsg = ''; // 记录日志
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

        loginByUnionId(unionid, openid, access_token) {
            this.fetching = false;
        },

        onWechatLogin() {
            let _this = this;
            _this.fetching = true;
            window.Wechat.isInstalled(function(installed) {
                if (!installed) {
                    _this.loginFailed('微信未安装!');
                }else{
                    var scope = "snsapi_userinfo",
                        state = "_" + (+new Date());
                    Wechat.auth(scope, state, function (response) {
                        // you may use response.code to get the access token.
                        console.log(JSON.stringify(response));
                        let postdata = {
                            code: response.code,
                        }
                        let url = `${model_api_url}mobile/auth/loginwx`;
                        fetchUtil(url, {method: 'POST', headers, body: JSON.stringify(postdata)}).then((resp) => {
                            console.log(JSON.stringify(resp));
                            if (resp.rc || resp.Status) {//出错
                                console.log('fetch access_token err:', JSON.stringify(resp));
                                _this.loginFailed(resp.obj || resp.Msg || '微信登陆失败');
                            }else {
                                cookieUtil.setCookie("login_type", login_type_wx);
                                userUtil.set(resp.obj.customer);
                                _this.userLogged({...resp.obj.customer});
                                _this.$f7router.navigate(paths.home, {reloadCurrent:true});
                                _this.fetching = false;
                            }
                        }).catch(err => {
                            console.log('fetch access_token err1:', err);
                            _this.loginFailed('授权失败222!');
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
