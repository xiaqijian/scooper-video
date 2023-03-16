/*
 * @File: 配置信息文件
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2021-12-01 14:07:50
 */
import qs from "qs";
//登录之后默认跳转菜单  
// export const HOME_PAGE = "/main/dispatch/audio"; 

//平台地址
export const platUrl = window.scooper.configs.platUrl;
// export const skin= 'science';
export const skin= window.scooper.configs.skin;
export const isMidStatus = window.scooper.configs.isMidStatus;
// 完整通讯录分页查询pageSize

// export const queryPageSize = pageSize; 

// 默认展开层数
export const defaultLayers = 3;
//获取url中的值
export const urlParam = qs.parse(window.location.href.replace('?', '&'));
//token值
// export const getToken = () => (window.auth.token || urlParam.token || sessionStorage.getItem("dispWebToken"));
export const getToken = () => (urlParam.token || sessionStorage.getItem("dispWebToken"));

// 是否开启日志调试
export const devMode = window.scooper.configs.devMode;

// 黑名单人员选择器title
export const blackUserPickTitle = "选择黑名单用户";
// 组呼通知人员选择器title
export const groupNotifyTitle = "选择组呼通知接收人";
// 添加群组人员选择器title
export const addMemTitle = '请添加群组人员';
//  添加入会人员的人员选择器title
export const addMeetMemTitle = '请选择入会成员';


/**
 * 号码状态对应中文
 */
export const TEL_STATUS_VAL = {
    // "callst_none":'空闲',   // 初始化号码状态
    "callst_offline": '离线',
    "callst_idle": '空闲',
    "callst_hold": '保持',
    "callst_waitring": '等待振铃',
    "callst_ring": '振铃',
    "callst_answer": '应答',
    "callst_doubletalk": '通话中',
    "callst_transfer": '转接成功',
    "callst_transfering": '转接中',
    "callst_turning": '轮询中',
    "callst_meet": '会议中',
    "callst_breakin": '强插通话',
    "callst_monitor": '监听通话',
    "callst_callinwaitanswer": '等待应答',
    "callst_monitorring": '监控振铃',
    "callst_monitoranswer": '监控通话',
    "callst_monitoroffhook": '监听摘机'
}
/**
 *单呼按钮名 （用于获取按钮是否可被点击）
 */
export const singalBtnName = {
    CALL: 'call',                  //呼叫
    HUNGUP: 'hungup',              //挂断
    MEET: 'meet',                  //加入会议
    GROUPTURN: 'groupturn',	       //一号通(对讲组成员不支持)
    RECORD: 'record',               //录音
    KEEP: 'keep',                  //保持
    TRANSFER: 'transfer',          //转接
    BREAKIN: 'breakin',            //墙插
    MONITOR: 'monitor',            //监听
    TRIPLEHUNGUP: 'tripleHungup',  //强拆
}
/**
 * 调度状态常量
 */
export const stsConst = {
    // CALLNONE:'callst_none',                         //未知
    OFFLINE: "callst_offline",			            //离线
    IDLE: "callst_idle",				            //空闲
    WAITRING: "callst_waitring",			        //预振铃
    CALLRING: "callst_ring",				        //振铃中
    CALLANSWER: "callst_answer",				    //应答
    CALLHOLD: "callst_hold",				        //保持中
    CALLTRANSFING: "callst_transfering",		    //转接中
    CALLTRANSFER: "callst_transfer",			    //转接
    CALLTURNING: "callst_turning",			        //轮询中
    DOUBLETALK: "callst_doubletalk",			    //双方通话
    MEET: "callst_meet",				            //在会场中
    BREAKIN: "callst_breakin",			            //强插
    MONITOR: "callst_monitor",			            //监听通话
    CALLINWAITANSWER: "callst_callinwaitanswer",    //呼入未应答
    MONITORRING: "callst_monitorring",		        //双方直接通话响铃
    MONITORANSWER: "callst_monitoranswer",		    //双方直接通话
    MONITOROFFHOOK: "callst_monitoroffhook",		//监听摘机
}
/**
 * 获取url参数
 */
export function getUrlParams() {
    let urlParams = qs.parse(window.location.href.split("?"));
    if (urlParams[1]) {
        return `?${urlParams[1]}`;
    } else {
        return "";
    }
}