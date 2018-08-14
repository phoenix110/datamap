<template>
    <f7-page  @page:afterin="onPageAfterin"
              @page:beforeout="onPageBeforeout"
              class="my-data-detail"
              data-page="my-data-detail"
              navbar-through 
              toolbar-through
              infinite
              infinite-scroll
              @infinite="infiniteScroll"
              >
        <f7-navbar>
            <f7-nav-left>
                <f7-link text="返回" back icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">数据信息-{{detailData.name}}</div>
        </f7-navbar>
        <div class="map-content" slot="fixed">
            <map-panel-comp ref="upload_map_detail"
                            :loading="false"
                            :mapProps="mapProps">
            </map-panel-comp>
        </div>
       <div class="list-content" >
           <div class="itemInfo">
               <div class="detai-title detailTit">
                   <div class="name">{{detailData.name}}</div>
                   <div class="more" @click="navigate">明细<f7-icon f7="right"></f7-icon></div>
               </div>
               <div class="imageInfo">
                   <div class="top">
                       <UploadBtnWrap  @onChoose="onChoose">
                           <div class="add">添加照片</div>
                       </UploadBtnWrap>
                       <f7-link @click="onClickLink('look')">
                           <div class="readAll"><span>查看</span>全部</div>
                       </f7-link>
                   </div>
                   <div v-if="currentList.length==0" class="noPic">暂无图片</div>
                   <f7-swiper v-else
                              :params="{slidesPerView:3, spaceBetween:10, speed:300}">
                       <f7-swiper-slide v-for="(item, key) in currentList" :key="key"
                            @click.native="onClickPicture(key)">
                           <!--<div class="imageExtra" :style="{backgroundImage:'url(' + item.extra.url +'?x-oss-process=image/resize,m_fill,h_100,w_150'+ ')',  }"></div>-->
                           <img :src="item.extra.url+'?x-oss-process=image/resize,m_fill,h_92,w_116'"
                                :alt="item.extra.text"
                                style="width:100%;height:100%;object-fit: cover;"
                                >
                       </f7-swiper-slide>
                       <f7-swiper-slide class='showMore' v-show="imgList.length>5">
                           <f7-link  @click="onClickLink('look')">查看更多>></f7-link>
                       </f7-swiper-slide>
                   </f7-swiper>
               </div>
           </div>
           <div class="clist " v-show="feedsItem.length !== 0">
               <div class="title">评论 ({{allCount || 0}})条</div>
               <div class="comment" v-for="(item,key) in feedsItem" :key="key">
                   <img :src="userExtra[item.user_id] && userExtra[item.user_id].profile || './static/images/D.svg'" alt="替换文本"/>
                   <div class="detail">
                       <div class="top">
                           <span class="name">{{userExtra[item.user_id] && userExtra[item.user_id].name || ''}}</span>
                           <span class="time">{{item.update_time}}</span>
                       </div>
                       <div class="text">
                           <span>{{item.extra.text}}</span>
                       </div>
                   </div>
               </div>
                <div v-show='allowInfinite' class="my-detail preloader infinite-scroll-preloader"/>
           </div>
       </div>
        <f7-toolbar bottom-md class="addFeeds">
            <f7-link hidden></f7-link>
            <f7-link @click="getAddFeedsPage" class=" button-raised open-toast-bottom">添加评论</f7-link>
            <f7-link hidden></f7-link>
        </f7-toolbar>
        <f7-photo-browser 
            ref="large_pic"
            :init="true"
            :photos="imgList" 
            theme="dark" 
            type="page"
            :toolbar="false"
            :expositionHideCaptions="false"
            ofText="cehsi"
            backLinkText="返回"
        ></f7-photo-browser>
    </f7-page>
</template>

