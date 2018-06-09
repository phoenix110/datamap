<template>
    <div class="tree-menu">
        <div class="tree-items-temp" v-for="(vl, idx) in data" :key="idx">
            <div class="tree-items" @click="onItemClick(vl, idx)">
                <div class="tree-items-temp-icon">
                    <i class="item-icon" :style="{'backgroundImage': vl.isParent ? folder_icon : file_icon[vl.geo_type]}"></i>
                </div>
                <div class="tree-items-temp-content">
                    <div class="tree-items-temp-name">
                        <div>{{vl.name}}</div>
                    </div>
                    <div :ref="'opt'+idx" class="tree-items-temp-opt" v-if="vl.isParent">
                        <div class="opt-text">展开</div>
                        <div class="opt-icon"><i class="icon-arrow-down"></i></div>
                    </div>
                </div>
            </div>
            <div class="tree-children" :style="{'height': checkOpen(idx) ? (vl.children.length*44+'px') : 0, 'transitionDuration': vl.children ? vl.children.length*50+'ms' : 0}">
                <div class="tree-items-children" v-for="(vl2, idx2) in vl.children" :key="idx2"  @click="onItemClick(vl2, idx2)">
                    <div class="tree-items-temp-icon">
                        <i class="item-icon" :style="{'backgroundImage': file_icon[vl2.geo_type]}"></i>
                    </div>
                    <div class="tree-items-temp-content">
                        <div class="tree-items-temp-name">
                            <div>{{vl2.name}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "TreeMenu",
    props: ['data'],
    data(){
        return {
            openList: [],
            folder_icon: "url(./static/images/icon_folder.png)",
            file_icon: {
                "point": "url(./static/images/icon_point.png)",
                "polygon": "url(./static/images/icon_polygon.png)",
                "line": "url(./static/images/icon_line.png)",
            }
        }
    },
    methods: {
        onItemClick(vl, idx){
            if(vl.isParent){
                if(this.openList.indexOf(idx) != -1){
                    let i = this.openList.indexOf(idx);
                    this.openList.splice(i, 1);
                    this.$refs['opt'+idx][0].children[0].innerText = "展开";
                    this.$refs['opt'+idx][0].children[1].classList.remove('icon_dir');
                }
                else{
                    this.openList.push(idx);
                    this.$refs['opt'+idx][0].children[0].innerText = "收起";
                    this.$refs['opt'+idx][0].children[1].classList.add('icon_dir');
                }
            }
            else{
                this.$emit('onItemClick', vl);
            }
        },
        checkOpen(idx){
            return this.openList.indexOf(idx) != -1 ? true : false;
        }
    },
}
</script>
<style lang="scss" scoped>
.tree-menu {
    width: 100%;
    box-sizing: border-box;
    padding-bottom: 20px;
    .tree-items-temp {
        width: 100%;
        .tree-children {
            width: 100%;
            height: 0px;
            overflow: hidden;
            transition-property: all;
        }
        .tree-items, .tree-items-children{
            width: 100%;
            height: 44px;
            box-sizing: border-box;
            padding: 0 15px;
            display: inline-flex;
            .tree-items-temp-icon {
                width: 29px;
                height: 29px;
                border-radius: 4px;
                // border: solid 1px #8C8C8C;
                text-align: center;
                margin-right: 14px;
                margin-top: 7px;
                .item-icon {
                    display: block;
                    width: 100%;
                    height: 100%;
                    background-size: 100% 100%;
                }
            }
            .tree-items-temp-content {
                flex: 1;
                display: inline-flex;
                border-bottom: solid 1px #AAAAAA;
                .tree-items-temp-name {
                    flex: 1;
                    font-size: 17px;
                    color: #030303;
                    line-height: 44px;
                    width: 0;
                    div {
                        // width: 100%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                .tree-items-temp-opt {
                    width: 96px;
                    line-height: 44px;
                    box-sizing: border-box;
                    padding-left: 28px;
                    .opt-text {
                        font-size: 17px;
                        color: #C7C7C7;
                        display: inline-block;
                    }
                    .opt-icon {
                        display: inline-block;
                        margin-left: 10px;
                        transition: all 0.5s;
                        i{
                            font-size: 13px;
                            color: #C7C7C7;
                        }
                    }
                    .icon_dir {
                        transform: rotate(180deg);
                    }
                }
            }
        }
        .tree-items-children{
            // transition: all 0.5s;
            // display: none;
        }
        .children-open{
            // display: inline-flex;
        }
        .children-temp-enter, .type-panel-leave-active {
            height: 0;
            // opacity: 1;
            overflow: hidden;
        }
        .children-temp-enter-to{
            // height: ‘’;
            // opacity: 1;
            height: 44px;
            
        }
        .children-temp-leave {
            height: 44px;
            overflow: hidden;
        }
        .children-temp-enter-active, .children-temp-leave-active {
            transition: all 1000ms;
        }
    }
}
</style>