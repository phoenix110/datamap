var serialize = function (obj, unEncode = false, prefix) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            //修改,api需要的格式:attr=name&attr=lng&attr=lat
            if (obj.hasOwnProperty('length')) {
                k = prefix ? prefix : p;
            }
            //end
            if (unEncode) {
                str.push(typeof v == "object" ?
                    serialize(v, unEncode, k) :
                    k + "=" + v);
            } else {
                str.push(typeof v == "object" ?
                    serialize(v, unEncode, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }

        }
    }
    return str.join("&");
}

export default serialize;
