/*
 * @File: 项目路由路径配置文件
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-01 20:10:52
 */ 

/**
 * 系统一级菜单 对应path路径
 */

export const ROUTER_CFG = Object.freeze({
    LOGIN: "/login",
    MAIN_PAGE: "/main",
});
export const commonData = new class {
    commonData = {
        sysKey: 'scooper-dispatch-web',
        skin: '',
        urlParams: {}
    }

    setCommonData(key, commonDate) {
        this.commonData[key] = commonDate
    }

    getCommonData(key) {
        return this.commonData[key]
    }
}()
/**
 * 一级菜单 从配置项获取
 */
export const MENU_CFG = [
    { title: "GIS", path: "/main/phone" },
    { title: "告警", path: "/main/fax" },
    { title: "语音调度", path: "/main/dispatch" },
    { title: "统计", path: "/main/message" },
    { title: "视频监控", path: "/main/rota" },
];


