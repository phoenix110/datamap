import token from './tokenUtil'
import cookieUtil from './cookieUtil'
import slackHooks from './slackHooks'
import {stripObjAll} from './numberUtil'
import {paths} from '../constants/Constants'
import bus from './bus'

let deviceready = false;
document.addEventListener("deviceready", function () {
    deviceready = true;
})

function httpPromise(url, options) {
    if (!window.cordova) return new Promise((resolve, reject) => {reject()});
    return new Promise((resolve, reject) => {
        options = options || {};
        let headers = options.headers || {};
        let {'Content-Type': contentType, ...others } = headers;
        options = { method: options.method, data: options.body && JSON.parse(options.body), headers: { ...others}};
        cordova.plugin.http.setDataSerializer('json');
        cordova.plugin.http.sendRequest(url, options, (resp) => {
            resp.json = function() {
                return JSON.parse(resp.data);
            }
            resp.text = function() {
                return resp.data;
            }
            resolve(resp);
        }, (resp) => {
            console.log(JSON.stringify(resp));            
            resp.json = function() {
                return JSON.parse(resp.data);
            }
            resp.text = function() {
                return resp.data;
            }
            resolve(resp);
        })
    });
}

function injectFetch(url, options) {
    if (deviceready) {
        return httpPromise(url, options)
    }else{
        return new Promise((resolve) => {
            document.addEventListener("deviceready", function () {
                deviceready = true;
                resolve(httpPromise(url, options));
            })
        })
    }
    
}
var oldFetchfn = injectFetch; //拦截原始的fetch方法
window.fetch = function (input, opts) {//定义新的fetch方法，封装原有的fetch方法
    opts = opts || {};
    return new Promise(function (resolve, reject) {
        var timeoutId;
        // opts.timeout = 2 * 60 * 1000;
        if (opts.timeout) {
            timeoutId = setTimeout(function () {
                let err = new Error("fetch timeout");
                slackHooks.sendToSlack({url: input, options: JSON.stringify(opts), err: err})
                reject(err);
            }, opts.timeout);
        }
        var abort_promise = function () {
            reject(new Error("fetch abort"))
        };
        var p = oldFetchfn(input, opts).then(
            res => {
                clearTimeout(timeoutId);
                resolve(res)
            },
            err => {
                clearTimeout(timeoutId);
                slackHooks.sendToSlack({url: input, options: JSON.stringify(opts), err: err})
                reject(err)
            }
        )
        p.abort = abort_promise;
        return p;
    })
}

function emit401() {
    if (!bus.has401) {
        token.set("");
        bus.has401 = true;
        bus.$emit('401');
    }
}

export default function(url, opt) {
    opt = opt || {};
    opt.headers = opt.headers || {};
    opt.headers.Authorization = token.get();
    if (bus.has401) return new Promise((resolve, reject) => {
        return reject(new Error(401));
    }); //如果有api401，则后续api不请求
    return new Promise((resolve, reject) => {
        return fetch(url, opt).then((rep) => {
            if (rep.status == 401) {// 未验证通过
                emit401();
            }
            let resp, errPromise, errStatus, errMsg;
            if (rep.status >= 200 && rep.status < 300 && rep.status != 204) {
                resp = rep.json();
            } else if (rep.status == 204) {
                resp = {Status: 204, Msg: "暂无内容"};
            } else if (rep.status == 304) {
                resp = {Status: 304, Msg: "内容无修改"};
            } else {
                resp = {Status: "1", status: rep.status, Msg: "网络错误: ".concat(rep.status, " ", rep.statusText)};
                errPromise = rep.text();
                errStatus = rep.status;
                errMsg = rep.statusText;
            }
            rep.headers.get && rep.headers.get('Authorization') && token.set(rep.headers.get('Authorization'));
            rep.headers.authorization && token.set(rep.headers.authorization);
            return [resp, errPromise, errStatus, errMsg];
        }).then(([resp, errPromise, errStatus, errMsg]) => {
            if (errPromise && url.indexOf('index.php') !== -1) {
                errPromise.then(errRsp => {
                    let err = new Error([errStatus, errMsg, errRsp].join(", "));
                    slackHooks.sendToSlack({url: url, options: JSON.stringify(opt), err: err});
                })
            }
            resolve(resp);
        }).catch(err => {
            if (url.indexOf('index.php') !== -1) {
                slackHooks.sendToSlack({url: url, options: JSON.stringify(opt), err: err});
            }
            reject(err);
        })
    }).then(resp => {
        resp = stripObjAll(resp);
        return resp
    })
}

