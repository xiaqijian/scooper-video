/*
 * @File: 项目接口存放文件
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-10 10:20:25
 */
import getServices from "../util/axios-request";
import {
  getToken,
  platUrl
} from "../config/constants";


const mpgwPrefix = "/mpgw"; //中台会议接口

export let meetapis = {
  // 会议管理
  meetManagePrefix: getServices(`${mpgwPrefix}`, getToken, {
     // 查询正在召开和待召开的会议列表
     reservedMeets: {
       url: "/mpgw/meet/reservedMeets",
       type: "get",
       getResp: true
    },
    // 查找会议详情
    getMeetInfo: {
      url: "/mpgw/meet/getMeetInfo",
      type: "get",
      getResp: true
    },
    // 创建会议
    create: {
      url: "/mpgw/meet/create",
      type: "post",
      getResp: true
    },
    // 结束会议
    endMeet: {
      url: "/mpgw/meet/endMeet",
      type: "post",
    },
    // 删除会议
    deleteMeet: {
      url: "/mpgw/meet/deleteMeet",
      type: "delete",
      getResp: true
    },
  }),
  // 会议控制
  meetOperatePrefix: getServices(`${mpgwPrefix}`, getToken, {
    // 会议控制
    setMeetOperate: {
      url: "/mpgw/meet/setMeetOperate",
      type: "post",
    },
    // 添加与会人
    joinAttendees: {
      url: "/mpgw/meet/joinAttendees",
      type: "post",
    },
  }),
  // 通讯录
  contactPrefix: getServices(`${mpgwPrefix}`, getToken, {
    // 查询通讯录组织机构列表
    queryDepartments: {
      url: "/mpgw/contact/queryDepartments",
      type: "post",
    },
    // 查询通讯录成员
    queryMembers: {
      url: "/mpgw/contact/queryMembers",
      type: "post",
    },
  }),
};