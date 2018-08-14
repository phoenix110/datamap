<template>
    <f7-page class="mydata-edit-page"
             data-page="mydata-edit-oage"
             navbar-through
             toolbar-fixed>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <f7-nav-left>
                <f7-link   text="完成"   @click="onClickOk"></f7-link>
            </f7-nav-left>
        </f7-navbar>
        <div class="upload-edit-page">
            <f7-block-title class="upload-edit-text">必填信息<span>*</span></f7-block-title>
            <f7-list inline-labels no-hairlines class="upload-input-list">
                <f7-list-item>
                    <f7-label class="title-text">数据名称</f7-label>
                    <f7-input type="text" placeholder="请填写" @change="onChangeDataName" :value="dataName" clear-button></f7-input>
                </f7-list-item>
                <f7-list-item v-if="pointType">
                    <f7-label class="title-text">经度</f7-label>
                    <f7-input type="text" :value="pointLng" disabled></f7-input>
                </f7-list-item>
                <f7-list-item v-if="pointType">
                    <f7-label class="title-text">纬度</f7-label>
                    <f7-input type="text" :value="pointLat" disabled></f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label class="title-text">用地性质</f7-label>
                    <f7-input type="text" :value="geometryInfo.object_type" disabled></f7-input>
                </f7-list-item>
            </f7-list>
            <f7-block-title class="upload-edit-text">其他信息</f7-block-title>
            <f7-list inline-labels no-hairlines class="upload-input-list">
                <f7-list-item v-for="(vl, dx) in paramsList" :key="dx"
                              class="upload-double-input">
                    <f7-input type="text"
                              placeholder="字段名称"
                              class="item-name-input"
                              :class="vl.key && 'upload-item-input-with-value'"
                              @input.native="onListenInput($event, 'key', dx)"
                              :key="dx+'-key'"
                              :value="vl.key"
                              clear-button
                    >
                    </f7-input>
                    <f7-input type="text"
                              placeholder="字段数值"
                              class="item-value-input"
                              :class="vl.value && 'upload-item-input-with-value'"
                              @input.native="onListenInput($event, 'value', dx)"
                              :key="dx+'-value'"
                              :value="vl.value"
                              clear-button
                    >
                    </f7-input>
                </f7-list-item>
            </f7-list>
            <div class="upload-edit-btn" v-if="btn_exist" @click="onAddParamItem" >新增参数</div>
        </div>
    </f7-page>
</template>
<script>
    import { getCenterLngLat } from '../../../js/utils/mapPanel'
    import bus from '../../../js/utils/bus'
    import size from 'lodash/size'
    import forEach from 'lodash/forEach'
    import global from '../../../js/utils/global';
    import { GlobalKeys } from '../../../js/constants/Constants';
    import {modifyData} from 'src/assets/apis/myDataEditPage';
    export default {
        name:'MydataEditPage',
        props:[ ],
        data() {
            return {
                dataName:'',
                pointType:false,
                geometryInfo:{},                                                          
                btn_exist:true,
                paramsList:[],
                pointLng :'',
                pointLat:'',
            }
        },
        created(){//组件上树之前
            let ctx = this.$f7route;
            this.geometryInfo = ctx.context && ctx.context.coverExtra ?
                ctx.context.coverExtra
                    :
                JSON.parse(global.get(GlobalKeys.my_data_info));
            let extra = this.geometryInfo.extra, arr = [];
            forEach(extra,(val,key)=>{
                arr.push({key:key+"",value:val+""})
            });
            this.paramsList = arr;
            this.dataName= this.geometryInfo.name;
        },
        mounted(){//上树之后
            this.pointType =  this.geometryInfo.geometry.type === 'Point'? true : false;
            if(this.pointType){
                let poi = getCenterLngLat(this.geometryInfo);
                this.pointLng = poi[0];
                this.pointLat = poi[1];
            }
        },
        methods: {
            onChangeDataName(e){
                this.dataName = e.target.name;
            },
            onAddParamItem(){
                this.paramsList.push({key: '', value: ''});
                this.btn_exist = false;
            },
            onListenInput(e, type, dx){
                let { paramsList } = this;
                paramsList[dx][type] = e.target.value;
                let status = this.getInputStatus();
                this.btn_exist = status === 1 ? true : false;
            },
            /*
            * 状态：1-字段名称和数值都填写完成、2-字段名称/数值都为空、3-字段名称或数值一个为空
            */
            getInputStatus(){
                let {paramsList} = this;
                let count = 0, flag = false;
                for(let i=0; i<paramsList.length; i++){
                    if((!size(paramsList[i].key+'') && size(paramsList[i].value+'')) || (size(paramsList[i].key) && !size(paramsList[i].value))) {
                        return 3;
                    }
                    if(!size(paramsList[i].key+"") && !size(paramsList[i].value+'')){
                        flag = true;
                    }
                    count++;
                }
                if(count === paramsList.length){
                    return flag ? 2 : 1;
                }
            },
            onClickOk(){
                let sendParams = [], {paramsList, dataName} = this;
                let status = this.getInputStatus();
                if(status === 3 || !size(dataName)){
                    return this.$f7.dialog.alert("请将字段填写完成", "提示");
                }
                else if(status === 2){
                    paramsList.map(vl => {
                        if(size(vl.key) && size(vl.value)){
                            sendParams.push(vl);
                        }
                    })
                }
                else{
                    sendParams = paramsList;
                }
                this.uploadData(sendParams)
            },
            uploadData(sendParams){
                let itemValue = {};
                forEach(sendParams,(item,index)=>{
                    if(item.key){
                        itemValue[item.key] = item.value;
                    }
                });
                let params = {
                   'records':[
                       {
                           'id':this.geometryInfo.id,
                           'name':this.geometryInfo.name,
                           'extra':itemValue,
                       }
                   ]
                }
                modifyData(params).then(resp => {
                        if (resp) {
                            if (resp.status === 'success') {
                                this.$f7Router.back();
                                bus.$emit('forceDetailData')
                            }else {
                                this.$f7.dialog.alert("修改数据失败", "提示");                             
                            }
                        }else {
                            this.$f7.dialog.alert("修改数据失败", "提示");
                        }
                    }).catch(err => {
                        console.error(err);
                        this.$f7.dialog.alert("修改数据失败", "提示");                        
                })
            }
        }
    };
</script>
<style lang="scss" scoped>
    .upload-edit-page {
        width: 100%;

        .upload-edit-text {
            margin: 0;
            padding-left: 16px;
            box-sizing: border-box;
            line-height: 36px;
            color: #8e8e93;
            span {
                color: #ff6464;
            }
        }
        .upload-input-list {
            margin-top: 0;
            margin-bottom: 0;
        }
        .upload-edit-base {
            width: 100%;
            box-sizing: border-box;
            padding-left: 16px;
            border-top: 1px solid #c8c7cc;
            border-bottom: 1px solid #c8c7cc;
            background-color: #fff;
            .title-text {
                line-height: 16px;
                color: #8e8e93;
                width: 100px;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
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
            .base-info-lng {
                border-top: 1px solid #c8c7cc;
                border-bottom: 1px solid #c8c7cc;
            }
        }
        .item-name-input {
            width: 35%;
            min-width: 0;
            flex-shrink: 0;
        }
        .item-value-input {
            flex: 1;
            margin-left: 5px;
        }
        .upload-edit-btn {
            width: 100%;
            line-height: 44px;
            text-align: center;
            color: #007aff;
            background-color: #fff;
        }

    }
</style>

