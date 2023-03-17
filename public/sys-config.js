/*
 * @File: 配置文件
 * @Author: liulian
 * @Date: 2020-07-31 10:03:18
 * @version: V0.0.0.1
 * @LastEditTime: 2021-12-01 14:13:28
 */
(function () {
    window.scooper || (window.scooper = {})
    var config = window.scooper.configs = {
        platUrl: '', //平台地址（例：http://192.168.106.209:8080）,若与平台在一个服务下，则无需配置
        token: getUrlParam('token', ''),//获取token
        skin: getUrlParam('skin', ''),
        devMode: true,  //是否开启日志调试
        isMidStatus: false,      //是否是中性环境
    };
    // document.writeln('<script src="' + config.platUrl + '/dispatch-web/conf/requireConfig?var=home"></script>')
    // document.writeln('<script src="' + config.platUrl + '/scooper-video/conf/requireConfig?var=video"></script>')
    /**
     * 获取当前URL传递过来的参数，不支持中文
     * @param name	参数名
     * @param defaultV 默认值，找不到该参数返回
     */
    function getUrlParam(name, defaultV) {
        var index = document.location.href.indexOf('?');
        var sParam = document.location.href.substring(index);
        var arrParam = sParam.split('&');
        var indexP = -1;
        for (var i = 0; i < arrParam.length; i++) {
            indexP = arrParam[i].indexOf(name + '=');
            if (indexP >= 0) {
                return arrParam[i].substring(indexP + name.length + 1);
            }
        }
        return defaultV;
    }
})()