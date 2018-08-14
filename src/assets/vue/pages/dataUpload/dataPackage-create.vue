<template>
    <f7-page navbar-through toolbar-through>
        <f7-navbar>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left"></f7-link>
            </f7-nav-left>
            <div class="title">新建数据包</div>
            <f7-nav-right>
                <div class="ok-btn" @click="onClickOk">完成</div>
            </f7-nav-right>
        </f7-navbar>
        <div class="page-form">
            <div class="page-form-text">必填信息<span>*</span></div>
            <div class="page-form-input">
                <div class="page-form-input-base">
                    <div class="base-info-name-input">
                        <div class="title-text">数据包名称</div>
                        <input placeholder="请填写" v-model="dataName" />
                    </div>
                    <div class="page-form-input-type"  @click="onClickSelectType">
                        <div class="title-text">数据类型</div>
                        <input v-model="dataTypeText" disabled/>
                        <div class="select-btn">
                            <span class="text">修改类型</span>
                            <i class="f7-icons open-select">chevron_right</i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </f7-page>
</template>
<script>
import {paths} from '../../../js/constants/Constants';
import size from 'lodash/size';
export default {
    name: "DataPackageCreate",
    data(){
        return {
            dataName: "",
            dataType: "",
            dataTypeText: "",
            typeList: [
                {key: 'point', name: '点数据'},
                {key: 'line', name: '线数据'},
                {key: 'polygon', name: '面数据'},
            ],
            dialog: {},
            currentItem: {},
        }
    },
    methods: {
        onClickSelectType(){
            let {dataType, typeList} = this;
            let btnList = [];
            for(let i = 0; i < typeList.length; i++){
                let item = {
                    'text': typeList[i].name,
                    'onClick': () => {
                        this.onClickDialogItem(typeList[i])
                    },
                    'color': dataType === typeList[i].key ? 'selectColor' : 'notSelectColor',
                }
                btnList.push(item);
            }
            let dialog = this.$f7.dialog.create({
                buttons: btnList,
                verticalButtons: true,
                cssClass: "dialog-type-select",
                destroyOnClose: true,
            });
            dialog.open();
        },
        onClickDialogItem(value){
            this.dataType = value.key;
            this.dataTypeText = value.name;
        },
        createDataPackage(){
            let {dataName, dataType} = this;
            let item = {
                geo_type: dataType,
                name: dataName,
            }
            this.$f7Router.navigate(paths.upload, {context: {item: item, pageStatus: 2}});
        },
        onClickOk(){
            let {dataName, dataType} = this;
            if(size(dataName) && size(dataType)){
                this.createDataPackage();
            }
            else {
                this.$f7.dialog.alert('请将数据填写完整!', '提示');
            }
        }
    }
}
</script>
<style lang="scss">
.ok-btn {
    color: #007aff;
}
.page-form {
    width: 100%;
    .page-form-text {
        line-height: 36px;
        box-sizing: border-box;
        padding-left: 16px;
        color: #8e8e93;
        span {
            color: #ff6464;
        }
    }
    .page-form-input {
        .page-form-input-base {
            width: 100%;
            box-sizing: border-box;
            padding-left: 16px;
            border-top: 1px solid #c8c7cc;
            border-bottom: 1px solid #c8c7cc;
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
                width: 100%;
            }
            .base-info-name-input, .page-form-input-type {
                width: 100%;
                height: 45px;
                box-sizing: border-box;
                display: inline-flex;
                align-items: center;
            }
            .page-form-input-type {
                border-top: 1px solid #c8c7cc;
                box-sizing: border-box;
                padding-right: 10px;
                .select-btn {
                    line-height: 25px;
                    color: #8e8e93;
                    width: 80px;
                    .text {
                        display: inline-block;
                        margin-right: 5px;
                    }
                    .open-select {
                        display: inline-block;
                        font-size: 14px;
                    }
                }
            }
        }
    }
}
.dialog-type-select {
    position: absolute;
    top: 172px;
    right: 10px;
    margin-left: auto !important;
    margin-top: auto !important;
    .dialog-inner {
        display: none;
    }
    .color-selectColor {
        color: #007aff;
    }
    .color-notSelectColor {
        color: #000;
    }
}
</style>