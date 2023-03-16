/*
 * @File: 项目接口存放文件
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-09 19:02:13
 */
import getServices from "./axios-request";
import {
  getToken,
  platUrl
} from "../config/constants";

const projectPrefix = "/scooper-core-rest/data/dispatch"; //项目后台接口前缀
const corePrefix = "/scooper-core-rest/data"; //通讯录前缀
const loginPrefix = "/dispatch-web";
const recordPrefix = "/scooper-record";
const dispatchPrefix = "/dispatch-web"; //调度前缀
const mitsPrefix = "/scooper-mits-conf"; //mits前缀

export let apis = {
  auth: {
    captcha: "/dispatch-web/api/login/captcha",
  },
  login: getServices(`${loginPrefix}`, getToken, {
    login: {
      url: "/api/login/login",
      type: "post",
      getResp: true
    },
    logout: {
      url: "/login/doLoginOut",
      type: "get"
    },
  }),
  dispatch: getServices(`${projectPrefix}`, getToken, {
    // --------------------------------------快捷组信息-------------------------------------------
    listDispGroup: {
      url: "/dispGroupManage/listDispGroup",
      type: "post"
    }, //获取快捷组列表
    saveDispGroup: {
      url: "/dispGroupManage/saveDispGroup",
      type: "post"
    }, //新增快捷组
    deleteDispGroup: {
      url: "/dispGroupManage/deleteDispGroup",
      type: "post"
    }, //删除快捷组
    updateDispGroup: {
      url: "/dispGroupManage/updateDispGroup",
      type: "post"
    }, //更新快捷组
    // --------------------------------------快捷组成员-------------------------------------------
    queryDispMember: {
      url: "/dispMemberManage/queryDispMember",
      type: "post"
    }, //分页获取快捷组成员信息
    listOrgMember: {
      url: "/dispMemberManage/listDispMember",
      type: "post"
    }, //获取所有快捷组成员列表
    saveMultiDispMember: {
      url: "/dispMemberManage/saveMultiDispMember",
      type: "post",
    }, //新增快捷组成员
    deleteDispMember: {
      url: "/dispMemberManage/deleteDispMember",
      type: "post",
    }, //删除快捷组成员
  }),
  core: getServices(`${corePrefix}`, getToken, {
    // --------------------------------------通讯录接口-------------------------------------------
    getDispCenterDetail: {
      url: "/dispatch/dispCenterManage/getDispCenterDetail",
      type: "post",
    }, //获取调度中心详情信息
    listOrgDept: {
      url: "/contacts/orgDeptManage/listOrgDept",
      type: "post"
    }, //获取部门列表信息（全加载）
    listOrgMember: {
      url: "/contacts/orgMemberManage/listOrgMember",
      type: "post",
    }, //查询部门成员列表信息
    listTreeDeptByParent: {
      url: "/contacts/orgDeptManage/listTreeDeptByParent",
      type: "post",
    }, //层级加载部门树结构
    queryOrgDept: {
      url: "/contacts/orgDeptManage/queryOrgDept",
      type: "post"
    }, // 分页查询部门列表信息
    queryOrgMember: {
      url: "/contacts/orgMemberManage/queryOrgMember",
      type: "post",
    }, // 分页查询部门成员信息
    queryDispGroup: {
      url: "/dispatch/dispGroupManage/queryDispGroup",
      type: "post",
    }, // 分页查询快捷组列表信息
    getAccountDetail: {
      url: "/system/accountManage/getAccountDetail",
      type: "post",
    }, //查询账号详情
    findDepartmentPath: {
      url: "/contacts/orgDeptManage/findDepartmentPath",
      type: "post",
      getResp: true,
    }, //获取某部门在树形结构中的路径
    resetSelfPwd: {
      url: "/system/accountManage/resetSelfPwd",
      type: "post"
    }, //修改账号密码
    getAccPmPerms: {
      url: "/system/authManage/getAccPmPerms",
      type: "post"
    }, //获取权限列表
  }),
  disp: getServices(`${dispatchPrefix}`, getToken, {
    config: {
      url: "/conf/data",
      type: "post"
    }, //配置
    // --------------------------------------转接面板-------------------------------------------
    pageMemberWithPath: {
      url: "/data/orgMember/pageMemberWithPath",
      type: "post",
    },
    getLatestContacts: {
      url: "/data/serCallRecord/getLatestContacts",
      type: "post",
    },
    // ---------------------------------组呼通知-----------------------------------------------------
    listDispNotifyPhrases: {
      url: "/data/dispNotifyPhrases/listDispNotifyPhrases",
      type: "post",
    }, //获取组呼通知常用语
    saveDispNotifyPhrases: {
      url: "/data/dispNotifyPhrases/saveDispNotifyPhrases",
      type: "post",
    }, //添加组呼通知常用语
    removeDispNotifyPhrases: {
      url: "/data/dispNotifyPhrases/removeDispNotifyPhrases",
      type: "post",
      getResp: true,
    }, //删除组呼通知常用语
    listSerRecordNotify: {
      url: "/data/serRecordNotify/listSerRecordNotify",
      type: "post",
    }, //列表查询通知音
    removeSerRecordNotify: {
      url: "/data/serRecordNotify/removeSerRecordNotify",
      type: "post",
      getResp: true,
    }, //删除通知音记录
    pageSerNotifyRecord: {
      url: "/data/serNotifyRecord/pageSerNotifyRecord",
      type: "post",
    }, //分页查询组呼通知记录
    // ---------------------------------黑名单-------------------------------------------------------
    listBlack: {
      url: "/data/black/listBlack",
      type: "post"
    }, //获取黑名单
    addBlacks: {
      url: "/data/black/addBlacks",
      type: "post",
      getResp: true
    }, //添加黑名单人员
    delBlack: {
      url: "/data/black/delBlack",
      type: "post",
      getResp: true
    }, //删除黑名单中的人员
    // ----------------------------------通话记录----------------------------------------------------
    queryCallRecord: {
      url: "/data/serCallRecord/queryCallRecord",
      type: "post",
    }, //获取通话记录
    queryCallInMiss: {
      url: "/data/serCallRecord/queryCallInMiss",
      type: "post",
    }, //获取呼入未接记录
    countCallInMiss: {
      url: "/data/serCallRecord/countCallInMiss",
      type: "post",
    }, //未接计数
    readALLCallInMiss: {
      url: "/data/serCallRecord/readALLCallInMiss",
      type: "post",
      getResp: true,
    }, //阅读所有呼入未接
    // -------------------------------------群组操作记录----------------------------------------------
    pageGroupRecord: {
      url: "/data/groupRecord/pageGroupRecord",
      type: "post"
    }, //分页查询群组操作记录
    // ----------------------------------群组&通讯录-------------------------------------------------
    resetSort: {
      url: "/data/dispMember/resetSort",
      type: "post",
      getResp: true,
    }, //快捷组成员排序
    dispResetSort: {
      url: "/data/dispGroup/resetSort",
      type: "post",
      getResp: true,
    }, //快捷组排序
    queryOrgDept: {
      url: "/data/orgDept/queryOrgDept",
      type: "post"
    }, //分页查询部门（搜索）
    queryDispGroup: {
      url: "/data/dispGroup/queryDispGroup",
      type: "post"
    }, //分页查询快捷组（搜索）
    // --------------------------------时间------------------------------------------------
    getNowTime: {
      url: "/api/conn/getNowTime",
      type: "get",
      getResp: true
    },
  }),
  record: getServices(`${recordPrefix}`, getToken, {
    deleteFile: {
      url: "/data/file/deleteFile",
      type: "post",
      getResp: true
    }, //录音录像删除
    batchDownloadFiles: {
      url: "/data/file/batchDownloadFiles",
      type: "post"
    }, //下载
  }),
  mits: getServices(`${mitsPrefix}`, getToken, {
    open: {
      url: "/data/screen/open",
      type: "get",
      getResp: true
    },
  }),
};