<template>
    <div class="point_visual_card">
        <div class="point_card_title">
            <div class="point_card_title_text">按{{mData.cur_visual.title}}可视化</div>
        </div>
        <div class="point_card_list">
            <div class="point_card_item" v-for="(vl, i) in breaks" :key="i">
                <div class="point_card_item_icon">
                    <i class="icomoon" :class="icon.icon" :style="{'color': current_colors[i] || visualization_colors[i] || visualization_colors[0]}"></i>
                </div>
                <div class="point_card_item_text">{{vl === '__other__' ? '其他' : vl}}</div>
            </div>
        </div>
    </div>
</template>
<script>
import slice from 'lodash/slice'
import uniq from 'lodash/uniq'
import map from 'lodash/map'
import get from 'lodash/get'
import forEach from 'lodash/forEach'
import cloneDeep from 'lodash/cloneDeep'
import bus from '../../../../../js/utils/bus'
import {visualization_colors} from '../../../../../js/constants/Constants'
const gray = 'rgba(255,255,255,0.3)';
export default {
    name: "PointVisualTag",
    props: ['mData'],
    data(){
        return {
            tagList: [],
            icon: {},
            poiVisualCol: '',
            current_colors: [],
            firstRender: true,
            subs: [],
            breaks: [],
        }
    },
    created(){
        bus.$on('mapFetchData', ()=>{
            this.setTemData();
        })
    },
    mounted(){
        this.setTemData();
    },
    methods: {
        setTemData(){
            this.icon = this.mData.style.icon;
            this.poiVisualCol = this.mData.cur_visual.col;
            this.current_colors = this.mData.config_2[this.poiVisualCol].range;
            this.breaks = this.mData.config_2[this.poiVisualCol].domain;
            var [breaks, allVals, uniqallVals, current_colors] = this.getBreaks();
            this.breaks = breaks;
        },
        getBreaks() {
            var data = this.mData.data;
            var poiVisualCol = this.poiVisualCol;
            var {breaks, current_colors} = this;
            var allVals = [];
            forEach(data, item => {
                let val = get(item, poiVisualCol);
                allVals.push(val);
            });
            var vals = breaks;
            let uniqallVals = uniq(allVals);
            if (!breaks) {
                vals = slice(uniqallVals.sort(), 0, 11);
                if (uniqallVals.length > 11) {
                    vals.push('__other__');
                    if (this.firstRender) {
                        current_colors[vals.length - 1] = gray
                    }
                }
            }
            return [vals, allVals, uniqallVals, current_colors];
        }
    }
}
</script>
<style lang="scss" scoped>
.point_visual_card {
    width: 100%;
    .point_card_title {
        .point_card_title_text{
            width: 100%;
            line-height: 17px;
            font-size: 12px;
        }
    }
    .point_card_list {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        .point_card_item {
            width: 50%;
            line-height: 30px;
            font-size: 12px;
            .point_card_item_icon {
                display: inline-block;
                vertical-align: top;
                margin-right: 5px;
            }
            .point_card_item_text {
                display: inline-block;
                vertical-align: top;
                width: 8em;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
}
</style>