/**
 * Created by hzzcc on 2016/10/18.
 */
import isNull from 'lodash/isNull'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import forge from 'node-forge'

const chartCode = 64;

function StringFromCharCode(n) {
    var code = chartCode + ~~n;
    return String.fromCharCode(code);
}

function StringFromCharCodeExt(n) {
    var str = "", code, nt;
    while (n > 0) {
        nt = (n - 1) % 26 + 1;
        code = chartCode + nt;
        str = String.fromCharCode(code) + "" + str;
        n = ~~((n - 1) / 26);
    }
    return str;
}

function CharCode2Int(s) {
    return s.charCodeAt() - chartCode;
}

function isNon(val) {
    return (isNull(val) || isNaN(val) || isUndefined(val) ||
        val == "NaN" || val == "null" || val == 'undefined');
}

function getMd5Str(str) {
    var md = forge.md.md5.create();
    md.update(str);
    return md.digest().toHex();
}

function getMd5Key(data) {
    return getMd5Str(JSON.stringify(data || {}));
}

function getJsonObj(str) {
    let rslt;
    if (str) {
        try {
            rslt = JSON.parse(str);
        } catch (e) {
            console.log('JSON parse err: ', e);
        }
    }
    return rslt;
}

function decodeUnicode(str) {
    str = str.replace(/\\/g, "%");
    return unescape(str);
}

function dataURLtoBlob(dataurl, onlyData) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return onlyData ? u8arr : new Blob([u8arr], {type: mime});
}

export {
    isNon,
    getMd5Str,
    getMd5Key,
    StringFromCharCode,
    StringFromCharCodeExt,
    CharCode2Int,
    getJsonObj,
    decodeUnicode,
    dataURLtoBlob
}
