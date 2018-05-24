/**
 * Created by hzzcc on 2016/11/10.
 */
import {isNon} from './strUtil'
import {ckmeans} from 'simple-statistics'
import {uniq, trimEnd, forEach} from 'lodash'

// 格式化数字
function formatNumber(n) {
    if (isNon(n)) {
        return 0;
    }
    var s = n.toString().split(".")[1];
    var b = parseInt(n).toString();
    var len = b.length;
    var rslt = b;
    if (len <= 3) {
        if (s) {
            rslt = b + "." + s
        }
        return rslt;
    }
    var r = len % 3;
    rslt = r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
    if (s) {
        rslt = rslt + "." + s
    }
    return rslt
}

var rand = (function () {
    var today = new Date();
    var seed = today.getTime();

    function rnd() {
        seed = ( seed * 9301 + 49297 ) % 233280;
        return seed / ( 233280.0 );
    }

    return function rand(number) {
        number = number || 1;
        return rnd(seed) * number;
    };
})();

var calculateAverageBreaks = function (min, max, breakLen) {
    max = max < 1 ? max.toExponential(2) * 1 : max.toFixed() * 1;
    var vals = [max], radio = (max - min) / breakLen;
    for (let i = breakLen - 1; i > 0; i--) {
        let val = min * 1 + radio * i;
        val = Math.abs(val) < 1 ? val.toExponential(2) : val.toFixed();
        (val == min || val == max) && (val = '');
        val = val * 1;
        if (val == val) {
            vals.push(val);
        }
    }
    if (max !== max || max === -Infinity) {
        vals[0] = Infinity;
    }
    if (min === min && min !== Infinity) {
        vals.push(min < 1 ? min.toExponential(2) * 1 : min.toFixed() * 1);
    } else {
        vals.push(-Infinity);
    }
    vals = uniq(vals);
    return vals.reverse();
}

var calculateNBC = function (max, data, breakLen) {
    var breaks = ckmeans(data, breakLen).map((cluster) => {
        return cluster[0];
    });
    breaks.push(max);
    return breaks;
}

var trimFloatZero = function (num, pre = 2) {
    let rslt = trimEnd(trimEnd((num * 1).toFixed(pre), '0'), '.') || 0;
    if (pre === 0) {
        rslt = (num * 1).toFixed(pre);
    }
    if (rslt == 'NaN') {
        rslt = 0;
    }
    return rslt;
}

var strip = function(num, precision = 12) {
    return +parseFloat(num.toPrecision(precision));
}

var stripObjAll = function(obj) {
    if (typeof obj === 'object') {
        forEach(obj, (t, key) => {
            obj[key] = stripObjAll(obj[key]);
        })
        return obj;
    }else if (typeof obj === 'number'){
        return strip(obj);
    }else {
        return obj;
    }
}

export {
    rand,
    formatNumber,
    calculateAverageBreaks,
    calculateNBC,
    trimFloatZero,
    strip,
    stripObjAll,
};
