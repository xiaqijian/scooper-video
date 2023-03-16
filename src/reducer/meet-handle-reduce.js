/*
 * @File: 会议调度 reducer
 * @Author: liulian
 * @Date: 2020-08-25 11:49:28
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-13 14:36:34
 */
const ALLMEETLIST = "ALLMEETLIST";
const MEETDETAILLIST = "MEETDETAILLIST";
const CURMEET = "CURMEET";
const ALLMEETOPLOGS = "ALLMEETOPLOGS";
const ADDMEETVISIBLE = "ADDMEETVISIBLE";
const EDITRECORD = "EDITRECORD";

const initState = {
  allMeetList: [], //会议列表
  meetDetailList: [], //会议列表详情， 左边的列表的渲染
  curMeet: {}, //当前选中的会议列表
  allMeetOpLogs: [], //所有的操作日志
  addMeetVisible: false, //新建/编辑会议弹框是否显示
  editRecord: {}, //编辑会议数据
};

export function meetHandleReducer(state = initState, action) {
  switch (action.type) {
    case ALLMEETLIST:
      return { ...state, allMeetList: action.data };
    case MEETDETAILLIST:
      return { ...state, meetDetailList: action.data };
    case CURMEET:
      return { ...state, curMeet: action.data };
    case ALLMEETOPLOGS:
      return { ...state, allMeetOpLogs: action.data };
    case ADDMEETVISIBLE:
      return { ...state, addMeetVisible: action.data };
    case EDITRECORD:
      return { ...state, editRecord: action.data };

    default:
      return state;
  }
}
/**
 * 设置会议列表
 */
export function setAllMeetList(data) {
  return { type: ALLMEETLIST, data: data };
}
/**
 *设置详细会议列表，设置左边列表
 */
export function setMeetDetailList(data) {
  return { type: MEETDETAILLIST, data: data };
}
/**
 * 设置当前选中的会议列表
 */
export function setCurMeet(data) {
  return { type: CURMEET, data: data };
}
/**
 * 设置所有的操作日志
 */
export function setAllMeetOpLogs(data) {
  return { type: ALLMEETOPLOGS, data: data };
}
/**
 * 设置是否显示新建/编辑会议弹框
 */
export function setAddMeetVisible(data) {
  return { type: ADDMEETVISIBLE, data: data };
}
/**
 * 设置编辑会议数据
 */
export function setEditRecord(data) {
  return { type: EDITRECORD, data: data };
}
