/**
 * Created by hzz on 2017/9/9.
 * 记录访问页面信息
 */

var page_infos = {};

export const logPage = (pageId, pageName, other_info) => {
    page_infos = {
        pageId,
        pageName,
        ...other_info,
    }
};

export const getLogPage = () => {
    return page_infos;
}