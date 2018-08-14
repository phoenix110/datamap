<template>
    <f7-page class="upload_page" navbar-through toolbar-through tabs>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">{{pageType === "album" ? "添加照片" : "全部照片"}}</div>
            <f7-nav-right v-if="pageType === 'album'">
                <f7-link @click="uploadImages">保存</f7-link>
            </f7-nav-right>
        </f7-navbar>
        <div class="pic-page-content">
            <div class="picture-text-comment" v-if="pageType==='album'">
                <textarea placeholder="请添加图片备注..." v-model="textComment"></textarea>
            </div>
            <div :class="[pageType === 'look' ? 'picture-list-page' : 'picture-list-page-add', pageType === 'look' && imgList.length === 0 ? 'no-data-page' : '']">
                <div class="image-panel" v-for="(vl, dx) in imgList" :key="dx" >
                    <DefaultImg :src="vl.url" :dx="dx" @onCloseImg="onCloseImg" @onClickImg="onClickPicture" :notClose="notClose" :height="imgHeight" :width="imgWidth" :resize="imgResize"></DefaultImg>
                </div>
                <UploadBtnWrap class="add-img-btn" @onChoose="getImgPath" v-if="pageType === 'album'"></UploadBtnWrap>
            </div>
        </div>
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
import UploadBtnWrap from '../../components/upload_comp/upload-btn-wrap';
import DefaultImg from "../../components/commons/defaultImg.vue";
import fetchUtil from '../../../js/utils/fetchUtil';
import queryUrl from '../../../js/utils/queryUrl';
import {paths} from '../../../js/constants/Constants';
import { getCenterLngLat } from '../../../js/utils/mapPanel';
import {model_api_url, map_api_url, headers} from '../../../js/constants/ApiConfig';
import {readFileAsImageAllPlatform, uploadFilePromise} from '../../components/upload_comp/util.js';
import map from 'lodash/map';
import size from 'lodash/size';
const uploadType = "comment_image";
export default {
    name: "PictureListPage",
    data(){
        return {
            imgList: [],
            files: [],
            imgOssPath: [],
            pageType: '',
            itemData: {},
            MyDataCluse: {},
            notClose: false,
            textComment: "",
            imgHeight: 0,
            imgWidth: 0,
            imgResize: false,
        }
    },
    components: {
        DefaultImg,
        UploadBtnWrap,
    },
    created(){
        let context = this.$f7Route.context;
        if(size(context)){
            this.itemData = context.item;
            if(context.source === 'album'){
                let files = context.files;
                this.MyDataCluse = context.MyDataCluse;
                this.pageType = "album";
                this.getImgPath(files);
            }
            else{
                this.imgResize = true;
                this.imgHeight = 120;
                this.imgWidth = 120;
                this.pageType = "look";
                this.notClose = true;
                this.getImgList();
            }
        }
    },
    methods: {
        onClickPicture(dx){
            this.$refs.large_pic.f7PhotoBrowser.params.photos = this.imgList;
            this.openPhotoBrowser(dx);
        },
        openPhotoBrowser(dx){
            this.$refs.large_pic.open(dx);
            this.$refs.large_pic.f7PhotoBrowser.on("slideChange", this.onSlideChange);
            this.$$(".photo-browser-current")[0].style.display = "none";
            this.$$(".photo-browser-total")[0].style.display = "none";
            this.$$(".photo-browser-of")[0].innerHTML = this.imgList[dx].name;
        },
        onSlideChange(){
            let dx = this.$refs.large_pic.f7PhotoBrowser.activeIndex;
            this.$$(".photo-browser-of")[0].innerHTML = this.imgList[dx].name;
        },
        getImgList(){
            let {itemData: {id}} = this;
            fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/${id}`, {
                types: 'image_comment',
                status: 'created',
            }), {method: 'GET', headers})
            .then(resp => {
                if(!resp.Status){
                    let list = [];
                    resp.result.map(vl => {
                        list.push({
                            name: "",
                            text: vl.extra.text,
                            url: vl.extra.url,
                        })
                    });
                    this.imgList = list;
                }
                else {
                    this.imgList = []
                }
            })
        },
        uploadImages: async function() {
            let {files, textComment} = this;
            this.imgOssPath = [];
            if(!size(textComment) && !size(files)){
                this.toastCreate("请添加上传内容！");
                return;
            }
            this.createToast();
             for (let i = 0; i < files.length; i++) {
                const file = files[i];
                let resp = await uploadFilePromise(file, uploadType);
                if (!resp.err) {
                    this.imgOssPath.push({
                        text: "",
                        url: resp.oss_path,
                    });
                    this.setToastContent(i, files.length);
                }
            }
        },
        getImgPath(files){
            let {files: tfiles, imgList, textComment} = this;
            this.files = tfiles.concat(files);
            Promise.all(map(files, file => readFileAsImageAllPlatform(file))).then(images => {
                let list = [];
                images.map(vl => {
                    list.push({
                        url: vl,
                        name: textComment,
                    })
                });
                this.imgList = imgList.concat(list);
            });
        },
        onCloseImg(dx){
            this.imgList.splice(dx, 1);
            this.files.splice(dx, 1);
        },
        createToast(){
            this.toastCenter = this.$f7.toast.create({
                text: '0%',
                position: 'center',
                cssClass: "pic-progress-toast",
                destroyOnClose: true,
            });
            this.toastCenter.open();
        },
        setToastContent(value, total){
            let {toastCenter} = this;
            value++;
            let content = value*100/total + "%";
            toastCenter.$el[0].children[0].children[0].innerHTML = content;
            if(value === total){
                toastCenter.$el[0].children[0].children[0].innerHTML = "上传完成";
                this.postImgToServer();
                toastCenter.close();
            }
        },
        postImgToServer(){
            let {imgOssPath, itemData, MyDataCluse, textComment} = this;
            let lnglat = getCenterLngLat(itemData);
            let params = {
                "feed_type": "image_collection",
                "extra": {
                    "images": imgOssPath,
                    "text": textComment,
                },
                "lng": lnglat[0],
                "lat": lnglat[1]
            }
            params = JSON.stringify(params);
            fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/${itemData.id}`), {method: 'POST', body: params, headers})
            .then(resp => {
                if(!resp.Status){
                    this.$f7router.back();
                }
                else{
                    this.toastCreate("图片上传失败");
                }
            })
            .catch(err => {
                console.error(err);
                this.toastCreate("图片上传失败");
            })
        },
        toastCreate(text){
            var toastCenter = this.$f7.toast.create({
                text: text,
                position: 'center',
                destroyOnClose: true,
                closeTimeout: 1500,
                cssClass: "pic-progress-toast",
            });
            toastCenter.open();
        }
    }
}
</script>
<style lang="scss" scoped>
.save-btn {
    color: #0076ff;
}
.pic-page-content {
    width: 100%;
    height: 100%;
    background-color: #fff;
    overflow-y: auto;
}
.picture-text-comment {
    width: 100%;
    height: 120px;
    box-sizing: border-box;
    padding: 10px 10px;
    box-sizing: border-box;
    textarea {
        width: 100%;
        height: 100%;
        line-height: 1.25em;
    }
}
.picture-list-page {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 0;
    box-sizing: border-box;
    .image-panel, .add-img-btn {
        width: 120px;
        height: 120px;
        margin-left: 4px;
        margin-top: 4px;
    }
}
.picture-list-page-add {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 0 10px;
    box-sizing: border-box;
    .image-panel, .add-img-btn {
        width: 105px;
        height: 105px;
        margin-top: 10px;
        margin-right: 10px;
    }
    .add-img-btn {
        background: url("../../../../static/images/icon_add_btn.svg") no-repeat;
        background-size: cover;
    }
}
.no-data-page {
    background: url("../../../../static/images/no_picture_item.svg") no-repeat;
    background-size: 100px 100px;
    background-position: 50% 50%;
    background-color: #fff;
}
</style>
