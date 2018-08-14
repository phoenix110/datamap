import size from "lodash/size";

/**
 * 返回传入值的长度
 * @param {*} any
 */
function sizeExtend(value){
    if(!!value){
        if(typeof(value) === "number"){
            value = value.toString();
            return value.length;
        }
        else return size(value);
    }
    else return 0;
}

export {
    sizeExtend,
}