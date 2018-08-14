<template>
    <f7-page navbar-through toolbar-through>
        <f7-navbar v-if="filter_page_type">
            <f7-nav-left>
                <f7-link text="取消" icon-f7="left" @click="onSetFilterItem"></f7-link>
            </f7-nav-left>
            <div class="title">{{filter_page_type === 'date' ? '选择时间' : '选择字段'}}</div>
            <f7-nav-right>
                <f7-link text="完成" @click="onSetFilterItem('ok')"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-navbar v-else>
            <f7-nav-left>
                <f7-link back text="返回" icon-f7="left" @click="onFilterPageBack"></f7-link>
            </f7-nav-left>
            <div class="title">{{title}}</div>
        </f7-navbar>
        <div class="filter-page-content">
            <div class="filter-panel line-split" v-if="!filter_page_type" v-for="(vl, dx) in items" :key="dx" @click="onClickFilterPanel(dx)" :style="{'backgroundColor': dx===currentPanel ? '#f7f7f7' : '#fff'}">
                <div class="filter-panel-key">{{'条件 '+(dx+1)}}</div>
                <div class="filter-panel-text">{{'> '+vl.text}}</div>
            </div>
            <transition name="filter-select">
                <div class="filter-page-select" v-if="filter_page_type">
                    <FilterDateSelect 
                        v-if="filter_page_type === 'date'" :filterData="filterData"
                        v-model="currentDate">
                    </FilterDateSelect>
                    <FilterFieldSelect 
                        v-else-if="filter_page_type === 'str'" :filterData="filterData"
                        v-model="currentField">
                    </FilterFieldSelect>
                </div>
            </transition>
        </div>
        <transition name="layer-bg">
            <div class="filter-page-layer" v-if="dialog"></div>
        </transition>
        <transition name="date-dialog">
            <div class="dialog-filter-set" v-if="dialog">
                <div class="dialog-filter-title">数据类型的筛选</div>
                <div class="dialog-filter-content">
                    <div class="dialog-filter-input">
                        <div class="input-start">
                            <div class="text">{{!!filters[currentPanel].min ? filters[currentPanel].min : '不限'}}</div>
                            <input v-model="inMin"/>
                        </div>
                        <div class="separate-line"></div>
                        <div class="input-end">
                            <div class="text">{{!!filters[currentPanel].max ? filters[currentPanel].max : '不限'}}</div>
                            <input v-model="inMax"/>
                        </div>
                    </div>
                    <div class="dialog-btn-group">
                        <f7-link @click="onClikSetBtn('unlimit')">
                            <div :class="{'btn-active': setBtn==='unlimit'}">不限</div>
                        </f7-link>
                        <f7-link @click="onClikSetBtn('firstHalf')" v-if="setBtnShow()">
                            <div :class="{'btn-active': setBtn==='firstHalf'}">前50%</div>
                        </f7-link>
                        <f7-link @click="onClikSetBtn('secondHalf')" v-if="setBtnShow()">
                            <div :class="{'btn-active': setBtn==='secondHalf'}">后50%</div>
                        </f7-link>
                    </div>
                </div>
                <div class="dialog-filter-footer">
                    <f7-link class="btn-cancel" @click="onClickDialogBtn('cancel')">取消</f7-link>
                    <f7-link class="btn-ok" @click="onClickDialogBtn('ok')">完成</f7-link>
                </div>
            </div>
        </transition>
    </f7-page>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import bus from '../../../js/utils/bus';
