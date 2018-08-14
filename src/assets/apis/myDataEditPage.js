import fetchUtil from 'src/assets/js/utils/fetchUtil';
import queryUrl from 'src/assets/js/utils/queryUrl';
import {model_api_url, headers} from 'src/assets/js/constants/ApiConfig'



const modifyData = function(params) {
    return fetchUtil(queryUrl(`${model_api_url}upload/modify`),
    {method: 'PUT', headers, body: JSON.stringify(params)})
}

export {
    modifyData,
}