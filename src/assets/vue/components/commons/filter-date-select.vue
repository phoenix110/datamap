<template>
    <div class="date-select-page">
        <div class="date-select-btn">
            <div class="all-select-btn">
                <div :class="['item-btn', dateBtn==='all' ? 'btn-active' : '']" @click="onClickDateBtn('all')">全部</div>
            </div>
            <div class="part-select-btn">
                <div :class="['item-btn', dateBtn==='lastWeek' ? 'btn-active' : '']" @click="onClickDateBtn('lastWeek')">上周</div>
                <div :class="['item-btn', dateBtn==='lastMonth' ? 'btn-active' : '']" @click="onClickDateBtn('lastMonth')">上月</div>
                <div :class="['item-btn', dateBtn==='lastQuarter' ? 'btn-active' : '']" @click="onClickDateBtn('lastQuarter')">上季度</div>
                <div :class="['item-btn', dateBtn==='lastYear' ? 'btn-active' : '']" @click="onClickDateBtn('lastYear')">去年</div>
            </div>
            <div class="month-select-btn">
                <div :class="['item-btn', dateBtn==='nearMonth' ? 'btn-active' : '']"  @click="onClickDateBtn('nearMonth')">近30天</div>
            </div>
        </div>
        <div class="date-show-panel">
            <div :class="['date-start', dateType === 'start' ? 'active-text' : '']" @click="onOpenDatePicker('start')">{{startDate}}</div>
            <span>至</span>
            <div :class="['date-end', dateType === 'end' ? 'active-text' : '']" @click="onOpenDatePicker('end')">{{endDate}}</div>
        </div>
    </div>
