<template>
    <div class="field-select-page">
        <div class="field-select-page-search">
            <f7-searchbar key="upload_searchbar"
                class="filter-field-search"
                search-container=".up-searchbar-comp-list"
                disable-button-text="取消"
                placeholder="搜索"
                backdrop
                :disable-button="false"
                @input="onSearchInput"
            ></f7-searchbar>
        </div>
        <div class="field-select-page-list">
            <f7-link v-if="resultList.length !== 0 && refresh" class="select-all-item" @click="onClickSelectAll">
                <div class="field-item-all-select">
                    <f7-icon v-if="selectAll" slot="media" icon="f7-icons field-item-icon opt-status">check_round_fill</f7-icon>
                    <f7-icon v-else slot="media" icon="f7-icons field-item-icon">circle</f7-icon>
                    <span class="field-item-text">全选</span>
                </div>
            </f7-link>
            <f7-list
                v-if="resultList.length !== 0 && refresh"
                class="field-select-list"
                medial-list
                virtual-list
                :virtual-list-params="{ items: resultList, renderExternal, height: 44}"
            >
                <ul>
                    <f7-list-item
                        v-for="(item, index) in vlData.items"
                        :key="index"
                        media-item
                        link="#"
                        :style="`top: ${vlData.topPosition}px`"
                        @click="onClickListItem(item)"
                    >
                        <f7-icon v-if="selectAll || getItemStatus(item)" slot="media" icon="f7-icons field-item-icon opt-status">check_round_fill</f7-icon>
                        <f7-icon v-else slot="media" icon="f7-icons field-item-icon">circle</f7-icon>
                        <span class="field-item-text">{{item}}</span>
                    </f7-list-item>
                </ul>
            </f7-list>
        </div>
    </div>
</template>
<script>
import fetchUtil from '../../../js/utils/fetchUtil';
import queryUrl from '../../../js/utils/queryUrl';
import {sizeExtend} from '../../../js/utils/commonFun.js';
import {filter_list} from '../../../js/utils/filter_util'
import {model_api_url, map_api_url, headers} from '../../../js/constants/ApiConfig';
export default {
    name: "field-select-page",
    props: ["filterData"],
    data(){
        return {
            filterParams: {},
            filter: {},
            index: "",
            valueList: [],
            vlData: {
                items: []
            },
            selectList: [],
            resultList: [],
            selectAll: false,
            refresh: true,
        }
    },
    created(){
        let {filterData: {index, filter, filterParams}} = this;
        this.filter = filter;
        this.index = index;
        this.filterParams = filterParams;
        if(sizeExtend(filter.list)) this.selectList = filter.list;
        else this.selectAll = true;
        this.timer = setTimeout(() => {
            this.getFieldList();
        }, 300);
    },
    beforeDestroy(){
        this.timer && clearTimeout(this.timer);
    },
    methods: {
        onClickOk(){},
        getFieldList(){
            let {filterParams: {geometry_type, object_type, source}, filter: {db, h_value, key}} = this;
            fetchUtil(queryUrl(`${model_api_url}graph/statistics/${source}/${object_type}`, {
                geometry_type: geometry_type,
                column_name: key,
                column_type: db,
            }), {method: 'GET', headers})
            .then(resp => {
                this.valueList = resp.values;
                this.resultList = resp.values;
            })
        },
        getItemStatus(value){
            let {selectList, selectAll} = this;
            return selectList.indexOf(value) != -1 ? true : false;
        },
        onClickListItem(value){
            let {selectList, selectAll} = this;
            let index = selectList.indexOf(value);
            if(index != -1){
                this.selectList.splice(index, 1);
            }
            else{
                this.selectList.push(value);
            }
            if(!selectAll){
                let {filter, index} = this;
                filter.list = this.selectList;
                this.$emit("input", {filter, index});
            }
        },
        onClickSelectAll(){
            let {selectAll, filter, index} = this;
            this.selectAll = !selectAll;
            filter.list = [];
            this.$emit("input", {filter, index});
        },
        renderExternal(vl, vlData) {
            this.vlData = vlData;
        },
        onSearchInput(e){
            let {valueList} = this;
            let searchContent = e.target.value;
            this.refresh = false;
            this.resultList = filter_list(valueList, searchContent);
            this.$nextTick(() => {
                this.refresh = true;
            })
        },
    }
}
</script>
<style lang="scss" scoped>
.field-select-page {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    background-color: #f2f2f5;
    font-family: PingFang SC;
    position: relative;
    .field-select-page-search {
        width: 100%;
        top: 44px;
        position: fixed;
        z-index: 50;
    }
    .filter-field-search::after {
        display: none;
    }
    .select-all-item {
        width: 100%;
    }
    .field-item-all-select {
        width: 100%;
        height: 44px;
        margin: 20px 0;
        background-color: #fff;
        .field-item-icon {
            width: 50px;
            color: grey;
            line-height: 44px;
            vertical-align: top;
            padding-left: 8px;
            box-sizing: border-box;
        }
        .opt-status {
            color: #007aff;
        }
        .field-item-text {
            width: 100px;
            margin-left: 3;
            line-height: 44px;
        }
    }
    .field-item-icon {
        font-size: 18px;
        line-height: 24px;
    }
    .opt-status {
        color: #007aff;
    }
    .field-item-text {
        display: inline-block;
        font-size: 17px;
        color: #030303;
        line-height: 24px;
        width: calc(100% - 50px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .field-select-page-list {
        width: 100%;
        height: 100%;
        // overflow-y: auto;
        padding-top: 44px;
        box-sizing: border-box;
        ul {
            width: 100%;
            height: 100%;
            margin: 0;
            // overflow-y: auto;
            li {
                background-color: #fff;
            }
            &:before {
                display: none;
            }
        }
        ul::after {
            display: none;
        }
        .field-select-list {
            margin: 0;
        }
        .item-content {
            .item-inner {
                min-height: 24px !important;
                padding-bottom: 4px;
            }
        }
    }
}
</style>