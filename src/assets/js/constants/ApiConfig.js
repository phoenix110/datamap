/**
 * Created by ylji on 6/22/16.
 */
import {
    __DEV__,
    __PROD__,
    __STABLE__,
    __JUMP__,
} from '../dev-config';

const baseHost = window.location.host;
const hosts = baseHost + window.location.pathname;
let base_api = 'http://m.lite.maicedata.com/';
let model_api = base_api + 'datamap/';
let map_api = base_api + 'map/';
let static_map = 'http://mdt-prod-public.oss-cn-hangzhou.aliyuncs.com/';

let api_url = process.env.API_URL || '192.168.1.240:8889';

//跳板机
if (__JUMP__) {
    base_api = 'http://localhost:8889/';
    model_api = base_api;
    map_api = 'http://localhost:8891/';
    static_map = 'http://mdt-dev-public.oss-cn-hangzhou.aliyuncs.com/';
} else if (__DEV__) {
    base_api = `http://${api_url}/`;
    model_api = base_api;
    map_api = 'http://192.168.1.240:8891/';
    static_map = 'http://mdt-dev-public.oss-cn-hangzhou.aliyuncs.com/';
} else if (__STABLE__) {
    base_api = 'http://ms.lite.maicedata.com/';
    model_api = base_api + 'datamap/';
    map_api = base_api + 'map/';
    static_map = 'http://mdt-staging-public.oss-cn-hangzhou.aliyuncs.com/';
}
// http://192.168.1.212/auth-stage/login
export const hostss = hosts;
export const model_api_url = model_api;
export const mdtauth_api_url = model_api + 'auth/';
export const map_api_url = map_api;
export const static_map_url = static_map;
export const headers = {};
export const paramFake = '';
export const fakeParamObj = {};
