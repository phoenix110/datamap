/**
 * Created by ylji on 2017/08/08.
 */
import {
    __DEV__,
    __PROD__,
    __STABLE__,
    __JUMP__,
} from '../dev-config';
const c_version = 2.0;
const app_name = 'datamap_app';
const app_id = 7;
const app_key = 'wx3a979c1dcfab2f50';
const cache_version = `${app_name}_[${c_version}]_`;
let upload_bucket = 'mdt-prod';
const upload_root_dir = 'upload';

if (__DEV__||__JUMP__) {
    upload_bucket = 'mdt-test';
}else if (__STABLE__) {
    upload_bucket = 'mdt-staging';
}

export {
	app_name,
	app_id,
	app_key,
	cache_version,
    upload_bucket,
    upload_root_dir,
}
