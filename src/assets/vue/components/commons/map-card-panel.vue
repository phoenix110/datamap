<template>
    <div class="map-card-panel">
        <i class="close-btn" @click="onClose">&#xe607;</i>
        <div class="map-card-list" v-for="(vl1, i1) in cards" :key="i1">
            <div class="panel-title">
                <div class="text">{{getPaneltitle(vl1.geo_filters)}}</div>
            </div>
            <div class="items-list">
                <div class="panel-item" v-for="(vl2, i2) in vl1.items" :key="i2">
                    <!-- 这个地方要区分point、line、polygon三种类型 -->
                    <CardElement :item="vl2"></CardElement>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import map from 'lodash/map'
import {self_select, dis_select, fence_select, source_customer, geo_types} from '../../../js/constants/Constants';
let View = {
    [geo_types.point]: "PointCard",
    [geo_types.polygon]: "PolygonCard",
    [geo_types.line]: "PolylineCard",
}
export default {
    name: "mapCardPanel",
    props: ['iData'],
    data(){
        return {
            cards: [],
            panelItems: [],
            title: "",
        }
    },
    components: {
        "CardElement": {
            props: ['item'],
            render: function(createElement){
                return createElement(View[this.item.geometry_type], {props: {iData: this.item}});
            }
        }
    },
    created(){
        this.cards = this.iData ? this.iData.config.cards : [];
        this.panelItems = this.iData ? this.iData.config.cards.items : {};
    },
    methods: {
        getPaneltitle(filter){
            if (this.iData.config.buffer_filters) {
                return 'buffer选区';
            }
            if (false) {
                return 'buffer选区';
            }
            if (!filter) {
                return "全部";
            }
            if (filter.type == self_select || filter.type == dis_select) {
                return "自助选择范围";
            }
            var allStreets = map(filter.filters, t => {
                return t.name;
            })
            return allStreets.join(",") || filter.object_type || '未选择';
        },
        onClose(){
            this.$emit('modelClose');
        }
    }
}
</script>
<style lang="scss" scoped>
.map-card-panel {
    width: 100%;
    height: 100%;
    position: relative;
    // background-color: #000;
    .close-btn {
        font-family: 'iconfont';
        font-style: normal;
        font-size: 16px;
        position: absolute;
        top: 7px;
        right: 7px;
        width: 30px;
        text-align: center;
        line-height: 30px;
    }
    .map-card-list {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .panel-title {
            width: 100%;
            box-sizing: border-box;
            padding: 16px 18px 8px 18px;
            .text{
                font-family: PingFang SC;
                line-height: 17px;
                font-size: 12px;
                width: 21em;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .items-list {
            width: 100%;
            flex: 1;
            overflow-y: auto;
            max-height: 303px;
            .panel-item {
                box-sizing: border-box;
                padding: 0 18px 18px 18px;
            }
        }
    }
}
</style>