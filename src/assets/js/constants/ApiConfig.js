/**
 * Created by ylji on 6/22/16.
 */
import {
    __DEV__,
    __PROD__,
    __STABLE__,
    __JUMP__,
} from '../dev-config';

var baseHost = window.location.host;
var hosts = baseHost + window.location.pathname;
var model_api = 'http://m.lite.maicedata.com/algo/';
var mdtauth_api = 'http://m.lite.maicedata.com/algo/auth/';
var static_map = 'http://mdt-prod-public.oss-cn-hangzhou.aliyuncs.com/';

let api_url = process.env.API_URL || '192.168.1.240:8889';

//跳板机
if (__JUMP__) {
    model_api = 'http://localhost:8889/';
    mdtauth_api = 'http://localhost:8889/auth/';
    static_map = 'http://mdt-dev-public.oss-cn-hangzhou.aliyuncs.com/';
} else if (__DEV__) {
    model_api = `http://${api_url}/`;
    mdtauth_api = `http://${api_url}/auth/`;
    static_map = 'http://mdt-dev-public.oss-cn-hangzhou.aliyuncs.com/';
} else if (__STABLE__) {
    model_api = 'http://ms.lite.maicedata.com/algo/';
    mdtauth_api = 'http://ms.lite.maicedata.com/algo/auth/';
    static_map = 'http://mdt-staging-public.oss-cn-hangzhou.aliyuncs.com/';
}
// http://192.168.1.212/auth-stage/login
export const hostss = hosts;
export const model_api_url = model_api;
export const static_map_url = static_map;
export const mdtauth_api_url = mdtauth_api;
export const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};
export const paramFake = __DEV__ ? '&fake_app_id=22&fake_user_id=16' : '';
export const fakeParamObj = __DEV__ ? {fake_app_id:22,fake_user_id:16} : {};
