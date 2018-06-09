/**
 * Created by hzz on 2017/9/9.
 */

'use strict';
import {app_name} from '../constants/AppConfig'
import userUtil from './userUtil';
import tokenUtil from './tokenUtil';
import map from 'lodash/map'
import forEach from 'lodash/forEach';
import {
    __DEV__,
    __PROD__,
    __STABLE__,
    __JUMP__,
} from '../dev-config';

const STABLE = __STABLE__ + "";
// const STABLE = "true";
const PROD = __PROD__ + "";
const wekhooks = {
    [STABLE]: 'https://hooks.slack.com/services/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',
    [PROD]: 'https://hooks.slack.com/services/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',
}
const web_env = {
    [STABLE]: "staging",
    [PROD]: "prod",
}
const hookUrl = wekhooks["true"];

const ignoreMsgs = ['index.php', "TypeError: Cannot read property 'resize' of null", "fetch timeout"];

function sendToSlackBasic(text, info_text, attachments) {
    try { //try catch 避免被reportError捕捉
        let time = (new Date().getTime() / 1000).toFixed();
        text = `<!date^${time}^{date_num} {time_secs}|2014-02-18 6:39:42 AM> \n` + text;
        const msg = {
            text: text,
            attachments: [{
                text: info_text,
                fields: [
                    {"title": "Project", "value": app_name, "short": true},
                    {"title": "Environment", "value": web_env["true"], "short": true}
                ],
                color: "#F35A00",
                ...attachments,
            }],
        }
        // console.log('slack msg:', msg);
        var xmlhttp = new XMLHttpRequest(),
            myJSONStr = 'payload=' + JSON.stringify(msg);
        xmlhttp.open('POST', hookUrl, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttp.send(myJSONStr);
    } catch (err) {
        console.log('sendToSlackBasic err');
        console.error(err);
    }
}

function sendToSlack(text_msg, attachments) {
    console.log('reportError', text_msg, attachments);
    if (process.env.NODE_ENV === 'development') return;
    try { //try catch 避免被reportError捕捉
        if (!hookUrl) return;
        let userInfo = userUtil.get() || {};
        let token = tokenUtil.get() || '';
        let info_text_map = {
            userId: userInfo.id,
            userName: userInfo.name,
            token: token,
        }
        let info_text_arr = [];
        map(info_text_map, (value, key) => {
            try { //try catch 避免被reportError捕捉
                info_text_arr.push(`${key}: ${value}`);
            } catch (err) {
                console.log('sendToSlack err1');
                console.error(err);
            }
        });
        let text_arr = [];
        text_msg = text_msg || {};
        text_msg["BrowserInfo"] = "";
        for (let i in navigator) {
            if (typeof navigator[i] === "string" && navigator[i]) {
                text_msg["BrowserInfo"] = text_msg["BrowserInfo"] + "\n" + i + ": " + navigator[i];
            }
        }
        map(text_msg, (value, key) => {
            try { //try catch 避免被reportError捕捉
                if (value && (value instanceof Error)) {
                    value = "Error:" + value.message + ", Stack:" + value.stack;
                }
                value = JSON.stringify(value);
                if (value && value.replace && encodeURIComponent) {
                    value = value.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\\\\/g, "'")
                        .replace(/\\"/g, "'")
                        .replace(/"/g, "'")
                    value = encodeURIComponent(value);
                }
                text_arr.push(`:arrow_right: [${key}]:  ${value}`);
            } catch (err) {
                console.log('sendToSlack err2');
                console.error(err);
            }
        });

        let sendMsg = text_arr.join("\n"), findIgnore = false;
        forEach(ignoreMsgs, t => {
            if (sendMsg.indexOf(t) !== -1) {
                findIgnore = true;
                return false;
            }
        });
        if (findIgnore) return;
        sendToSlackBasic(sendMsg, info_text_arr.join(", "), attachments)
    } catch (err) {
        console.log('sendToSlack err3', text_msg, attachments);
        console.error(err);
    }
}

module.exports = {
    sendToSlack
};
