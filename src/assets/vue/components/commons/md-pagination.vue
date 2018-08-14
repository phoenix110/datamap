<template>
    <div class="md-pagination">
        <div class="total">共 {{totalPage}} 页</div>
        <div class="size-select"></div>
        <div class="page-btn">
            <div class="prepend-btn" @click="onPageChange('prepend')"><i class="f7-icons" :style="{color: prependDis ? '#c0c4cc' : ''}">left</i></div>
            <ul>
                <li v-for="(vl, i) in selectList" :key="i" :style="{color: vl == currentPage ? '#007aff' : ''}">{{vl}}</li>
            </ul>
            <div class="append-btn" @click="onPageChange('append')"><i class="f7-icons" :style="{color: appendDis ? '#c0c4cc': ''}">right</i></div>
        </div>
        <div class="page-jump">
            <span class="text">前往 </span>
            <input v-model="inputPage" @input="onPageInput"/>
            <span class="text"> 页</span>
        </div>
        <div class="skip-btn" @click="onPageChange('skip')" :style="{color: skipBtnDis ? '#8cc5ff' : '#007aff'}">跳转</div>
    </div>
</template>
<script>
export default {
    name: "Md-Pagination",
    props: {
        total: Number,
        pageSize: {
            type: Number,
            default: 12,
        },
        currentPage: {
            type: Number,
            default: 1,
        },
        pageSizeList: Array,
    },
    data(){
        return {
            skipPage: this.currentPage,
            inputPage: 1,
            selectList: [],
            totalPage: 0,
            prependDis: true,
            appendDis: false,
            skipBtnDis: false,
        }
    },
    watch: {
        total: function(newNum, oldNum){
            this.totalPage = Math.ceil(this.total/this.pageSize);
            if(this.totalPage == 0){
                this.prependDis = true;
                this.appendDis = true;
            }
            else{
                this.prependDis = this.currentPage == 1;
                this.appendDis = this.currentPage == this.totalPage;
            }
            this.setSelectList();
        }
    },
    created(){
        this.totalPage = Math.ceil(this.total/this.pageSize);
        if(this.totalPage == 0){
            this.prependDis = true;
            this.appendDis = true;
        }
        else{
            this.prependDis = this.currentPage == 1;
            this.appendDis = this.currentPage == this.totalPage;
        }
        this.setSelectList();
    },
    methods: {
        onPageInput(){
            this.skipBtnDis = this.inputPage > this.totalPage || this.inputPage=="";
        },
        onPageChange(type){
            let callback = false, _this = this;
            switch(type){
                case "prepend": 
                if(!_this.prependDis){
                    callback = true;
                    this.skipPage -= 1;
                    _this.appendDis = false;
                    if(this.skipPage == 1){
                        _this.prependDis = true;
                    }
                }; break;
                case "append": 
                if(!_this.appendDis){
                    callback = true;
                    _this.skipPage += 1;
                    _this.prependDis = false;
                    if(_this.skipPage == _this.totalPage){
                        _this.appendDis = true;
                    }
                }; break;
                case "skip": 
                if(!_this.skipBtnDis){
                    callback = true;
                    _this.skipPage = parseInt(this.inputPage);
                    if(_this.skipPage == 1 && _this.totalPage != 1){
                        _this.prependDis = true;
                        _this.appendDis = false;
                    }
                    else if(_this.skipPage == _this.totalPage && _this.totalPage != 1){
                        _this.appendDis = true;
                        _this.prependDis = false;
                    }
                    else{
                        if(_this.totalPage != 1){
                            _this.appendDis = false;
                            _this.prependDis = false;
                        }
                    }
                }; break;
            }
            
            if(callback){
                this.setSelectList();
                this.$emit("onPageChange", this.skipPage);
            }
        },
        setSelectList(){
            if(this.totalPage > 2){
                if(1 < this.skipPage && this.skipPage < this.totalPage){
                    let sum = [this.skipPage-1, this.skipPage, this.skipPage+1];
                    this.selectList = sum;
                }
                else if(this.skipPage == 1){
                    let sum = [1, 2, 3];
                    this.selectList = sum;
                }
                else if(this.skipPage == this.totalPage){
                    let sum = [this.totalPage-2, this.totalPage-1, this.totalPage];
                    this.selectList = sum;
                }
            }
            else{
                let selectList = [];
                for(let i = 1; i <= this.totalPage; i++){
                    selectList.push(i);
                }
                this.selectList = selectList;
            }
        }
    }
}
</script>
<style scoped lang="scss">
.md-pagination {
    width: 100%;
    height: 52px;
    font-family: PingFang SC;
    font-size: 14px;
    color: #a1a6b2;
    padding: 16px 24px;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background-color: #f9f9f9;
    .total {
        line-height: 20px;
        margin-right: 2px;
    }
    .page-btn {
        height: 20px;
        .prepend-btn, .append-btn {
            line-height: 20px;
            display: inline-block;
            box-sizing: border-box;
            padding: 0 3px 0 3px;
            vertical-align: top;
        }
        i {
            font-size: 18px;
            color: #a1a682;
            line-height: 20px;
        }
        ul {
            display: inline-block;
            margin: 0;
            padding: 0;
            li {
                list-style-type: none;
                display: inline-block;
                vertical-align: top;
                text-align: center;
                line-height: 20px;
                box-sizing: border-box;
                padding: 0 4px;
            }
        }
    }
    .page-jump {
        margin-left: 10px;
        .text {
            line-height: 20px;
        }
        input {
            width: 30px;
            height: 20px;
            box-sizing: border-box;
            border: solid 1px #dcdfe6;
            border-radius: 4px;
            padding: 0 3px;
            text-align: center;
        }
    }
    .skip-btn {
        line-height: 20px;
        margin-left: 10px;
        font-size: 14px;
    }
}
</style>