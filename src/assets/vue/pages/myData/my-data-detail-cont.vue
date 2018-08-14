<template>
    <f7-page class="detail-con"
             data-page="detail-con"
             navbar-through
             toolbar-fixed
             @page:afterin="onPageAfterin">
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <f7-nav-left>
                <f7-link   text="编辑" @click="navigateToEdit"></f7-link>
            </f7-nav-left>
        </f7-navbar>
        <div slot="fixed" class="map-contents">
            <map-panel-comp
                    ref="my_data_detailInfo"
                    :mapProps="mapProps"
                    :showCover="true"
                    :loading="false"
            ></map-panel-comp>
        </div>
        <div class="pageItemList">
            <div class="upload-edit-base">
                <div class="base-info-name-input">
                    <div class="title-text">地块名称</div>
                    <input :value="detailConData.name" disabled/>
                </div>
                <div class="base-info-lng"  v-if="pointType">
                    <div class="title-text">经度</div>
                    <input :value="pointLng" disabled/>
                </div>
                <div class="base-info-lat"  v-if="pointType">
                    <div class="title-text" >纬度</div>
                    <input :value="pointLat" disabled/>
                </div>
                <div class="base-info-lat">
                    <div class="title-text">用地性质</div>
                    <input :value="detailConData.object_type" disabled/>
                </div>
                <div class="base-info-lat" v-for="(item , key) in detailConData.extra" :key="key">
                    <div class="title-text">{{key}}</div>
                    <input :value="item" disabled/>
                </div>
            </div>
        </div>
    </f7-page>
</template>
<script>
    import MapPanelCom from '../../components/commons/map-panel-comp.vue';
    import { getCenterLngLat } from '../../../js/utils/mapPanel'
    import { paths, GlobalKeys } from '../../../js/constants/Constants';
    import queryUrl from '../../../js/utils/queryUrl';
    import fetchUtil from '../../../js/utils/fetchUtil';
    import {model_api_url, } from '../../../js/constants/ApiConfig';
    import bus from '../../../js/utils/bus';
    import global from '../../../js/utils/global';
    export default {
        name:'my_data_detail_con',
        props:[ ],
        data() {
            return {
                mapProps:{
                    map_id: 'mdt' + new Date(),
                    mapStyle: "amap://styles/d4e9338d74853aa23bedaf367126e113",
                    mapCenter: [121.3866647443, 31.1500060413],
                    zoom: 9,
                    setMapCenter: [110.3866647443, 34.1500060413],
                    setZoom: 5,
                    zooms: [4, 18],
                    scrollWheel: true,
                    userLocation: true,
                },
                detailConData:{},
                pointType:false,
                pointLng:'',
                pointLat:'',
                package_id:"",
                record_id:'',

            }
        },
        components: {
            'map-panel-comp' : MapPanelCom,
        },
        created(){
            this.package_id = JSON.parse(global.get(GlobalKeys.package_id));
            this.record_id = JSON.parse(global.get(GlobalKeys.record_id));
            this.getSingleData();
            bus.$on('forceDetailData', this.getSingleData)
        },
        beforeDestroy(){
            bus.$off('forceDetailData', this.getSingleData);
        },
        methods:{
            onPageAfterin(){
                this.pointType  = this.detailConData.geometry.type === 'Point' ? true : false;
                if(this.pointType){
                    let poi = getCenterLngLat(this.detailConData);
                    this.pointLng = poi[0];
                    this.pointLat = poi[1];
                };
                this.$refs.my_data_detailInfo.addcoverExtraToMap(this.detailConData);
            },
            navigateToEdit(){
                this.$f7router.navigate(paths.mydata_edit_page,{ context:{coverExtra : this.detailConData}})
            },
            getSingleData(){
                fetchUtil(queryUrl(`${model_api_url}data/customer/${this.package_id}/records/${this.record_id}`))
                    .then(resp => {
                        if(resp.result){
                            this.detailConData = resp.result;
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
            },
        },
    };
</script>
<style lang="scss" scoped>
    .map-contents{
        position: absolute;
        width:100%;
        height:400px;
    }
    .pageItemList{
        position: absolute;
        width: 100%;
        top: 300px;
        bottom: 0;
        background: #fff;
        .upload-edit-text {
            line-height: 36px;
            box-sizing: border-box;
            padding-left: 16px;
            color: #8e8e93;

            span {
                color: #ff6464;
            }

        }
        .upload-edit-base {
            width: 100%;
            box-sizing: border-box;
            padding-left: 16px;
            border-top: 1px solid #C8C7CC;
            border-bottom: 1px solid #C8C7CC;
            background-color: #fff;
        .title-text {
            line-height: 25px;
            color: #8e8e93;
            width: 100px;
        }
        input {
            flex: 1;
            border: none;
            font-size: 14px;
            color: #000;
            background-color: #fff;
            padding: 0;
        }
        .base-info-name-input, .base-info-lng, .base-info-lat {
            width: 100%;
            height: 45px;
            box-sizing: border-box;
            padding: 10px 0;
            display: inline-flex;
            align-items: center;
        }
        .base-info-lng{
            border-bottom: 1px solid #c8c7cc;
            }
        }
        .base-info-lat{
            border-bottom: 1px solid #c8c7cc;

        }
        .base-info-lat:last-child{
            border:none;
        }
        .base-info-name-input{
            border-bottom:1px solid #c8c7cc;
        }


    }
</style>

