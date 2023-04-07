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
      url: "/meet/reservedMeets?token=123456&pageNum=0&pageSize=100&username=zhzx&regionCode=340000",
      type: "get",
      getResp: true
    },
    // 历史会议列表
    historyMeets: {
      url: "/meet/historyMeets?token=123456&pageNum=0&pageSize=10&username=zhzx&regionCode=340000",
      type: "get",
      getResp: true
    },
    // 查找会议详情
    getMeetInfo: {
      url: "/meet/getMeetInfo?&username=zhzx&regionCode=340000",
      type: "get",
      getResp: true
    },
    // 查找会议log
    getMeetLogs: {
      url: "/meet/getMeetLogs?&username=zhzx&regionCode=340000",
      type: "get",
      getResp: true
    },
    // 创建会议
    create: {
      url: "/meet/create?&username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // 通过会议id获取会场列表
    listParticipants: {
      url: "/meet/listParticipants?&username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // 获取正在召开会议详情
    getMeetingDetail: {
      url: "/meet/getMeetingDetail?&username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // 修改会议
    updateMeet: {
      url: "/meet/updateMeet?&username=zhzx&regionCode=340000",
      type: "put",
    },
    // 结束会议
    endMeet: {
      url: "/meet/endMeet?&username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // 删除会议
    deleteMeet: {
      url: "/meet/deleteMeet?&username=zhzx&regionCode=340000",
      type: "delete",
      getResp: true
    },
  }),
  // 会议控制
  meetOperatePrefix: getServices(`${mpgwPrefix}`, getToken, {
    // 会议控制
    setMeetOperate: {
      url: "/meet/setMeetOperate?username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // 添加与会人
    joinAttendees: {
      url: "/meet/joinAttendees?username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // 会场@控制@
    participantsStatus: {
      url: "/meet/participantsStatus?username=zhzx&regionCode=340000",
      type: "postjson",
    },
    // delete会场@控制@
    participants: {
      url: "/meet/participants?username=zhzx&regionCode=340000",
      type: "delete",
    },
  }),
  // 通讯录
  contactPrefix: getServices(`${mpgwPrefix}`, getToken, {
    // 查询通讯录组织机构列表
    queryDepartments: {
      url: "/contact/queryDepartments",
      type: "post",
    },
    listDepartments: {
      url: "/contact/listDepartments?username=zhzx&regionCode=340000",
      type: "post",
      getResp: true

    },
    // 查询通讯录成员
    queryMembers: {
      url: "/contact/queryMembers",
      type: "post",
    },
  }),
};