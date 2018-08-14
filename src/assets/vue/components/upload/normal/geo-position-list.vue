<template>
    <div class="geo-position-list">
        <div class="geo-position-list-place" v-if="listStatus != 'details'">
            <div class="list-place-text">地理位置</div>
            <ul>
                <li v-for="(vl, dx) in positionList" :key="dx" v-if="listStatus != 'omit' || dx < 3">
                    <f7-link @click.prevent="onDataSkip('position', vl)">
                        <i></i>
                        <div class="list-place-name line-split">{{vl.name}}</div>
                    </f7-link>
                </li>
            </ul>
            <div class="list-place-more" v-if="listStatus === 'omit' && positionList.length >= 3">
                <f7-link @click.prevent="onDataSkip('more_position')">
                    <i class="f7-icons">search</i>
                    <span>更多地理位置</span>
                </f7-link>
            </div>
        </div>
        <div class="geo-position-list-detail" v-if="listStatus != 'geo'">
            <div class="list-detail-text">数据明细</div>
            <ul v-if="!loading">
                <li class="position-detail-item line-split" v-for="(vl, dx) in detailsList" :key="dx"  v-if="listStatus != 'omit' || dx < 3">
                    <f7-link @click.prevent="onDataSkip('detail', vl)">
                        <div class="item-name">
                            <span class="name-text">{{vl.name}}</span>
                            <i class="f7-icons skip-right">right</i>
                        </div>
                        <div class="item-info">
                            <span>{{getCountInfo(vl.id, 'text_comment')}}条评论</span>
                            <span>{{getCountInfo(vl.id, 'image_comment')}}张照片</span>
                            <span>{{getCountInfo(vl.id, 'update_time')}}</span>
                        </div>
                    </f7-link>
                </li>
            </ul>
            <div class="loading-wrap" v-else>
                <f7-preloader></f7-preloader>
            </div>
            <div class="list-place-more" v-if="listStatus === 'omit' && detailsList.length >= 3 && !loading">
                <f7-link @click.prevent="onDataSkip('more_detail')">
                    <i class="f7-icons">search</i>
                    <span>更多数据明细</span>
                </f7-link>
            </div>
        </div>
    </div>
