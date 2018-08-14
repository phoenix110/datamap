import fetchUtil from 'src/assets/js/utils/fetchUtil';
import queryUrl from 'src/assets/js/utils/queryUrl';
import {model_api_url, headers} from 'src/assets/js/constants/ApiConfig'
import size from 'lodash/size'


const getSingleData = function(package_id, record_id) {
    return fetchUtil(queryUrl(`${model_api_url}data/customer/${package_id}/records/${record_id}`))
}

const getImgList = function(record_id) {
    return fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/${record_id}`,
    {types:'image_comment',status:'updated,created'}))
}

const getuserInfo = function(ids) {
    if (!size(ids)) return;
    return fetchUtil(queryUrl(`${model_api_url}auth/entity/user`,{ids:ids.join(",")},))
}

const getFeeds = function(record_id, pageNum, pageSize) {
    return fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/${record_id}`,
    {types:'text_comment',status:'updated,created',page_num:pageNum,page_size:pageSize}))
}

const getFeedCount = function(record_id) {
    const params = {
        reference_ids: record_id,
        types: 'text_comment',
        action: "current",
        update_time: true,
        status: "created"
    }
    return fetchUtil(queryUrl(`${model_api_url}feeds/customer_record/count`, params))
}

export {
    getSingleData,
    getImgList,
    getuserInfo,
    getFeeds,
    getFeedCount,
}