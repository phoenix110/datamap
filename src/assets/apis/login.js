import fetchUtil from '../js/utils/fetchUtil';
import {model_api_url, mdtauth_api_url, headers} from '../js/constants/ApiConfig';
import {getMd5Str} from '../js/utils/strUtil';

const login = function(name, password) {
    let bodyData = JSON.stringify({name: name, password: getMd5Str(password)});
    let url = mdtauth_api_url + "login", urlData = {method: "POST", body: bodyData, headers};
    return fetchUtil(url, urlData)
}

const wxlogin = function (code) {
  let postdata = JSON.stringify({
    code: code,
  })
  let url = `${model_api_url}mobile/auth/loginwx`;
  return fetchUtil(url, {method: 'POST', headers, body: postdata})
}

export {
  login,
  wxlogin,
}