</template>
<script>
import {GlobalKeys, paths} from '../../../../js/constants/Constants';
import userUtil from '../../../../js/utils/userUtil';
import size from 'lodash/size';
import global from '../../../../js/utils/global'
export default {
    name: "GeoPositionList",
    props: ['positionList', 'detailsList', 'listStatus', 'dataPg', 'searchContent', 'feedsCount', 'loading'],
    data(){
        return {
            Geocoder: {},
        }
    },
    mounted(){
        this.Geocoder = new AMap.Geocoder();
        this.user = userUtil.get();
    },
    methods: {
        onDataSkip(type, value){
            let {positionList, detailsList, listStatus, dataPg, searchContent} = this, flag = false;
            switch(type){
                case "position": 
                    if(!size(value.location)){
                        let Geocoder = this.Geocoder;
                        Geocoder.getLocation(value.address, (status, result) => {
                            if(status === 'complete' && result.info === 'OK'){
                                if(size(result.geocodes)){
                                    value.location = result.geocodes[0].location;
                                }
                            }
                            if(listStatus === "omit"){
                                this.$emit("dataListCallBack", {itemData: value, type: "position"})
                            }
                            else{
                                this.$f7Router.navigate(paths.upload, {context: {itemData: value, type: "position"}});
                            }
                            this.keepSearchHistory(value, type);
                        })
                    }
                    else{
                        if(listStatus === "omit"){
                            this.$emit("dataListCallBack", {itemData: value, type: "position"})
                        }
                        else{
                            this.$f7Router.navigate(paths.upload, {context: {itemData: value, type: "position"}});
                        }
                        flag = true;
                    }
                    break;
                case "more_position": this.$f7Router.navigate(paths.more_data, {context: {itemData: positionList, searchContent: searchContent, type: "position"}}); break;
                case "detail":
                    if(listStatus === "omit"){
                        this.$emit("dataListCallBack", {itemData: value, type: "detail"});
                    }
                    else{
                        this.$f7Router.navigate(paths.upload, {context: {itemData: value, type: "detail"}});
                    }
                    flag = true;
                    break;
                case "more_detail": this.$f7Router.navigate(paths.more_data, {context: {dataPg: dataPg, searchContent: searchContent, type: "detail"}}); break;
            }
            if(flag){
                this.keepSearchHistory(value, type);
            }
        },
        keepSearchHistory(value, type){
            let user_id = this.user && this.user.id;
            let historyList = this.getLocalStroge(GlobalKeys.location_search_history + user_id), 
            item = Object.assign({}, {"itemData": value}, {"type": type});
            if(size(historyList)){
                historyList = JSON.parse(historyList);
                if(historyList.length < 10){
                    historyList.unshift(item);
                }
                else{
                    historyList.pop();
                    historyList.unshift(item);
                }
            }
            else{
                historyList = [];
                historyList.push(item);
            }
            this.setLocalStorage(GlobalKeys.location_search_history + user_id, JSON.stringify(historyList));
        },
        getCountInfo(id, type){
            let {feedsCount} = this;
            if(type === "update_time"){
                return (feedsCount[id] && feedsCount[id][type]) ? feedsCount[id][type] : "暂无";
            }
            else{
                return (feedsCount[id] && feedsCount[id][type]) ? feedsCount[id][type] : 0;
            }
        },
        setLocalStorage(key, value){
            localStorage.setItem(key, JSON.stringify(value));
        },
        getLocalStroge(key){
            let sum = localStorage.getItem(key);
            return size(sum) ? JSON.parse(sum) : "";
        },
    }
}
</script>
<style lang="scss" scoped>
.geo-position-list {
    width: 100%;
    .list-place-text, .list-detail-text {
        line-height: 30px;
        font-size: 12px;
        color: #a7a7b2;
        padding-left: 16px;
        box-sizing: border-box;
    }
    .list-place-more {
        width: 100%;
        line-height: 40px;
        font-size: 14px;
        color: #007aff;
        padding-left: 24px;
        box-sizing: border-box;
        background-color: #fff;
        a {
            width: 100%;
            line-height: 40px;
            justify-content: left;
        }
        i {
            margin-right: 5px;
            font-size: 14px;
        }
    }
    .geo-position-list-place {
        width: 100%;
        ul {
            width: 100%;
            margin: 0;
            padding: 0;
            padding-left: 15px;
            box-sizing: border-box;
            background-color: #fff;
            a{
                width: 100%;
                height: 54px;
                display: inline-flex;
                align-items: center;
            }
            li {
                width: 100%;
                list-style-type: none;
                i {
                    width: 29px;
                    height: 29px;
                    margin-right: 15px;
                    display: block;
                    background: url('../../../../../static/images/icon_position.svg') no-repeat;
                    background-size: 100% 100%;
                }
                .list-place-name {
                    flex: 1;
                    line-height: 54px;
                    font-size: 17px;
                    color: #030303;
                    position: relative;
                }
            }
        }
    }
    .geo-position-list-detail {
        ul {
            width: 100%;
            margin: 0;
            padding: 0;
            padding-left: 15px;
            box-sizing: border-box;
            background-color: #fff;
            li {
                width: 100%;
                padding: 9px 12px 4px 12px;
                box-sizing: border-box;
                position: relative;
                list-style-type: none;
                a{
                    width: 100%;
                    display: block;
                }
                .item-name {
                    width: 100%;
                    display: inline-flex;
                    .name-text {
                        flex: 1;
                        line-height: 24px;
                        font-size: 17px;
                        color: #000;
                        word-wrap: break-word;
                        word-break: break-all;
                    }
                    .skip-right {
                        font-size: 16px;
                        color: #8e8e8e;
                        margin-left: 20px;
                        margin-top: 6px;
                    }
                }
                .item-info {
                    margin-top: 6px;
                    width: 100%;
                    position: relative;
                    span {
                        display: inline-block;
                        line-height: 18px;
                        color: #8e8e8e;
                        font-size: 8px;
                    }
                    &>span:first-child {
                        margin-right: 10px;
                    }
                    &>span:last-child {
                        position: absolute;
                        right: 0;
                    }
                }
            }
        }
    }
    .loading-wrap {
        text-align: center;
    }
}
</style>


