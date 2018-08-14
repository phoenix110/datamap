<template>
    <div class="mdt-steps">
        <div class="mdt-steps-items" v-for="(vl, dx) in data" :key="dx">
            <div class="mdt-steps-item-line">
                <div class="item-line" v-if="dx != 0"><div :style="{'backgroundColor': dx<active ? '#007aff' : ''}"></div></div><div class="item-point" :style="{'backgroundColor': dx<active ? '#007aff' : ''}"></div>
            </div>
            <div class="mdt-steps-item-text" :style="{'color': dx<active ? '#007aff' : ''}">{{vl.text}}</div>
        </div>
    </div>
</template>
<script>
export default {
    name: "Steps",
    props: ['data', 'active'],
    data(){
        return {}
    }
}
</script>
<style lang="scss" scoped>
.mdt-steps {
    height: 41px;
    display: inline-flex;
    .mdt-steps-items {
        height: 100%;
        position: relative;
        .mdt-steps-item-line {
            height: 12px;
            .item-line {
                height: 12px;
                width: 123px;
                box-sizing: border-box;
                padding-top: 5px;
                display: inline-block;
                vertical-align: top;
                div {
                    width: 100%;
                    height: 1px;
                    background-color: #D9D9D9;
                }
            }
            .item-point {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #D9D9D9;
                display: inline-block;
                vertical-align: top;
            }
        }
        .mdt-steps-item-text {
            margin-top: 12px;
            font-size: 12px;
            color: #D9D9D9;
            font-family: PingFang SC;
            line-height: 17px;
            position: absolute;
            right: 6px;
            transform: translate3d(50%, 0, 0);
            white-space: nowrap;
        }
    }
}
</style>
