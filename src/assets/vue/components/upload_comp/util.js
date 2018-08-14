import SparkMD5 from '../../../js/utils/spark-md5';
import fetchUtil from '../../../js/utils/fetchUtil';
import queryUrl from '../../../js/utils/queryUrl';
import forEach from 'lodash/forEach'
import {model_api_url} from '../../../js/constants/ApiConfig'

/**
 * native端返回true。web端返回false
 */
export const isCordovaDevice = function() {
    return device && device.platform && device.platform.toLowerCase() !== "browser";
}

/**
 * 返回设备类型
 */
export const cordovaDeviceType = function() {
    return device && device.platform && device.platform.toLowerCase();
}

/**
 * blob转换file对象
 * @param {*} theBlob 
 * @param {*} fileName 
 */
function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

/**
 * 本地读取
 * @param {*} picUrl 
 */
export const getFileFromPath = function(picUrl) {
    console.log('picUrl:', picUrl)
    picUrl = 'file://' + picUrl;
    return new Promise((resolve) => {
        window.resolveLocalFileSystemURL(picUrl, function(fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                    var blob = new Blob([new Uint8Array(this.result)], { type: file.type });
                    let fileNew = blobToFile(blob, file.name);
                    console.log("convert blob to file",JSON.stringify(fileNew))
                    resolve({file: fileNew});
                };
                // Read the file as an ArrayBuffer
                reader.readAsArrayBuffer(file);
            }, function (err) { 
                console.error('error getting fileentry file!' + JSON.stringify(err)); 
                resolve({err});
            });
        }, function (err) {
            console.error('error resolve file:' + JSON.stringify(err));
            resolve({err});
        })
    })
}

/**
 * 转换ObjectURL，用于展示图片
 * @param {*} file 
 */
export const readFileAsImageWeb = function(file) {
    return new Promise((resolve) => {
        // var reader = new FileReader();
        // reader.onload = function (evt) {
        //     let base64image = evt.target.result;
        //     resolve(base64image);
        // }
        // reader.readAsDataURL(file);
        let blob = new Blob([file]), // 文件转化成二进制文件
            url = URL.createObjectURL(blob);
        resolve(url); 
    })
}

/**
 * 转换图片为链接，展示用，各平台通用处理
 * @param {*} fileOrPath 
 */
export const readFileAsImageAllPlatform = function(fileOrPath) {
    return new Promise((resolve) => {
        if (isCordovaDevice()) {
            resolve('file://' + fileOrPath.path);
        }else {
            readFileAsImageWeb(fileOrPath).then((objectUrl) => {
                resolve(objectUrl)
            })
        }
    })
}

/**
 * 获取文件 md5
 * @param {*} file 
 * @param {*} callback 
 */
export const getFileMd5 = function(file, callback) {
    let chunkSize = 2097152,                             // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader();

    fileReader.onload = function (e) {
        // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
        spark.append(e.target.result);                   // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
            let progress = (currentChunk / chunks * 100).toFixed();
            loadNext();
        } else {
            const fileMd5 = spark.end();
            console.log('finished loading');
            console.info('computed hash', fileMd5);  // Compute hash
            callback && callback(fileMd5);
        }
    };

    fileReader.onerror = function (err) {
        console.warn('oops, something went wrong.');
        callback && callback(null, err);
    };

    function loadNext() {
        let start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
}

/**
 * 获取文件md5，各平台通用处理
 * @param {*} fileOrPath 
 * @param {*} callback 
 */
export const getFileMd5AllPlatform = function(fileOrPath, callback) {
    if (isCordovaDevice()) {
        getFileFromPath(fileOrPath.path).then(({file, err}) => {
            if (file) {
                getFileMd5(file, (md5, MD5err) => {
                    callback && callback(file, md5, MD5err)
                })
            }else {
                callback && callback(file, null, err)
            }
        })
    }else {
        getFileMd5(fileOrPath, (md5, MD5err) => {
            callback && callback(fileOrPath, md5, MD5err)
        })
    }
}


/**
 * 获取blob的md5
 */
export const getBlobMd5 = function(blob, callback){
    let name = (new Date()).getTime();
    let fileNew = blobToFile(blob, name);
    getFileMd5(fileNew, (md5, MD5err) => {
        callback && callback(fileNew, md5, MD5err)
    })
}

/**
 * 上传 ali oss
 * @param {*} file
 * @param {*} host
 * @param {*} params
 * @param {*} progressCallback
 * @param {*} succ
 * @param {*} fail
 */
function upload(file, host, params, progressCallback, succ, fail) {
    var formData = new FormData();
    forEach(params, (val, key) => {
        formData.append(key, val);
    })
    formData.append("file", file);
    var request = new XMLHttpRequest();
    request.upload.onprogress = function(evt) {
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            progressCallback && progressCallback(percentComplete);
        } else {
            // Unable to compute progress information since the total size is unknown
        }
    }
    request.onload = function(evt) {
        if (request.status == 200) {
            console.log('uploaded');
            succ && succ({oss_path: `${host}/${params.key}`});
        }else{
            console.log('upload err status: ' + this.responseText);
            fail && fail(this.responseText)
        }
    }
    request.onerror = function(err) {
        console.log('upload err: ' + JSON.stringify(err))
        fail && fail(err)
    }
    request.open("POST", host);
    request.send(formData);
}

/**
 * 获取图片评论上传的签名
 */
export const getUploadAuth = function(file, md5, succ, fail, uploadType) {
    let params = {
        md5,
        file_name: file.name,
    }
    fetchUtil(queryUrl(`${model_api_url}upload/signature/public/${uploadType}`, params, false))
        .then(resp => {
            if (resp && !resp.Status) {
                succ && succ(resp);
            }else {
                fail && fail(resp);
            }
        }).catch(err => {
            fail && fail(err);
        })
}

/**
 * 上传图片评论
 */
export const uploadFile = function(fileOrPath, uploadType, progressCallback, succ, fail) {
    let deviceType = cordovaDeviceType();
    if(uploadType === "snapshot" && deviceType === "ios"){
        getBlobMd5(fileOrPath, (file, md5, err) => {
            if (file && md5 !== null) {
                getUploadAuth(file, md5, (resp) => {
                    let {path, policy, accessid, signature, host} = resp;
                    let name = file.name;
                    let params = {
                        'name': name,
                        'key': path,
                        'policy': policy,
                        'OSSAccessKeyId': accessid,
                        'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                        'signature': signature,
                    };
                    upload(file, host, params, progressCallback, succ, fail);
                }, fail, uploadType)
            }else {
                fail && fail(err);
            }
        })
    }
    else{
        getFileMd5AllPlatform(fileOrPath, (file, md5, err) => {
            if (file && md5 !== null) {
                getUploadAuth(file, md5, (resp) => {
                    let {path, policy, accessid, signature, host} = resp;
                    let name = file.name;
                    let params = {
                        'name': name,
                        'key': path,
                        'policy': policy,
                        'OSSAccessKeyId': accessid,
                        'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                        'signature': signature,
                    };
                    upload(file, host, params, progressCallback, succ, fail);
                }, fail, uploadType)
            }else {
                fail && fail(err);
            }
        })
    }
}

/**
 * 上传图片评论promise
 */
export const uploadFilePromise = function(fileOrPath, uploadType, progressCallback) {
    return new Promise((resolve) => {
        uploadFile(fileOrPath, uploadType, progressCallback, (resp) => {
            resolve(resp);
        }, (err) => {
            resolve({err})
        })
    })
    
}
