<template>
    <div class="upload-input-panel">
        <div class="upload-input-base-info">
            <div class="panel-title-text">必填信息<span>*</span></div>
            <div class="base-info-input">
                <div class="base-info-input-name">
                    <div class="title-text">地块名称</div>
                    <input placeholder="请输入"/>
                </div>
                <div class="base-info-data-table">
                    <div class="title-text">添加到数据表</div>
                    <input placeholder="请输入" />
                    <div class="data-table-select-btn">
                        <div class="text">选择或填写新建</div>
                        <i class="f7-icons skip-icon">chevron_right</i>
                    </div>
                </div>
                <div class="base-info-input-address">
                    <div class="title-text">地址</div>
                    <input placeholder="请输入" />
                </div>
            </div>
        </div>
        <div class="upload-input-params"></div>
        <div class="upload-input-param-btn">
            <i class="f7-icons add-icon">add_round</i>
            <div class="upload-btn-text">添加参数...</div>
        </div>
    </div>
</template>
<script>
export default {
    name: "UploadInputPanel",
    data(){
        return {}
    }
}
</script>
<style lang="scss" scoped>
.upload-input-panel {
    width: 100%;
    font-size: 14px;
    color: #000;
    font-family: PingFang SC;
    .upload-input-base-info {
        width: 100%;
        .panel-title-text {
            line-height: 36px;
            box-sizing: border-box;
            padding-left: 16px;
            color: #8e8e93;
            span {
                color: #ff6464;
            }
        }
        .base-info-input {
            width: 100%;
            box-sizing: border-box;
            padding-left: 16px;
            border-top: 1px solid #c8c7cc;
            border-bottom: 1px solid #c8c7cc;
            background-color: #fff;
            .title-text {
                line-height: 45px;
                color: #8e8e93;
                width: 100px;
            }
            input {
                flex: 1;
                line-height: 45px;
                border: none;
            }
            .base-info-input-name, .base-info-data-table, .base-info-input-address {
                width: 100%;
                height: 45px;
                display: inline-flex;
            }
            .base-info-data-table {
                border-top: 1px solid #c8c7cc;
                border-bottom: 1px solid #c8c7cc;
                box-sizing: border-box;
                padding-right: 16px;
                .data-table-select-btn {
                    line-height: 45px;
                    color: #8e8e93;
                    .text {
                        display: inline-block;
                        margin-right: 5px;
                    }
                    .skip-icon {
                        display: inline-block;
                        font-size: 14px;
                    }
                }
            }
        }
    }
    .upload-input-param-btn {
        width: 100%;
        line-height: 45px;
        box-sizing: border-box;
        padding-left: 16px;
        margin-top: 30px;
        border-top: 1px solid #c8c7cc;
        border-bottom: 1px solid #c8c7cc;
        background-color: #fff;
        .add-icon {
            display: inline-block;
            font-size: 14px;
            color: #0076ff;
        }
        .upload-btn-text {
            display: inline-block;
            margin-left: 10px;
        }
    }
}
</style>