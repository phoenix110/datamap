import fetchUtil from 'src/assets/js/utils/fetchUtil';
import queryUrl from 'src/assets/js/utils/queryUrl';
import {model_api_url, headers} from 'src/assets/js/constants/ApiConfig'

const getCluseDataApi= function(MyDataCluse,pageNum,pageSize) {
  let data = JSON.stringify(
    {
      "object_types": [MyDataCluse.name]
    }
  );
  let url = `${model_api_url}upload/query`;
  let params = {
    geo_type: MyDataCluse.geo_type,
    with_geom: 'true',
    page_num: pageNum,
    page_size: pageSize
  };
  return fetchUtil(queryUrl(url, params),{method: 'POST', headers, body: data})
}

//获得评论数据集合col
const  getFeedsColApi = function(ids) {
  const url = `${model_api_url}feeds/customer_record/count`
  const params = {
    reference_ids: ids.join(','),
    types: 'text_comment,image_comment',
    action: "current",
    update_time: true,
    status: "created"
  }
  return fetchUtil(queryUrl(url, params))
}

//模糊搜索
const fuzzySearchcluseApi = function(MyDataCluse,searchPageNum,pageSize, query){
  let params = {
    source:MyDataCluse.source,
    object_type:MyDataCluse.name,
    q:query,
    geometry_type: MyDataCluse.geo_type,
    page_num:searchPageNum,
    page_size:pageSize,
  };
  let url = `${model_api_url}query`;
  return fetchUtil(queryUrl(url, params))
}



export {
  getCluseDataApi,
  getFeedsColApi,
  fuzzySearchcluseApi,
}


