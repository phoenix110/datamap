<template>
    <f7-page class="add-feeds" data-page="add-feeds" navbar-through toolbar-through 
        @page:afterin="onPageAfterin">
        <f7-navbar>
            <f7-nav-left>
                <f7-link  text="返回" back icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">添加评论</div>
            <f7-nav-right>
                <f7-link  back text="发表" @click.prevent="publicationFeeds"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <div class="edit-content">
            <f7-input type="textarea" placeholder="添加评论...." resizable :value="feedsValue"
                @input="feedsValue = $event.target.value" ></f7-input>
        </div>
    </f7-page>
</template>
<script>
    import trim from 'lodash/trim';
    import queryUrl from '../../../js/utils/queryUrl';
    import fetchUtil from '../../../js/utils/fetchUtil';
    import bus from '../../../js/utils/bus'
    import { getCenterLngLat } from '../../../js/utils/mapPanel'
    import {model_api_url, headers, paramFake, static_map_url, fakeParamObj} from '../../../js/constants/ApiConfig';
    import '../../../sass/add_feeds.scss'
    export default {
        name:'AddFeeds',
        props:[],
        data() {
            return {
                feedsValue:'',
                feedExtra:null,
            }
        },
        computed:{//计算属性

        },
        components: {//引用子组件

        },
        created(){//组件上树之前
            this.feedExtra = this.$f7Route.context.feedsExtra

        },
        mounted(){//上树之后

        },

        methods: {
            publicationFeeds(){
                if(!!this.feedsValue && trim(this.feedsValue)){
                    let lnglat = getCenterLngLat(this.feedExtra);
                    if(!lnglat) return;
                    let lng = lnglat[0];
                    let lat = lnglat[1];
                    let data= {
                        "feed_type": "text_comment",
                        "extra": {"text": this.feedsValue},
                        "lng": lng,
                        "lat": lat
                    };
                    fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/${this.feedExtra.id}`,),
                        {method: 'POST', headers, body: JSON.stringify(data)})
                        .then(resp => {
                            bus.$emit('feedTip');
                        }).catch(err => {
                        console.error(err);
                    })
                }
            },
            onPageAfterin() {
                this.$$('.add-feeds textarea').focus();
            }
        }
    };
</script>

<style lang="scss" scoped>
    .add-feeds{
        .edit-content{
            height:100%;
            overflow:hidden;
        }
    }


</style>