import FilterDateSelect from '../../components/commons/filter-date-select.vue';
import FilterFieldSelect from '../../components/commons/filter-field-select.vue';
import {sizeExtend} from '../../../js/utils/commonFun.js';
import {paths} from '../../../js/constants/Constants.js';
export default {
    name: "chart-detail",
    props: [],
    components: {
        FilterDateSelect,
        FilterFieldSelect,
    },
    data(){
        return {
            items: [],
            filters: [],
            filterParams: {},
            title: "",
            currentPanel: "",
            dialog: false,
            setBtn: "",
            inMin: "",
            inMax: "",
            filter_page: false,
            filter_page_type: false, //用来指定打开哪种条件设置界面
            filterData: {}, //传递给filter组件数据
            currentDate: {},  //当前设置的日期
            currentField: {},  //当前设置的条件字段
        }
    },
    created(){
        this.items = this.$f7Route.context && this.$f7Route.context.items;
        this.filters = this.$f7Route.context && this.$f7Route.context.filters;
        this.title = this.$f7Route.context && this.$f7Route.context.title;
        this.filterParams = this.$f7Route.context && this.$f7Route.context.filterParams;
    },
    beforeDestroy(){
        bus.$off("onDateFilterListener");
    },
    methods: {
        setPageTitle(vl){
            this.title = vl;
        },
        onClickFilterPanel(dx){
            let {filters, filterParams} = this;
            let db = filters[dx].db;
            this.currentPanel = dx;
            if(db === "int" || db === "float" || db === "bigint"){
                this.dialog = true;
                if(sizeExtend(filters[dx].min)) this.inMin = filters[dx].min;
                else this.inMin = "不限";
                if(sizeExtend(filters[dx].max)) this.inMax = filters[dx].max;
                else this.inMax = "不限";
            }
            else if(db === "str" || db === "bool"){
                this.filterData = {
                    index: dx,
                    filter: filters[dx],
                    filterParams: filterParams,
                };
                this.filter_page_type = "str";
            }
            else if(db === "datetime" || db === "date" || db === "time"){
                this.filterData = {
                    index: dx,
                    filter: filters[dx],
                };
                this.filter_page_type = "date";
            }
        },
        onClikSetBtn(type){
            let {filters, currentPanel} = this;
            let min = filters[currentPanel].min, max = filters[currentPanel].max;
            min = parseInt(min);
            max = parseInt(max);
            this.setBtn = type;
            if(type === "unlimit"){
                this.inMin = "不限";
                this.inMax = "不限";
            }
            else if(type === "firstHalf"){
                this.inMin = min;
                this.inMax = Math.floor((min + max)/2);
            }
            else if(type === "secondHalf"){
                this.inMin = Math.ceil((min + max)/2);
                this.inMax = max;
            }
        },
        setBtnShow(type){
            let {filters, currentPanel} = this;
            let min = filters[currentPanel].min, max = filters[currentPanel].max;
            if(sizeExtend(min) && sizeExtend(max)) return true;
            else return false;
        },
        onClickDialogBtn(status){
            let {filters, currentPanel, inMin, inMax, setBtn} = this;
            this.dialog = false;
            let cur = filters[currentPanel];
            if(status === "ok"){
                if(sizeExtend(cur.min)){
                    if(!sizeExtend(inMin) || inMin === "不限") delete cur.min;
                    else cur.min = parseInt(inMin);
                }
                else{
                    if(sizeExtend(inMin) && inMin != "不限") cur.min = parseInt(inMin);
                }
                if(sizeExtend(cur.max)){
                    if(!sizeExtend(inMax) || inMax === "不限") delete cur.max;
                    else cur.max = parseInt(inMax);
                }
                else{
                    if(sizeExtend(inMax) && inMax != "不限") cur.max = parseInt(inMax);
                }
            }
            this.filters[currentPanel] = cur;
            this.getItemContent(cur, currentPanel);
            this.setBtn = "";
            this.inMin = "";
            this.inMax = "";
        },
        getItemContent(filter, index){
            let cur = filter, db = cur.db, str = "", {items} = this;
            if(db === "str" || db === "bool"){
                if(sizeExtend(cur.list)) 
                    cur.text = cur.list.join("，");
                else
                    cur.text = "全部";
            }
            else if(db === "datetime" || db === "date" || db === "time" ){
                let sub;
                let {start, end, fast_type, end_is_today} = cur;
                if (end_is_today) {
                    sub = `${start}至今`;
                }else if (fast_type) {
                    sub = fast_type;
                }else {
                    sub = start ? `${start}至${end}` : '';
                }
                if (sizeExtend(sub)) {
                    cur.text = sub;
                }
            }
            else if(db === "int" || db === "float" || db === "bigint"){
                let text = "";
                if(!!cur.min && !!cur.max){
                    text = '(' + cur.min + ',' + cur.max + ')';
                }
                else if(!!cur.min){
                    text = v.min + '以上';
                }
                else if(!!cur.max){
                    text = cur.max + '以下';
                }
                if(sizeExtend(text)){
                    cur.text = text;
                }
            }
            else {}
            if(sizeExtend(cur.text)){
                let m = items[index];
                m.text = cur.text;
                this.$set(this.items, index, m);
            }
        },

        onSetFilterItem(type){
            let {filter_page_type, currentDate, currentField} = this, date, index;
            this.filter_page_type = false;
            if(type != "ok") return;
            if(filter_page_type === "date"){
                date = currentDate.filter;
                index = currentDate.index;
            }
            else{
                date = currentField.filter;
                index = currentField.index;
            }
            let sum = cloneDeep(date), {filters} = this;
            this.filters[index] = date;
            this.getItemContent(sum, index);
        },
        //筛选器页面返回
        onFilterPageBack(){
            let {filters} = this;
            bus.$emit("graphFilterListener", filters);
        }
    }
}
</script>
<style lang="scss" scoped>
.filter-page-content {
    width: 100%;
    height: 100%;
    padding-top: 8px !important;
    background-color: #fff;
    position: relative;
    .filter-panel {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 32px;
        position: relative;
        line-height: 20px;
        font-size: 14px;
        color: #6b7280;
        font-family: PingFang SC;
        font-weight: 400;
        display: inline-flex;
        .filter-panel-key {
            width: 120px;
        }
        .filter-panel-text {
            flex: 1;
            text-align: right;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .filter-select-enter, .filter-select-leave-active {
        left: 100%;
    }
    .filter-select-enter-to, .filter-select-leave {
        left: 0;
    }
    .filter-select-enter-active, .filter-select-leave-active {
        transition: all 300ms;
    }
    .filter-page-select {
        width: 100%;
        height: 100%;
        top: 0;
        position: absolute;
    }
}
.layer-bg-enter, .layer-bg-leave-active {
    opacity: 0;
}
.layer-bg-enter-to, .layer-bg-leave {
    opacity: 1;
}
.layer-bg-enter-active, .layer-bg-leave-active {
    transition: all 300ms;
}
.filter-page-layer {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.4);
}
.date-dialog-enter, .date-dialog-leave-active {
    opacity: 0;
    transform: scale(1.1);
}
.date-dialog-enter-to, .date-dialog-leave {
    opacity: 1;
    transform: scale(1);
}
.date-dialog-enter-active, .date-dialog-leave-active {
    transition: all 300ms;
}
.dialog-filter-set {
    width: 90%;
    height: 200px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    position: absolute;
    border-radius: 6px;
    box-sizing: border-box;
    padding-top: 16px;
    background-color: #fff;
    font-family: PingFang SC;
    .dialog-filter-title {
        width: 100%;
        line-height: 24px;
        text-align: center;
        font-size: 17px;
    }
    .dialog-filter-content {
        width: 100%;
        box-sizing: border-box;
        padding: 0 34px;
        margin-top: 5px;
        .dialog-filter-input {
            width: 100%;
            height: 48px;
            display: inline-flex;
            justify-content: space-between;
            .input-start, .input-end {
                width: 70px;
                height: 100%;
                .text {
                    font-size: 12px;
                    color: #9699A0;
                    line-height: 18px;
                }
                input {
                    width: 70px;
                    height: 24px;
                    font-size: 14px;
                    text-align: center;
                    border: solid 1px #DCDCDC;
                }
            }
            .separate-line {
                width: 12px;
                height: 1px;
                margin-top: 30px;
                background-color: #000;
            }
        }
        .dialog-btn-group {
            width: 100%;
            height: 30px;
            margin-top: 16px;
            display: inline-flex;
            justify-content: flex-start;
            div {
                width: 64px;
                height: 24px;
                margin-right: 12px;
                line-height: 24px;
                text-align: center;
                color: #9699A0;
                font-size: 14px;
                border-radius: 4px;
                border: solid 1px #9699A0;
            }
            .btn-active {
                border: none;
                color: #fff;
                background-color: #007aff;
            }
        }
    }
    .dialog-filter-footer {
        width: 100%;
        margin-top: 20px;
        font-size: 18px;
        color: #007AFF;
        border-top: solid 1px #DCDCDC;
        a {
            width: 48%;
            line-height: 39px;
            text-align: center;
            display: inline-block;
        }
        .btn-ok {
            border-left: solid 1px #DCDCDC;
        }
    }
}
</style>
