<template>
    <div class="detail_data_list">
        <div class="item line-split" v-for="item in items"
                            :key="item.id"
                            @click="gotoDetail(item)">
            <div class="title">
                <span class="titleName">{{item.name}} </span><f7-icon  f7="right"></f7-icon>
            </div>
            <div class="bottom">
                <div class="left">
                    <span>{{feedsCount[item.id] && feedsCount[item.id].text_comment || 0}}个评论</span>
                    <span>{{feedsCount[item.id] && feedsCount[item.id].image_comment || 0}}个图片</span>
                </div>
                <div class="date">{{feedsCount[item.id] && feedsCount[item.id].update_time || '暂无'}}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:['items', 'feedsCount'],   
    methods: {
        gotoDetail(item) {
            this.$emit('clickItem', item);
        }
    } 
}
</script>

<style lang="scss" scoped>
        .detail_data_list{
            background:#fff;
            margin-top:10px;
            padding-left:14px;
            .item{
                min-height:54px;
                max-height:70px;
                padding:8px 14px 5px 0px;
                font-family: 'PingFang SC';
                position: relative;
                .title{
                    display: flex;
                    justify-content: space-between;
                    .titleName{
                        max-width:90%;
                        padding-left:14px;
                        line-height:24px;
                        color:#030303;
                        font-size:17px;
                        font-weight:bold;
                        font-family: 'PingFang SC';
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp:2;  /* 设置行数 */
                        -webkit-box-orient: vertical;
                    }
                    .icon{
                        margin-top:4px;
                        padding-right:14px;
                        font-weight:bold;
                        color:#000000;
                        opacity:0.25;
                        filter:Alpha(opacity=25);

                    }
                }
                .bottom{
                    display:flex;
                    justify-content: space-between;
                    .left{
                        margin-top:10px;
                        padding-left:14px;
                        font-size: 8px;
                        color: #8E8E8E;
                        span:last-child{
                            padding-left:10px;
                        }
                    }
                    .date{
                        margin-top:10px;
                        padding-right:24px;
                        font-size: 8px;
                        color: #8E8E8E;
                    }
                }
            }
        }
</style>
