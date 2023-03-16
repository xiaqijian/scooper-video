/*
 * @File: 语音调度  callin reducer(呼入队列)
 * @Author: liulian
 * @Date: 2020-06-30 15:09:13
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-30 20:15:56
 */ 

const SHOWTRANSFER_MODAL = 'SHOWTRANSFER_MODAL'
const CALLIN_LIST = 'CALLIN_LIST'
const KEEPINLIST = 'KEEPINLIST'
const ISSHOWTEMPLEAVE = 'ISSHOWTEMPLEAVE'
const ISSHOWGOBACK = 'ISSHOWGOBACK'
const DUTYTELARRAY = 'DUTYTELARRAY'
const ISSHOWAUDIOMODAL = 'ISSHOWAUDIOMODAL'
const AUDIOTAG = 'AUDIOTAG'
const CALLINLISTTAG = 'CALLINLISTTAG'

const initState = {
    callInListTag:'',
    showTransferModal : false,     //是否显示转接面板
    callINList:[],   //呼入队列
    keepInList:[],    //保持队列
    isShowTempLeave:false,   //是否显示暂离弹框
    isShowGoBack:false,  //是否显示回到岗位弹框
    dutyTelArray:[],   //值班号码
    isShowAudioModal:false,   //是否显示语音/视频接听面板
    audioTag:0,   //语音视频接听面板是否显示的标志位 0:初始态 1显示 2 不显示

};

export function callInHandleReducer(state=initState,action) {
    switch (action.type){
        case CALLINLISTTAG:return {...state,callInListTag:action.data};
        case SHOWTRANSFER_MODAL: return {...state, showTransferModal: action.data};
        case CALLIN_LIST: return {...state,callINList:action.data};
        case KEEPINLIST: return {...state,keepInList:action.data};
        case ISSHOWTEMPLEAVE:return {...state,isShowTempLeave:action.data};
        case ISSHOWGOBACK:return{...state,isShowGoBack:action.data};
        case DUTYTELARRAY:return {...state,dutyTelArray:action.data};
        case ISSHOWAUDIOMODAL:return{...state,isShowAudioModal:action.data};
        case AUDIOTAG:return{...state,audioTag:action.data};
        default: return state;
    }
}
export function setCallInListTag(data) {
    return {type: CALLINLISTTAG,data:data};
}
/**
 * 设置是否显示转接面板
 */
export function setShowTransferModal(data) {
    return {type: SHOWTRANSFER_MODAL,data:data};
}
/**
 * 设置呼入队列数据
 */
export function setCallINList(data){
    return {type:CALLIN_LIST,data:data};
}
/**
 * 设置保持队列数据
 */
export function setKeepInList(data){
    return {type:KEEPINLIST,data:data}
}
/**
 * 设置是否显示暂离弹框
 */
export function setIsShowTempLeave(data){
    return {type:ISSHOWTEMPLEAVE ,data:data}
}
/**
 * 设置是否显示回到岗位弹框
 */
export function setIsShowGoBack(data){
    return {type:ISSHOWGOBACK,data:data}
}
/**
 * 设置值班号码
 */
export function setDutyTelArray(data){
    return {type:DUTYTELARRAY,data:data}
}
/**
 * 设置是否显示语音/视频接听面板
 */
export function setIsShowAudioModal(data){
    return {type:ISSHOWAUDIOMODAL,data:data}
}
/**
 * 设置是否显示语音/视频接听面板的标志位
 */
export function setAudioTag(data){
    return {type:AUDIOTAG,data:data}
}