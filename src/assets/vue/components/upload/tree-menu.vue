<template>
    <div class="tree-menu">
        <div class="tree-items-temp" v-for="(vl, idx) in data" :key="idx">
            <div :class="['tree-items', vl.isParent ? 'is-folder-style' : '']" @click="onItemClick(vl, idx)">
                <div class="tree-items-temp-icon">
                    <i class="item-icon" :style="{'backgroundImage': vl.isParent ? folder_icon : file_icon[vl.geo_type]}"></i>
                </div>
                <div class="tree-items-temp-content line-split">
                    <div class="tree-items-temp-name">
                        <div>{{vl.name}}</div>
                    </div>
                    <div :ref="'opt'+idx" class="tree-items-temp-opt" v-if="vl.isParent">
                        <div class="opt-icon"><i class="icon-arrow-down"></i></div>
                    </div>
                </div>
            </div>
            <div class="tree-children" :style="treeListStyle(vl, idx)">
                <div class="tree-items-children" v-for="(vl2, idx2) in vl.children" :key="idx2"  @click="onItemClick(vl2, idx2)">
                    <div class="tree-items-temp-icon">
                        <i class="item-icon" :style="{'backgroundImage': file_icon[vl2.geo_type]}"></i>
                    </div>
                    <div class="tree-items-temp-content line-split">
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
            folder_icon: "url(./static/images/icon_folder.svg)",
            file_icon: {
                "point": "url(./static/images/icon_point.svg)",
                "polygon": "url(./static/images/icon_polygon.svg)",
                "line": "url(./static/images/icon_line.svg)",
            }
        }
    },
    methods: {
        onItemClick(vl, idx){
            if(vl.isParent){
                if(this.openList.indexOf(idx) != -1){
                    let i = this.openList.indexOf(idx);
                    this.openList.splice(i, 1);
                    this.$refs['opt'+idx][0].children[0].classList.remove('icon_dir');
                }
                else{
                    this.openList.push(idx);
                    this.$refs['opt'+idx][0].children[0].classList.add('icon_dir');
                }
            }
            else{
                this.$emit('onItemClick', vl);
            }
        },
        checkOpen(idx){
            return this.openList.indexOf(idx) != -1 ? true : false;
        },
        treeListStyle(vl, idx) {
            let len = vl.children ? vl.children.length : 0;
            let animateTime = len > 10 ? '500ms' : len*50+'ms';
            return {
                'height': this.checkOpen(idx) ? (len*44+'px') : 0, 
                'transitionDuration': animateTime,
            }
        }
    },
}
</script>
<style lang="scss" scoped>
.tree-menu {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 20px;
    overflow-x: hidden;
    background-color: #fff;
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
            padding-left: 15px;
            display: inline-flex;
            background-color: #fff;
            position: relative;
            .tree-items-temp-icon {
                width: 29px;
                height: 29px;
                border-radius: 4px;
                text-align: center;
                margin-right: 15px;
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
                box-sizing: border-box;
                padding-right: 15px;
                position: relative;
                .tree-items-temp-name {
                    flex: 1;
                    font-size: 17px;
                    color: #030303;
                    line-height: 44px;
                    width: 0;
                    div {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                .tree-items-temp-opt {
                    line-height: 44px;
                    box-sizing: border-box;
                    padding-left: 16px;
                    .opt-icon {
                        display: inline-block;
                        transition: all 0.5s;
                        i{
                            font-size: 14px;
                            color: #bfbfbf;
                        }
                    }
                    .icon_dir {
                        transform: rotate(180deg);
                    }
                }
            }
        }
        .is-folder-style {
            height: 54px;
            .tree-items-temp-icon {
                margin-top: 12px;
            }
            .tree-items-temp-content {
                position: relative;
                .tree-items-temp-name, .tree-items-temp-opt {
                    line-height: 54px;
                }
            }
        }
        .tree-items-children{
            background-color: #FBFBFD;
        }
    }
    
}
</style>