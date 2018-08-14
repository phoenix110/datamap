<template>
    <f7-page navbar-through toolbar-through tabs>
        <f7-navbar>
            <div class="title">我的</div>
            <f7-nav-right>
            </f7-nav-right>
        </f7-navbar>
        <div class="user_card">
            <img class="user_card_pic" :src="user.profile||'./static/images/D.svg'"/>
            <div class="user_card_name">{{user.name}}</div>
        </div>
        <f7-list>
			<f7-list-group v-if="user.name">
			    <f7-list-item title="关于" link="#" @click.native="gotoAboutPage"></f7-list-item>
			</f7-list-group>
		</f7-list>
        <f7-list>
            <f7-list-item class="center_btn" @click="logout">退出登录</f7-list-item>
        </f7-list>
        <main-tabbar :selected-index="3"></main-tabbar>
    </f7-page>
</template>
<script>
    import mainTabbar from '../../components/main-tabbar.vue'
    import {paths} from '../../../js/constants/Constants'
    import tokenUtil from '../../../js/utils/tokenUtil'
    import { mapState } from 'vuex'

    export default {
        components: {
            'main-tabbar':mainTabbar,
        },
        computed: {
            ...mapState({
                user: state => state.user
            })
        },
        methods: {
            logout() {
                this.$f7router.navigate(paths.login, {reloadCurrent:true});
                tokenUtil.set("");
            },
            gotoAboutPage() {
                this.$f7router.navigate(paths.about);
            }
        }
    };
</script>
<style lang="scss" scoped>
.user_card {
    height: 76px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    background: #fff;
    margin-top: 24px;
    .user_card_pic {
        width: 45px;
        height: 45px;
        margin: 0 16px;
        border-radius: 50%;
    }
    .user_card_name {
        font-size: 18px;
        // font-weight: 500;
    }
}
</style>
