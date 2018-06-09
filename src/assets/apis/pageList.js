import fetchUtil from 'src/assets/js/utils/fetchUtil';
import {model_api_url, paramFake} from 'src/assets/js/constants/ApiConfig';

const getData = function() {
    return fetchUtil(`${model_api_url}vault/page?detail=true&filter_type=filter_type_mobile${paramFake}`)
}

export {
    getData,
}