<script>
    import forEach from 'lodash/forEach'
    import map from 'lodash/map'
    import size from 'lodash/size'
    import MapPanelCom from '../../components/commons/map-panel-comp.vue';
    import UploadBtnWrap from '../../components/upload_comp/upload-btn-wrap'
    import {geo_types, geoTypesMap, paths, GlobalKeys, } from '../../../js/constants/Constants';
    import {readFileAsImageAllPlatform, uploadFilePromise} from '../../components/upload_comp/util.js'
    import bus from '../../../js/utils/bus';
    import {getSingleData, getImgList, getuserInfo, getFeeds, getFeedCount} from 'src/assets/apis/myDataDetail';
    import '../../../sass/my-data-detail.scss'
    import global from '../../../js/utils/global';
    const pageSize = 20;
    export default {
        name:'MyDataDetail',
        props:[],
        data() {
            return {
                mapProps:{
                    map_id: 'map_panel_detail',
                    mapStyle: "amap://styles/d4e9338d74853aa23bedaf367126e113",
                    mapCenter: [121.3866647443, 31.1500060413],
                    zoom: 9,
                    setMapCenter: [110.3866647443, 34.1500060413],
                    setZoom: 5,
                    zooms: [4, 18],
                    scrollWheel: true,
                    userLocation: true,
                },
                feedsItem:[],
                pageNum:0,
                allowInfinite:true,
                imgList:[],
                userInfo:[],
                userExtra:{},
                allCount: 0,
                detailData:{},
                package_id:'',
                record_id:'',
            }
        },
        computed:{//计算属性
            currentList:function(){
                return this.imgList.slice(0,5)
            }
        },
        components: {//引用子组件
           'map-panel-comp' : MapPanelCom,
            UploadBtnWrap,
        },

        created(){//组件上树之前
            this.mapProps.map_id = 'mdt' +  new Date();
            this.package_id = JSON.parse(global.get(GlobalKeys.package_id));
            this.record_id = JSON.parse(global.get(GlobalKeys.record_id));
            this.getSingleData();
            this.getFeeds();
            this.getFeedCount();
            this.getImgList();
        },
        mounted(){
            bus.$on('feedTip', this.onFeedTip);
        },
        beforeDestroy() {
            this.toastBottom && this.toastBottom.destroy();
            this.toastBottom = null;
            bus.$off('feedTip', this.onFeedTip);
        },
        methods: {

            onClickPicture(dx){
                this.$refs.large_pic.f7PhotoBrowser.params.photos = map(this.imgList, vl => ({
                    name: "",
                    text: vl.extra.text,
                    url: vl.extra.url,
                }));
                this.openPhotoBrowser(dx);
            },
            openPhotoBrowser(dx){
                this.$refs.large_pic.open(dx);
                this.$refs.large_pic.f7PhotoBrowser.on("slideChange", this.onSlideChange);
                this.$$(".photo-browser-current")[0].style.display = "none";
                this.$$(".photo-browser-total")[0].style.display = "none";
                this.$$(".photo-browser-of")[0].innerHTML = this.imgList[dx].extra.name || '';
            },
            onSlideChange(){
                let dx = this.$refs.large_pic.f7PhotoBrowser.activeIndex;
                this.$$(".photo-browser-of")[0].innerHTML = this.imgList[dx].extra.name || '';
            },

            onFeedTip() {
                this.toastBottom && this.toastBottom.destroy();
                this.toastBottom = this.$f7.toast.create({
                    text: '评论成功',
                    cssClass:"feedSucessTip",
                    closeTimeout: 2000,
                    destroyOnClose:true,
                    position:'bottom',
                })
                this.toastBottom.open();
                this.pageNum = 0;
                this.feedsItem = [];
                this.getFeeds();
                this.getFeedCount();
            },

            hidePreloader(){
                forEach(this.$$('.my-data-detail .preloader.infinite-scroll-preloader'),(item, index)=>{
                    item.style.display = "none"
                });
            },
            showPreloader(){
                this.$$('.my-data-detail .list-content .my-detail.preloader.infinite-scroll-preloader')[0].style.display='block';
            },
            getAddFeedsPage(){
                this.$f7Router.navigate(paths.add_feeds,{context:{feedsExtra:this.detailData}})
            },
            getSingleData(){
                getSingleData(this.package_id, this.record_id).then(resp => {
                        if(resp.result){
                            this.detailData = resp.result;
                            this.$refs.upload_map_detail && this.$refs.upload_map_detail.addcoverExtraToMap(this.detailData);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
            },
            getImgList(){//获得图片评论
                getImgList(this.record_id).then(resp => {
                        if(resp.result && resp.result.length){
                            this.imgList = resp.result;
                        };
                    })
                    .catch(err => {
                        console.error(err);
                    })
            },
            getuserInfo(ids){//批量获取用户信息
                if (!size(ids)) return;
                getuserInfo(ids).then(resp => {
                        if(resp.result){
                            forEach(resp.result, t => {
                                this.userExtra[t.id] = t;
                            })
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
            },
            getFeeds(){//获得评论
                getFeeds(this.record_id, this.pageNum, pageSize).then(resp => {
                        if(resp.result && resp.result.length){
                            let newFeedsItem = this.feedsItem.concat(resp.result);
                            this.feedsItem = newFeedsItem;
                            this.allowInfinite = true;
                            ++this.pageNum;
                        }
                        this.hidePreloader();
                        this.getuserInfo(resp.user_ids);
                    })
                    .catch(err => {
                        console.error(err);
                        this.hidePreloader()
                    })
            },
            getFeedCount() {
                //先加上统计，稍后写入apis
                let rid = this.record_id;
                getFeedCount(rid).then(resp => {
                    if (resp && resp.result) {
                        this.allCount = resp.result[rid].text_comment;
                    }
                })
            },
            infiniteScroll(){
                let _this = this;
                this.$$('.my-data-detail .infinite-scroll-content').on('infinite',function(){
                    if(!_this.allowInfinite) return;
                    _this.allowInfinite = false;
                    _this.showPreloader();
                    _this.getFeeds()
                })
            },
            onClickLink(type,files){
                let {detailData} = this;
                if(type === 'add'){
                    this.$f7Router.navigate(paths.picture_list,{context:{item: detailData, MyDataCluse: this.detailData, source:'album',files}})
                }else if(type === 'look'){
                    this.$f7Router.navigate(paths.picture_list,{context:{item: detailData, source:'look'}})
                }
            },
            onChoose(files) {
                this.getImgPath(files);
            },
            getImgPath(files){
                this.onClickLink('add',files)
            },
            onPageAfterin(){
                this.$f7.infiniteScroll.destroy(".my-data-detail .infinite-scroll-content");
                this.$f7.infiniteScroll.create('.my-data-detail .infinite-scroll-content');
                this.infiniteScroll();
                this.getImgList();
                this.$refs.upload_map_detail.addcoverExtraToMap(this.detailData);
            },
            onPageBeforeout() {
                this.$f7.infiniteScroll.destroy(".my-data-detail .infinite-scroll-content");
            },
            navigate(){
               this.$f7Router.navigate(paths.my_data_detail_cont);
            },
        }
    };
</script>

<style lang="scss" scoped>
        .map-content{
            position: fixed;
            width: 100%;
            height: calc(100vh - 240px);
            z-index: 10;
        }
        .list-content{
            width: 100%;
            height: auto;
            position: absolute;
            top: calc(100vh - 243px);
            z-index: 11;
            box-shadow:0px -1px 3px rgba(1, 1, 1, 0.05);
        }
        .addFeeds{
            position: absolute;
            bottom:0px;
            width:100%;
            height:50px;
            text-align:center;
        }
        .itemInfo{
            position: relative;
            border-top:1px solid #D2D3D6;
            padding: 0px 16px 0px;
            background-color:rgba(255,255,255,0.9);
            font-family:'PingFang SC';
            .toolbars{
                display: flex;
                justify-content: center;
                i{
                    position: absolute;
                    top: 6px;
                    width: 36px;
                    height: 5px;
                    background: #CBCDCC;
                    border-radius: 4px;

                }
            }
            .detailTit{
                border-bottom:1px solid #C8C7CC;
            }
            .detai-title{
                display: flex;
                justify-content: space-between;
                margin-bottom:4px;
                line-height: 44px;
                font-family:'PingFang SC';
                color:#000;
                .name{
                    font-size:17px;
                    font-weight:bold;
                }
                .more{
                    position: relative;
                    right: 5px;
                    font-size:14px;
                    color:#007AFF;
                    .icon.f7-icons{
                        left:10px;
                        font-size:14px;
                        font-weight:bold;
                    }
                }
            }
            .imageInfo{
                padding-bottom: 5px;
                .top{
                    display:flex;
                    justify-content: space-between;
                    line-height: 32px;
                    font-size:13px;
                    color:#007AFF;
                    .readAll{
                        span{
                            color:#D2D3D6;
                        }
                    }
                }
                .imageExtra{
                    width:100%;
                    height:100%;
                    background-repeat:no-repeat;
                    background-positon:center center;
                    background-size: contain;
                }
                .showMore{
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    a{
                        color:#C8C7CC;
                    }
                }
            }

            .swiper-container{
                height:102px;
            }
            .noPic{
                display: flex;
                justify-content: space-around;
                align-items:center;
                height:106px;
                font-size:14px;
                color:#C8C7CC;
            }
        }
        .clist{
            padding: 6px 16px 0px;
            background-color:rgba(255,255,255,0.9);
            font-family:"PingFang SC";
            margin-bottom:44px;
            .title{
                border-top:1px solid #CDCED2;
                padding-top:12px;
                font-size:15px;
                line-height:21px;
            }
            .comment{
                display: flex !important;
                flex-direction:row;
                border-bottom:1px solid #C8C7CC;
                padding:12px 0px;
                img{
                    width:30px;
                    height:30px;
                    border-radius:30px;
                }

                .detail{
                    flex:1;
                    position:relative;
                    width:auto;
                    margin-left:8px;
                    .top{
                        display: flex;
                        justify-content:space-between;
                        .name{
                            font-size:15px;
                            line-height:21px;
                            color:#313131;
                            margin-bottom:6px;
                        }
                        .time{
                            font-size:10px;
                            color:#555555;
                            line-height:14px;
                        }
                    }
                    .text{
                        font-size:12px;
                        color:#555555;
                        line-height:18px;
                    }
                    .feedImg{
                        display: flex;
                        justify-content:space-between;
                        margin-top:16px;
                        img{
                            width:94px;
                            height: 94px;
                            margin-left:5px;
                        }
                    }
                    .feedAllImg{
                        position: absolute;
                        right: 10px;
                        bottom: 10px;
                        z-index: 99;
                        width:30px;
                        line-height:14px;
                        background-color:rgba(0,0,0,0.8);
                        border-radius:5px;
                        color:#fff;
                        text-align:center;
                        span{
                            font-size:8px;
                        }
                    }
                }
            }
        }


</style>