</template>
<script>
import moment from "moment";
import cloneDeep from "lodash/cloneDeep";
import bus from '../../../js/utils/bus';
const dateFormatter = "YYYY-MM-DD";
export default {
    name: "date-select-page",
    props: ["filterData"],
    data(){
        return {
            filter: {},
            index: "",
            startDate: "",
            endDate: "",
            dateType: "",
            dateBtn: "",
            clickIndex: false,
            pickerDate: {},
            pickerValues: [],
            dayList: ["1日","2日","3日","4日","5日","6日","7日","8日","9日","10日","11日","12日","13日","14日","15日","16日","17日","18日","19日","20日","21日","22日","23日","24日","25日","26日","27日","28日","29日","30日","31日"]
        }
    },
    created(){
        let {filterData: {index, filter}} = this;
        this.filter = filter;
        this.index = index;
        if(!!this.filter){
            let start = this.filter.start.split("/"), end = this.filter.end.split("/");
            this.startDate = start.join("-");
            this.endDate = end.join("-");
        }
    },
    mounted(){
        this.createPicker();
    },
    methods: {
        createPicker(){
            let _this = this;
            let {testCancel, onClickPickerOk} = this;
            this.pickerDate = this.$f7.picker.create({
                inputEl: '<input />',
                rotateEffect: true,
                momentumRatio: 5,
                renderToolbar: function(){
                    return `<div class="toolbar"><div class="toolbar-inner"><div class="left"></div><div class="right"><a href="#" class="link sheet-close popover-close datePickerOk">确定</a></div></div></div>`;
                },
                cols: [
                    {
                        textAlign: "left",
                        values: (function(){
                            let years = [];
                            for(let i = 1970; i <= 2050; i++){
                                years.push(i+"年");
                            }
                            return years;
                        })(),
                        onChange: function(picker){
                            if(picker.cols[2].replaceValues){
                                let year = parseInt(picker.cols[0].value.replace("年", "")), month = parseInt(picker.cols[1].value.replace("月", "")), dayList = [];
                                let days = _this.mGetDate(year, month);
                                for(let j = 1; j <= days; j++){
                                    dayList.push(j+"日");
                                }
                                picker.cols[2].replaceValues(dayList);
                            }
                        }
                    },
                    {
                        textAlign: "center",
                        values: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                        onChange: function(picker){
                            if(picker.cols[2].replaceValues){
                                let year = parseInt(picker.cols[0].value.replace("年", "")), month = parseInt(picker.cols[1].value.replace("月", "")), dayList = [];
                                let days = _this.mGetDate(year, month);
                                for(let j = 1; j <= days; j++){
                                    dayList.push(j+"日");
                                }
                                picker.cols[2].replaceValues(dayList);
                            }
                        }
                    },
                    {
                        textAlign: "right",
                        values: _this.dayList,
                    }
                ],
                on: {
                    change: (picker, value, displayValue) => {
                        this.pickerValues = value;
                    },
                    closed: (picker) => {
                        this.$$(".datePickerOk")[0].removeEventListener("click", () => {});
                        _this.dateType = "";
                        _this.clickIndex = false;
                    },
                }
            });
        },
        onOpenDatePicker(type){
            let {clickIndex, pickerDate} = this;
            if(!clickIndex){
                this.clickIndex = true;
                this.dateType = type;
                pickerDate.open();
                this.$$(".datePickerOk")[0].addEventListener("click", () => {
                    this.onClickPickerOk();
                });
            }
        },
        onClickPickerOk(){
            let {pickerValues, dateType} = this;
            let values = cloneDeep(pickerValues);
            values.forEach((vl, dx, input) => {
                if(dx === 0){
                    input[dx] = vl.replace("年", "");
                }
                else if(dx === 1){
                    input[dx] = vl.replace("月", "");
                }
                else if(dx === 2){
                    input[dx] = vl.replace("日", "");
                }
            })
            if(dateType === "start"){
                this.startDate = values.join("-");
            }
            else if(dateType === "end"){
                this.endDate = values.join("-");
            }
            this.emitCurrentDate();
        },
        onClickDateBtn(type){
            this.dateBtn = type;
            switch(type){
                case "all": 
                    this.startDate = "全部";
                    this.endDate = "全部";
                    break;
                case "lastWeek": 
                    this.startDate = moment().subtract(1, 'weeks').startOf('week').add(1, 'days').format(dateFormatter);
                    this.endDate = moment().subtract(1, 'weeks').endOf('week').add(1, 'days').format(dateFormatter); 
                    break;
                case "lastMonth": 
                    this.startDate = moment().subtract(1, 'months').startOf('month').format(dateFormatter);
                    this.endDate = moment().subtract(1, 'months').endOf('month').format(dateFormatter); 
                    break;
                case "lastQuarter": 
                    let quarter = moment().quarter()
                    this.startDate = moment().quarter(quarter - 1).startOf('quarter').format(dateFormatter);
                    this.endDate = moment().quarter(quarter - 1).endOf('quarter').format(dateFormatter);
                    break;
                case "lastYear": 
                    this.startDate = moment().subtract(1, 'years').startOf('year').format(dateFormatter);
                    this.endDate = moment().subtract(1, 'years').endOf('year').format(dateFormatter);
                    break;
                case "nearMonth": 
                    this.startDate = moment().subtract(30, 'days').format(dateFormatter);
                    this.endDate = moment().format(dateFormatter);
                    break;
                default: break;
            }
            this.emitCurrentDate();
        },
        emitCurrentDate(){
            let {filter, index, startDate, endDate} = this;
            let start = startDate.split("-"), end = endDate.split("-");
            filter.start = start.join("/");
            filter.end = end.join("/");
            this.$emit("input", {filter, index});
        },
        mGetDate(year, month){
            var date = new Date(year, month, 0);
            return date.getDate();
        }
    }
}
</script>
<style scoped lang="scss">
.date-select-page {
    height: 100%;
    padding-top: 20px;
    box-sizing: border-box;
    background-color: #fff;
    font-family: PingFang SC;
    .date-select-btn {
        box-sizing: border-box;
        padding: 0 25px;
        .item-btn {
            line-height: 30px;
            padding: 0 16px;
            margin-right: 12px;
            box-sizing: border-box;
            text-align: center;
            color: #9699A0;
            font-size: 14px;
            border-radius: 4px;
            border: solid 1px #9699A0;
            display: inline-block;
        }
        .part-select-btn {
            width: 100%;
            margin-top: 26px;
            display: flex;
            flex-wrap: wrap;
            .item-btn {
                margin-top: 12px;
            }
        }
        .month-select-btn {
            margin-top: 26px;
        }
        .btn-active {
            border: none;
            color: #fff;
            background-color: #007aff;
        }
    }
    .date-show-panel {
        width: 100%;
        margin-top: 36px;
        box-sizing: border-box;
        padding: 0 25px;
        display: inline-flex;
        .date-start, .date-end {
            flex: 1;
            color: #979797;
            font-size: 17px;
            line-height: 30px;
            border-bottom: solid 1px #979797;
        }
        .active-text {
            color: #007aff;
            border-bottom-color: #007aff;
        }
        span {
            width: 50px;
            display: block;
            color: #979797;
            font-size: 14px;
            line-height: 30px;
            text-align: center;
        }
    }
}
</style>