import fetchUtil from 'src/assets/js/utils/fetchUtil';
import {model_api_url} from 'src/assets/js/constants/ApiConfig';

const getData = function() {
    return fetchUtil(`${model_api_url}vault/page?detail=true&filter_type=filter_type_mobile`, {timeout: 15*1000})
}

const getPagDir = function(value){
    return fetchUtil(`${model_api_url}vault/page_dir/${value}`, {timeout: 15*1000})
}

export {
    getData,
    getPagDir,
}