/*
 * @File: 语音调度  call-record reducer(通话记录)
 * @Author: liulian
 * @Date: 2020-07-03 11:48:36
 * @version: V0.0.0.1
 * @LastEditTime: 2020-09-02 14:59:23
 */ 

const RECORDLIST_DATA = 'RECORDLIST_DATA';
const CALLINMISSDATA = 'CALLINMISSDATA';
const CALLINMISSLIST = 'CALLINMISSLIST';
const CURSELECT_ITEM = 'CURSELECT_ITEM';
const BLACKLIST_DATA = 'BLACKLIST_DATA';
const SHOWCONTENT = 'SHOWCONTENT';
const RECORDALLDATA = 'RECORDALLDATA';
const CURSELECTMISSITEM = 'CURSELECTMISSITEM';
const CALLINMISSCOUNT = 'CALLINMISSCOUNT';

const GROUPRECORDLIST = 'GROUPRECORDLIST';
const BOARDRECORDLIST = 'BOARDRECORDLIST';
const PRESENTRECORDLIST = 'PRESENTRECORDLIST';
const POLLRECORDLIST = 'POLLRECORDLIST';

const initState = {
    recordAllData:{}, //通话记录
    callInMissData:{}, //呼入未接
    callInMissList:[], //未接记录
    recordListData:[],  //通话记录列表
    curSelectItem:{},   //当前选中的通话记录
    curSelectMissItem:{},  //当前选中的呼入未接
    blackListData:[],   //黑名单数据
    showContent:'callRecord',  // 显示内容 默认显示通话记录 callRecord blackList
    callInMissCount:'',  //呼入未接数量

    groupRecordList:[],  //组呼/选呼记录
    boardRecordList:[],  //广播记录
    presentRecordList:[],  //点名记录
    pollRecordList:[], //轮询记录
};

export function callRecordHandleReducer(state=initState,action) {
    switch (action.type){
        case RECORDALLDATA:return {...state,recordAllData:action.data}
        case CALLINMISSDATA:return {...state,callInMissData:action.data}
        case CALLINMISSLIST: return{...state,callInMissList:action.data}
        case RECORDLIST_DATA: return {...state,recordListData:action.data}
        case CURSELECT_ITEM: return {...state,curSelectItem:action.data}
        case BLACKLIST_DATA: return {...state,blackListData:action.data}
        case SHOWCONTENT:return {...state,showContent:action.data}
        case CURSELECTMISSITEM:return{...state,curSelectMissItem:action.data}
        case CALLINMISSCOUNT:return{...state,callInMissCount:action.data}

        case GROUPRECORDLIST:return{...state,groupRecordList:action.data}
        case BOARDRECORDLIST:return {...state,boardRecordList:action.data}
        case PRESENTRECORDLIST:return {...state,presentRecordList:action.data}
        case POLLRECORDLIST:return{...state,pollRecordList:action.data}

        default: return state;
    }
}

/**
 * 通话记录
 */
export function setRecordAllData(data){
    return {type:RECORDALLDATA,data:data}
}
/**
 * 呼入未接记录
 */
export function setCallInMissData(data){
    return {type:CALLINMISSDATA,data:data}
}
/**
 * 呼入未接列表
 */
export function setCallInMissList(data){
    return {type:CALLINMISSLIST,data:data}
}
/**
 * 获取通话记录列表数据
 */
export function setRecordListData(data){
    return {type:RECORDLIST_DATA,data:data}
}
/**
 * 获取当前选中的通话记录
 */
export function setCurSelectItem(data){
    return {type:CURSELECT_ITEM,data:data}
}
/**
 * 获取黑名单数据
 */
export function setBlackListData(data){
    return {type:BLACKLIST_DATA,data:data}
}
/**
 * 设置显示内容
 */
export function setShowContent(data){
    return {type:SHOWCONTENT,data:data}
}
/**
 * 设置当前选中的呼入未接记录
 */
export function setCurSelectMissItem(data){
    return {type:CURSELECTMISSITEM,data:data}
}
/**
 * 设置呼入未接数量
 */
export function setCallInMissCount(data){
    return {type:CALLINMISSCOUNT,data:data}
}

/**
 * 设置组呼/选呼记录
 */
export function setGroupRecordList(data){
    return {type:GROUPRECORDLIST,data:data}
}
/**
 * 设置广播记录
 */
export function setBoardRecordList(data){
    return {type:BOARDRECORDLIST,data:data}
}
/**
 * 设置点名记录
 */
export function setPresentRecordList(data){
    return {type:PRESENTRECORDLIST,data:data}
}
/**
 * 设置轮询记录
 */
export function setPollRecordList(data){
    return {type:POLLRECORDLIST,data:data}
}