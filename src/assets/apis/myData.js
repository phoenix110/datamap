import fetchUtil from 'src/assets/js/utils/fetchUtil';
import queryUrl from 'src/assets/js/utils/queryUrl';
import {model_api_url} from 'src/assets/js/constants/ApiConfig';

const getResourcesData = function() {
    let params = {use_customer: 'True'};
    return fetchUtil(queryUrl(`${model_api_url}datamap/poi/v2/filters/level/4`, params));
};

const fetchDirectoryConfigData = function(directory_cfg, id){
    return fetchUtil(queryUrl(`${model_api_url}vault/directory/${directory_cfg}_${id}`));
}

export {
    getResourcesData,
    fetchDirectoryConfigData,
}