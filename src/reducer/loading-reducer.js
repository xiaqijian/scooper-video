/*
 * @File: 
 * @Author: liulian
 * @Date: 2020-07-29 17:12:28
 * @version: V0.0.0.1
 * @LastEditTime: 2022-03-18 11:34:22
 */
const CHANG_LOADING = 'CHANG_LOADING';
const CONFIGDATA = 'configData';
const NAVARR = 'NAVARR';
const SHOWHEADCONTENT = 'SHOWHEADCONTENT';
const ISSHOWMITS = 'ISSHOWMITS';
const ISSHOWPWDMODAL = 'ISSHOWPWDMODAL';
const ISSHOWDISMSG = 'ISSHOWDISMSG';
const ACCPMPERMSLIST = 'ACCPMPERMSLIST';


const initState = {
    loading:false,
    showheadContent:false, //样式
    configData:{},  //所有配置项
    navArr:[],    //头部导航配置项
    isShowMits:false,  //是否显示mits投屏按钮
    isShowPwdModal:false,  //是否显示修改密码弹框
    // 是否显示消息通知的提示，在视频调度不提示
    isShowDisMsg:true,
    accPmPermsList:[],  //权限列表
};

export function loadingReducer(state=initState, action){
    switch (action.type){
        case CHANG_LOADING: return {...state, loading: action.loading};
        case CONFIGDATA:return {...state,configData:action.data};
        case NAVARR:return {...state,navArr:action.data};
        case SHOWHEADCONTENT:return {...state,showheadContent:action.data};
        case ISSHOWMITS:return {...state,isShowMits:action.data};
        case ISSHOWPWDMODAL:return {...state,isShowPwdModal:action.data};
        case ISSHOWDISMSG:return{...state,isShowDisMsg:action.data};
        case ACCPMPERMSLIST:return {...state,accPmPermsList:action.data};
        default: return state;
    }
}


export function changeLoading(loading) {
    return {
        type:CHANG_LOADING,
        loading:loading
    }
}
export function setConfigData(data){
    return{type:CONFIGDATA,data:data}
}
export function setNavArr(data){
    return {type:NAVARR,data:data}
}
export function setShowHeadContent(data){
    return {type:SHOWHEADCONTENT,data:data}
}
export function setIsShowMits(data){
    return {type:ISSHOWMITS,data:data}
}
export function setIsShowPwdModal(data){
    return {type:ISSHOWPWDMODAL,data:data}
}
/**
 * 设置是否显示调度通知的提示消息
 */
 export function setIsShowDisMsg(data){
    return {type:ISSHOWDISMSG,data:data}
}
/**
 * 设置当前账号权限列表
 */
export function setAccPmPermsList(data){
    return {type:ACCPMPERMSLIST,data:data}
}