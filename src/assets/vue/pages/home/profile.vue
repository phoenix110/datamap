<template>
    <f7-page navbar-through toolbar-fixed tabs>
        <f7-navbar>
            <f7-nav-left>
                <f7-link class="panel-open" open-panel="left" icon="fa fa-bars"></f7-link>
            </f7-nav-left>
            <div class="title">我的</div>
            <f7-nav-right>
            </f7-nav-right>
        </f7-navbar>
        <f7-list>
			<f7-list-group v-if="user.name">
				<f7-list-item>ID: {{user.id}}</f7-list-item>
			  <f7-list-item>用户名: {{user.name}}</f7-list-item>
			</f7-list-group>
		</f7-list>	
        <f7-list>
            <f7-list-item  @click="logout">登出</f7-list-item>
        </f7-list>
        <main-tabbar :selected-index="3"></main-tabbar>
    </f7-page>
</template>
<script>
    import mainTabbar from '../../components/main-tabbar.vue'
    import {paths} from '../../../js/constants/Constants'
    import tokenUtil from '../../../js/utils/tokenUtil'
    import { mapState, mapActions } from 'vuex'

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
            }
        }
    };
</script>
