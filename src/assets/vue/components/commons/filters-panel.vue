<template>
    <div class="workspace-filters-panel" v-if="items.length!=0" @click="onClickFilterPanel">
        <div class="filters-panel-content line-split">
            <i class="filters-icon"></i>
            <li v-for="(vl, dx) in items" :key="dx">{{'条件： > ' + vl.text}}</li>
        </div>
    </div>
</template>
<script>
import size from "lodash/size";
import {paths, h_type_number, h_type_text, h_type_date} from '../../../js/constants/Constants';
export default {
    name: "FiltersPanel",
    props: ["geoFilters", "title", "filterParams"],
    data(){
        return {
            items: [],
            filters: [],
        }
    },
    mounted(){
        this.getContent();
    },
    methods: {
        onClickFilterPanel(){
            let {items, title, filterParams, filters} = this;
            this.$f7Router.navigate(paths.filters_page, {context: {items: items, filters: filters, title: title, filterParams: filterParams}});
            // this.$emit("callbacktest", {context: {items: items, filters: filters, title: title, filterParams: filterParams}})
        },
        getContent(){
            let {filters} = this.geoFilters, items = [], filterList = [];
            filters.map((vl, dx) => {
                let db = vl.db;
                if((db === "str" || db === "bool") && size(vl.list)){
                    items.push({
                        "text": vl.list.join("，"),
                        "column_name": vl.h_value,
                        "column_type": vl.h_type,
                    });
                    filterList.push(vl);
                }
                else if(db === "datetime" || db === "date" || db === "time" ){
                    let sub;
                    let {start, end, fast_type, end_is_today} = vl;
                    if (end_is_today) {
                        sub = `${start}至今`;
                    }else if (fast_type) {
                        sub = fast_type;
                    }else {
                        sub = start ? `${start}至${end}` : '';
                    }
                    if (size(sub)) {
                        items.push({
                            "text": sub,
                            "column_name": vl.h_value,
                            "column_type": vl.h_type,
                        });
                        filterList.push(vl);
                    }
                }
                else if(db === "int" || db === "float" || db === "bigint"){
                    let text = "";
                    if(!!vl.min && !!vl.max){
                        text = '(' + vl.min + ',' + vl.max + ')';
                    }
                    else if(!!vl.min){
                        text = v.min + '以上';
                    }
                    else if(!!vl.max){
                        text = vl.max + '以下';
                    }
                    if(size(text)){
                        items.push({
                            "text": text,
                            "column_name": vl.h_value,
                            "column_type": vl.h_type,
                        });
                        filterList.push(vl);
                    }
                }
                else {}
            });
            this.items = items;
            this.filters = filterList;
        }
    }
}
</script>
<style lang="scss" scoped>
.workspace-filters-panel {
    width: 100%;
    height: 36px;
    box-sizing: border-box;
    padding-left: 16px;
    overflow-x: hidden;
    .filters-panel-content {
        display: inline-flex;
        justify-content: flex-start;
        line-height: 36px;
        min-width: 9999px;
        font-family: PingFang SC;
        position: relative;
        .filters-icon {
            width: 16px;
            height: 16px;
            display: block;
            margin: 10px 32px 10px 0;
            background: url("../../../../static/images/icon_filter.svg") no-repeat;
            background-size: 100% 100%;
        }
        li {
            display: block;
            list-style-type: none;
            font-size: 14px;
            color: #9699a0;
            font-weight: 400;
            margin-right: 16px;
            height: 36px;
            overflow: hidden;
        }
    }
}
</style>