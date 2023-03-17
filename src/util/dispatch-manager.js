/*
 * @File: 调度管理
 * @Author: liulian
 * @Date: 2020-07-30 16:38:57
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-09 09:14:16
 */
import { platUrl, getToken, stsConst, devMode } from "../config/constants";
import EventDispatcher from "./event";
import timeUtil from "./time-util";
import { loadCallRecord, getBusinessId, loadAudioList } from "./method";
import { message, Modal } from "antd";
import $ from "jquery";
import { apis } from "./apis";
import {
  setMemMapCache,
  setLoading,
  setTelStausList,
  setShankCall,
  setMemTelMapCache,
  setIsMainTalk,
  setIsSubTalk,
  setIsRollCall,
  setIsGroupTurn,
  setIsShowTzly,
  setIsSelectCall,
  setBoardCast,
  setIsShowMainZdh,
  setIsShowSubZdh,
  setAudioList,
  setCenterOperTel,
  setShandInfo,
  setShandVisible,
} from "../reducer/audio-handle-reducer";
import store from "../store/index";
import {
  setCallINList,
  setKeepInList,
  setIsShowTempLeave,
  setIsShowGoBack,
  setDutyTelArray,
  setIsShowAudioModal,
  setAudioTag,
  setCallInListTag,
} from "../reducer/callIn-handle-reduce";
import {
  setRecordListData,
  setCurSelectItem,
} from "../reducer/callRecord-handle-reduce";
import { loadMeetList } from "./meet-method";

const { confirm } = Modal;
class DispatchManager extends EventDispatcher {
  accountDetail; //当前登录人员信息
  dispatcher; //scooper.dispatch
  constructor(props) {
    super(props);
    const dispatchListen = new DispatchListen({ dispatchManager: this });
    const relyLib = ["scooper.dispatch"];
    window.requirejs(window.home, relyLib, (dispatch) => {
      if (getToken() == null || !getToken()) return;
      dispatch.setRemoteBaseUrl(`/dispatch-web/`);
      setTimeout(() => {
        let { configData } = store.getState().loading;
        let useShandleVal;
        if (
          JSON.stringify(configData) !== "{}" &&
          configData.shandle["disp.shandle.disphtml.use"] == "true"
        ) {
          useShandleVal = true;
        } else {
          useShandleVal = false;
        }
        let initConf = {
          useShandle: useShandleVal,
        };
        dispatch.initialize("", initConf);
        dispatch.loginByToken(getToken, async (data) => {
          if (data.code) {
            console.log("登陆调度失败");
            message.error("当前登录人员无调度权限");
            return;
          } else {
            this.dispatcher = dispatch;
            data.data.accountPo.activeHandler = data.data.activeHandler;
            this.accountDetail = data.data.accountPo; // 设置账号信息
            sessionStorage.setItem(
              "dispAccountName",
              data.data.accountPo.accUsername || "无"
            );
            sessionStorage.setItem(
              "dispAccountTel",
              data.data.accountPo.mainTel || data.data.accountPo.viceTel || ""
            );

            if (this.accountDetail && this.accountDetail.centerId) {
              // 获取调度中心详情
              this.getDispCenterDetail(this.accountDetail.centerId);
            }

            dispatchListen.init();
            this.fire("dispatch.loaded");
            this.getStateConfig(data.data.dutyState, dispatchListen);
            this.setCenterOperTel();
            this.loadCallRecordSelf(); //加载通话记录
          }
          this.getAllMemData(dispatchListen); // 获取所有人员信息
        });
      }, 500);

      setInterval(() => {
        dispatchListen.calOperCallLong();
        dispatchListen.calCallInWaitTime();
        dispatchListen.calCallHoldWaitTime();
        // this.updateRecord(store.getState().audioHandle.memTelMapCache);
        // dispatchListen.calCallRecordCallLen();
      }, 1000);
      window.updateInter = setInterval(() => {
        this.updateRecord(store.getState().audioHandle.memTelMapCache);
      }, 1000);
    });
  }
  /**
   * 获取调度中心详情
   */
  getDispCenterDetail = async (centerId) => {
    let data = await apis.core.getDispCenterDetail({ id: centerId });
    if (data) {
      let meetRecord = data.meetRecord;
      this.accountDetail.meetRecord = meetRecord;
    }
  };
  getAllMemData = async (dispatchListen) => {
    let pageSize = sessionStorage.getItem("queryPageSize");
    const data = await apis.core.queryOrgMember({
      currentPage: 1,
      pageSize: pageSize,
      useSort: false,
    });

    const promiseArr = [];
    const totalPage = Math.ceil(data.total / pageSize);
    for (let currentPage = 2; currentPage <= totalPage; currentPage++) {
      promiseArr.push(
        apis.core.queryOrgMember({
          currentPage,
          pageSize: pageSize,
          useSort: false,
        })
      );
    }
    const memberArr = await Promise.all(promiseArr);
    let memberMap = {};
    let memberTelMap = {};
    memberArr.concat(data).forEach((item) => {
      if (item && item.list && item.list.length) {
        item.list.forEach((member) => {
          memberMap[member.id] = member;
          memberTelMap[member.memTel] = member;
          if (
            member.memTel2 &&
            (memberTelMap[member.memTel2] == undefined ||
              JSON.stringify(memberTelMap[member.memTel2]) == "{}")
          ) {
            memberTelMap[member.memTel2] = member;
          } else if (
            member.memMobile &&
            (memberTelMap[member.memMobile] == undefined ||
              JSON.stringify(memberTelMap[member.memMobile]) == "{}")
          ) {
            memberTelMap[member.memMobile] = member;
          } else if (
            member.memMsgTel &&
            (memberTelMap[member.memMsgTel] == undefined ||
              JSON.stringify(memberTelMap[member.memMsgTel]) == "{}")
          ) {
            memberTelMap[member.memMsgTel] = member;
          } else if (
            member.memJkTel &&
            (memberTelMap[member.memJkTel] == undefined ||
              JSON.stringify(memberTelMap[member.memJkTel]) == "{}")
          ) {
            memberTelMap[member.memJkTel] = member;
          }
        });
      }
    });
    // console.log(memberTelMap)
    store.dispatch(setMemMapCache(memberMap));
    store.dispatch(setMemTelMapCache(memberTelMap));

    console.log("人员信息加载完毕");
    // 初始化号码状态
    this.initTelStatus(dispatchListen);
    // 初始化获取呼入队列数据
    this.getCallInList(dispatchListen);
    // 初始化获取保持队列数据
    this.getHoldList(dispatchListen);
    this.updateRecord(memberTelMap);
    // 初始化加载会议列表
    loadMeetList();
    store.dispatch(setLoading(false));
  };
  /**
   * 初始化设置手柄鉴权情况
   */
  setCenterOperTel = () => {
    let mainTel = dispatchManager.accountDetail.mainTel;
    let viceTel = dispatchManager.accountDetail.viceTel;
    let activeHandler = dispatchManager.accountDetail.activeHandler;
    if (activeHandler == mainTel) {
      store.dispatch(setCenterOperTel(false));
    } else if (activeHandler == viceTel) {
      store.dispatch(setCenterOperTel(true));
    }
  };
  /**
   *  初始化获取暂离
   */
  getStateConfig = (state, dispatchListen) => {
    if (state && state.state == "allout") {
      let msg = {
        type: "client_state",
        value: "state=allout;" + state.tels,
      };
      dispatchListen.confgChange(msg);
    }
  };
  /**
   * 加载通话记录
   */
  loadCallRecordSelf = (update) => {
    let params = {
      pageNum: 1,
      pageSize: 10,
    };
    loadCallRecord(params);
  };
  /**
   * 更新通话记录
   */
  updateRecord = (memTelMapCache) => {
    let { recordListData } = store.getState().callRecordHandle;
    window.clearInterval(window.updateInter);
    // if (recordListData && recordListData.length > 0 && recordListData[0].name) {
    //     window.clearInterval(window.updateInter)
    //     return;
    // }
    recordListData.map((item) => {
      item.name =
        memTelMapCache[item.tel] && memTelMapCache[item.tel].name;
    });
    store.dispatch(setRecordListData([...recordListData]));
    let list = [...recordListData];
    if (list.length > 0) {
      store.dispatch(setCurSelectItem(list[0]));
    }
  };
  /**
   * 初始化号码状态
   */
  initTelStatus(dispatchListen) {
    let telStatusMap = {};
    this.dispatcher.calls.listStatus((data) => {
      if (data.code == 0 && data.data) {
        data.data.forEach((item) => {
          telStatusMap[item.tel] = item;
          dispatchListen.updateShankCall(item, "first");
        });
        store.dispatch(setTelStausList(telStatusMap));
      }
    });
  }
  /**
   * 初始化获取呼入队列数据
   */
  getCallInList(dispatchListen) {
    this.dispatcher.calls.requestCallIns((data) => {
      data &&
        data.map((item) => {
          let msg = {
            data: {
              tel: item.tel,
              time: item.time,
              usrLevel: item.usrLevel,
              videoInfo: item.videoInfo || "audio",
            },
            type: "add",
          };
          dispatchListen.callInChanged(msg, true);
        });
    });
  }
  /**
   * 初始化获取保持队列数据
   */
  async getHoldList(dispatchListen) {
    this.dispatcher.calls.listHold((data) => {
      data.data &&
        data.data.map((item) => {
          let msg = {
            tel: item.tel,
            telStatus: {
              tel: item.tel,
              time: item.time,
              timeStamp: item.timeStamp,
              recording: item.recording,
              status: item.status,
              type: item.videoInfo,
              handleNumber: item.handleNumber,
            },
            type: "add",
          };
          dispatchListen.callHoldChanged(msg);
        });
    });
  }
  /**
   * 设置登陆人员账号信息
   */
  setAccount() {
    return new Promise((reslove) => {
      this.dispatcher.getAccountByToken(getToken, async (data) => {
        let accData = await apis.core.getAccountDetail({ id: data.data.id });
        this.accountDetail = accData;
        reslove();
      });
    });
  }

  /**
   * 获取登录人账号信息
   */
  getAccount() {
    return this.accountDetail;
  }
  /**
   * 获取scooper.dispatch.calls实例
   */
  getCalls() {
    if (!this.calls) {
      this.calls = new DispatchCalls({ dispatchManager: this });
    }
    return this.calls;
  }
  /**
   * 获取scooper.dispatch.meets实例
   */
  getMeets() {
    if (!this.meets) {
      this.meets = new DispatchMeets({ dispatchManager: this });
    }
    return this.meets;
  }
}

/**
 * 调度 - 会议
 */
class DispatchMeets {
  meetsObj; //调度会议对象
  dispatcher; //scooper.dispatch
  constructor(opts) {
    this.dispatchManager = opts.dispatchManager;
  }
  /**
   * 加入会议
   */
  joinMeetMember(tel) {
    let id = this.dispatchManager.accountDetail.accUsername;
    this.getMeets().joinMember(id, tel);
  }
  /**
   * 获取scooper.dispatch.meets对象
   */
  getMeets() {
    if (!this.meetsObj) {
      let dispatcher = this.dispatchManager.dispatcher; //scooper.dispatch
      this.dispatcher = dispatcher;
      if (!this.dispatcher.meets) {
        throw new Error("scooper.dispatch.meets is undefined!");
      }
      this.meetsObj = this.dispatcher.meets;
    }
    return this.meetsObj;
  }
}

/**
 * 调度 - 呼叫
 */
class DispatchCalls {
  callsObj; //调度呼叫对象
  dispatcher; //scooper.dispatch
  constructor(opts) {
    this.dispatchManager = opts.dispatchManager;
  }
  /**
   * 呼叫
   */
  makeCall(tel) {
    let businessId = getBusinessId(); //业务businessId 生成规则：操作员ID_时间戳
    this.getCalls().makeCall(tel, businessId);
  }
  /**
   * 视频呼叫
   */
  makeVideoCall(tel) {
    let businessId = getBusinessId();
    this.getCalls().makeVideoCall(tel, businessId);
  }
  /**
   * 挂断
   */
  hungUp(tel) {
    if (tel) this.getCalls().hungUp(tel);
  }
  /**
   * 应答
   */
  answer(tel) {
    this.getCalls().answer(tel, getBusinessId());
  }
  /**
   * 群答
   */
  answerAll() {
    this.getCalls().answerAll();
  }
  /**
   * 一号通
   */
  groupTurn(tels, isOnce) {
    this.getCalls().groupTurn(tels, isOnce);
  }
  /**
   * 通话录音
   */
  callRecord(tel) {
    this.getCalls().callRecord(tel);
  }
  /**
   * 停止录音
   */
  callRecordEnd(tel) {
    this.getCalls().callRecordEnd(tel);
  }
  /**
   * 强拆
   */
  tripleHungup(tel) {
    this.getCalls().tripleHungup(tel);
  }
  /**
   * 保持
   */
  hold(tel) {
    this.getCalls().hold(tel);
  }
  /**
   * 取消保持
   */
  unhold(tel) {
    this.getCalls().unhold(tel);
  }
  /**
   * 转接
   */
  transfer(from, to) {
    this.getCalls().transfer(from, to, getBusinessId());
  }
  /**
   * 取消转接
   */
  retrieve(tel) {
    this.getCalls().retrieve(tel);
  }
  /**
   * 监听
   */
  tripleMonitor(tel) {
    this.getCalls().tripleMonitor(tel);
  }
  /**
   * 墙插
   */
  tripleBreakin(tel) {
    this.getCalls().tripleBreakin(tel);
  }
  /**
   * 组呼通知
   */
  selectNotify(tels, files, type, times, notifyId, confirm) {
    this.getCalls().selectNotify(tels, files, type, times, notifyId, confirm);
  }
  /**
   * 点名
   */
  rollCall(tels) {
    this.getCalls().rollCall(tels);
  }
  /**
   * 结束点名
   */
  stopRollCall() {
    this.getCalls().stopRollCall();
  }
  /**
   * 结束轮询
   */
  stopGroupTurn() {
    this.getCalls().stopGroupTurn();
  }
  /**
   * 取消选呼/组呼/广播
   */
  stopSelectCall(id) {
    this.getCalls().selectCancel(id);
  }
  /**
   * 选呼/组呼
   * @param {*} tels 号码数组
   * @param {*} id 会议号
   * @param {*} autoAnswer 是否自动应答 boolean 默认false
   * @param {*} allAudience 是否禁言入会 boolean  默认 false
   */
  selectCall(tels, id, autoAnswer, allAudience, fn) {
    this.getCalls().selectCall(tels, id, autoAnswer, allAudience, fn);
  }
  /**
   * 组呼通知 通知音操作
   * @param {*} tel 号码
   * @param {*} title
   * @param {*} opType record:录制，play:播放， del:删除， re_record：重新录制， finish 结束录制
   * @param {*} filename
   */
  notifyRecordOP(tel, title, opType, filename) {
    this.getCalls().notifyRecordOP(tel, title, opType, filename);
  }
  /**
   * 配置
   * @param {*} type
   * @param {*} value
   */
  sendChangeCfg(type, value) {
    this.dispatchManager.dispatcher.sendChangeCfg(type, value);
  }
  /**
   * 手柄鉴权
   */
  setOperTel(tel) {
    this.dispatchManager.dispatcher.setOperTel(tel);
  }
  /**
   * 获取scooper.dispatch.calls对象
   */
  getCalls() {
    if (!this.callsObj) {
      let dispatcher = this.dispatchManager.dispatcher; //scooper.dispatch
      this.dispatcher = dispatcher;
      if (!this.dispatcher.calls) {
        throw new Error("scooper.dispatch.calls is undefined!");
      }
      this.callsObj = this.dispatcher.calls;
    }
    return this.callsObj;
  }
}

/**
 * 调度-状态监听
 */
class DispatchListen {
  listenObj; //调度监听对象
  unlistenObj; //取消监听对象
  dispatcher;
  callInterVal;
  constructor(opts) {
    this.dispatchManager = opts.dispatchManager;
  }
  init() {
    if (!this.listenObj) {
      let dispatchManager = this.dispatchManager;
      let dispatcher = dispatchManager.dispatcher; //scooper.dispatch
      if (!dispatcher || !dispatcher.listen) {
        throw new Error("scooper.dispatch.listen is undefined!");
      }
      this.listenObj = dispatcher.listen;
      this.unlistenObj = dispatcher.unlisten;
      this.dispatcher = dispatcher;
    }
    this.registerTelStatus(); //监听号码状态
    this.registerCallIn(); //监听呼入队列
    this.registerHoldList(); //监听保持队列
    this.registerCallRecord(); //监听通话记录
    this.registerPackResData(); //操作响应包
    this.registerChangeCfg(); //CHANGE_CFG
    this.registerShandleCall(); //软手柄通知派发
  }
  /**
   * 监听号码状态
   */
  registerTelStatus() {
    this.listenObj(this.dispatcher.event_const.CALL_STS, (evt) => {
      if (evt.timeStamp && evt.msg) {
        evt.msg.timeStamp = evt.timeStamp;
      }
      this.telStatusChanged(evt.msg);
    });
  }
  /**
   * 监听呼入队列
   */
  registerCallIn() {
    this.listenObj(this.dispatcher.event_const.CALL_IN, (evt) => {
      this.callInChanged(evt.msg);
    });
  }
  /**
   * 监听保持队列
   */
  registerHoldList() {
    this.listenObj(this.dispatcher.event_const.CALL_HOLD, (evt) => {
      this.callHoldChanged(evt.msg);
    });
  }
  /**
   * 监听通话记录 && 录音录像通知
   */
  registerCallRecord() {
    this.listenObj(this.dispatcher.event_const.RECORD_NOTIFY, (evt) => {
      if (evt.msg.notifyType == "call_record_notify") {
        //通话记录通知，刷新记录列表
        devMode && console.log("通话记录通知：", evt.msg);
        let params = { pageNum: 1, pageSize: 10 };
        loadCallRecord(params);
      }
      if (evt.msg.notifyType == "record_call_notify") {
        //录音录像通知
        devMode && console.log("录音录像通知：", evt.msg);
        if (evt.msg.recordStatus == "ON") {
          // 开启通话录音
          store.dispatch(setIsShowTzly(true));
        } else if (evt.msg.recordStatus == "OFF") {
          // 关闭通话录音
          store.dispatch(setIsShowTzly(false));
        }
      }
    });
  }
  /**
   * 正常操作的响应包
   */
  registerPackResData() {
    this.listenObj(this.dispatcher.event_const.PACK_RES_DATA, (evt) => {
      devMode && console.log("操作响应包：", evt.msg);
      let { isShowDisMsg } = store.getState().loading;
      let msg = evt.msg;
      if (msg.data.result == "success" && msg.type == "meet_destroy") {
        isShowDisMsg && message.success("撤销成功");
      }
      if (msg.data.result == "success" && msg.type == "meet_close") {
        isShowDisMsg && message.success("会议已结束");
      }
      if (msg.data.result == "fail") {
        devMode &&
          console.log(
            `%c[packResp] type:" ${evt.msg.type}", reason:" ${evt.msg.data.reason}`,
            "color:#f56a00;font-style: italic"
          );
        if (evt.msg.type == "trans_call") {
          //转接失败的通知
          let data = msg.data;
          let toTel =
            data.descJson &&
              data.descJson.TransToTel &&
              data.descJson.TransToTel != undefined
              ? data.descJson.TransToTel
              : data.call_number;
          window.toTel = toTel;
        }
        isShowDisMsg && message.error(msg.data.reason || "失败");
      }
      if (msg.data.result == "fail" && msg.type == "notify_record") {
        clearInterval(window.timeIndex);
      }
      if (msg.type == "notify_record" && msg.data.result == "success") {
        loadAudioList();
        if (msg.data.op_type == "notify_record_finish") {
          this.dispatcher.calls.hungUp(msg.data.call_number);
        }
      }
      if (
        msg.data.result != "fail" &&
        (msg.type == "group_notify" ||
          msg.type == "group_call" ||
          msg.type == "group_roll_call")
      ) {
        devMode &&
          console.log(
            `网页调度%c[packResp] type:" ${evt.msg.type}", reason:" ${evt.msg.data.reason}`,
            "color:#f56a00;font-style: italic"
          );
        isShowDisMsg && message.info(msg.data.reason);
      }
      if (msg.type == "group_roll_call" && msg.data.reason != "processing") {
        store.dispatch(setIsRollCall(false));
      }
      if (msg.type == "group_turn" && msg.data.reason != "processing") {
        store.dispatch(setIsGroupTurn(false));
      }
      if (msg.type == "group_call" && msg.data.reason != "processing") {
        store.dispatch(setIsSelectCall("1"));
        store.dispatch(setBoardCast("1"));
      }
    });
  }
  /**
   * CHANGE_CFG (手柄鉴权 & 暂离状态)
   */
  registerChangeCfg() {
    this.listenObj(this.dispatcher.event_const.CHANGE_CFG, (evt) => {
      this.confgChange(evt.msg);
    });
  }
  /**
   * 软手柄通知派发
   */
  registerShandleCall() {
    this.listenObj(this.dispatcher.event_const.SHANDLE_CALL_NOTIFY, (evt) => {
      devMode && console.log("软手柄通知", evt.msg);
      let msg = evt.msg;
      let shandInfo = {};
      let { memTelMapCache } = store.getState().audioHandle;
      let memInfo = memTelMapCache[msg.telNumber];
      if (msg.video) {
        shandInfo.type = "video";
      } else {
        shandInfo.type = "audio";
      }
      if (memInfo) {
        shandInfo.name = memInfo.name;
        shandInfo.deptName = memInfo.deptName;
      } else {
        shandInfo.name = msg.telNumber;
        shandInfo.deptName = "";
      }
      store.dispatch(setShandInfo(shandInfo));
      store.dispatch(setShandVisible(true));
    });
    this.listenObj(this.dispatcher.event_const.SHANDLE_HANGUP_NOTIFY, (evt) => {
      devMode && console.log("软手柄挂断通知", evt.msg);
      let shandInfo = {};
      store.dispatch(setShandInfo({ ...shandInfo }));
      store.dispatch(setShandVisible(false));
    });
    this.listenObj(
      this.dispatcher.event_const.SHANDLE_REGISTER_NOTIFY,
      (evt) => {
        this.shandleRegisterMsg(evt.msg);
      }
    );
  }
  /**
   * 软手柄注册/抢注册逻辑
   * @param {*} notify
   */
  shandleRegisterMsg = (notify) => {
    let { configData } = store.getState().loading;
    if (
      JSON.stringify(configData) !== "{}" &&
      configData.shandle["disp.shandle.disphtml.use"] == "true"
    ) {
      devMode && console.log("身体软手柄注册通知", notify);
      let _this = this;
      if (notify && notify.type) {
        if (notify.type == "register_succ") {
          //软手柄注册成功
          message.success(notify.msg);
        } else if (notify.type == "register_fail") {
          //软手柄注册失败
          message.error(notify.msg);
        } else if (notify.type == "registered") {
          //手柄已注册 - 提示已注册，是否要抢注册(询问框)
          confirm({
            title: "手柄已注册，是否要抢注册?",
            onOk() {
              _this.dispatcher.calls.shandlePreemptRegister();
            },
            onCancel() {
              console.log("不去抢注册");
            },
          });
        } else if (notify.type == "preempt_register") {
          //软手柄被抢注册,当前页注销
          message.info(notify.msg);
        } else if (notify.type == "preempt_register_fail") {
          //手柄抢注册失败 - 可能是号码非软手柄注册，无法触发强制注销
          message.error(notify.msg);
        } else if (notify.type == "deregister") {
          //软手柄注销,注册状态中断
          message.error(notify.msg);
        }
      }
    }
  };

  /**
   * 配置改变
   */
  confgChange = (msg) => {
    devMode && console.log("配置改变：", msg);
    if (msg) {
      let dutystate = msg.value.split(";")[0]; //state=allout / state=allin
      let tels = msg.value.split(";")[1]; //tels=111|222|33
      let telsString = tels && tels.split("=")[1]; //111|222|333
      let telsArray = telsString && telsString.split("|"); //[111,222,333]
      let stateType = dutystate.split("=")[1]; //allout / allin
      // 暂离  {type:"client_state",value:{state=allout;tels=887}}
      //  鉴权 {type:'cfg_op_num',calue:'op_active'='70012'}
      if (msg.type == "client_state" && stateType == "allout") {
        // 暂离
        store.dispatch(setDutyTelArray(telsArray));
        store.dispatch(setIsShowGoBack(true));
        store.dispatch(setIsShowTempLeave(false));
      } else if (msg.type == "cfg_op_num") {
        // 主副手柄鉴权
        let mainTel = dispatchManager.accountDetail.mainTel;
        let viceTel = dispatchManager.accountDetail.viceTel;
        if (msg.value.split("=")[1] == mainTel) {
          store.dispatch(setCenterOperTel(false)); //主手柄
        } else if (msg.value.split("=")[1] == viceTel) {
          store.dispatch(setCenterOperTel(true));
        }
        dispatchManager.accountDetail.activeHandler = msg.value.split("=")[1];
      } else if (msg.type == "stop_decoder") {
        //关闭的通知
        let tel = msg.value;
        let { shankCall } = store.getState().audioHandle;
        if (tel && shankCall && shankCall.mainTel && tel == shankCall.mainTel) {
          this.clearShankCall("main");
        }
        if (tel && shankCall && shankCall.subTel && tel == shankCall.subTel) {
          this.clearShankCall("sub");
        }
      }
    }
  };
  /**
   * 呼入队列改变
   */
  callInChanged = (msg, isInit) => {
    devMode && console.log("呼入队列改变", msg);
    let allMemData = store.getState().audioHandle.memTelMapCache; //所有人员信息
    let callINList = store.getState().callInHandle.callINList;
    let type = msg.type;
    let tel = msg.data.tel;
    // 呼入人员信息
    let callInMem = {
      type: msg.data.videoInfo,
      tel: tel,
      memTel: tel,
      callTime: timeUtil.timeStampTrans(msg.data.time),
      timeStamp: msg.data.time,
      waitTime: timeUtil.calTimeStamp(msg.data.time),
      memLevel: msg.data.usrLevel,
      name: tel,
      deptName: "",
      dutyName: "",
    };
    let memInfo = allMemData[tel];
    if (memInfo) {
      callInMem.name = memInfo.name || tel;
      callInMem.deptName = memInfo.deptName || "";
      callInMem.dutyName = memInfo.dutyName || "";
    }
    if (msg.type == "add") {
      //新增呼入队列人员
      let addCallIn = false;
      callINList.forEach((item, i) => {
        if (item.tel == tel) {
          addCallIn = true;
          return false;
        }
        if (callInMem.memLevel > item.memLevel) {
          callINList.splice(i, 0, callInMem);
          addCallIn = true;
          store.dispatch(setAudioTag(1));
          store.dispatch(setCallInListTag("add"));
          return false;
        }
      });
      if (!addCallIn) {
        callINList.push(callInMem);
        store.dispatch(setAudioTag(1));
        store.dispatch(setCallInListTag("add"));
        store.dispatch(setCallINList([...callINList]));
      }
    } else if (msg.type == "del") {
      //删除呼入队列人员
      callINList.forEach((item, i) => {
        if (item.tel == tel) {
          callINList.splice(i, 1);
          i--;
        }
      });
      store.dispatch(setCallINList([...callINList]));
      store.dispatch(setCallInListTag(""));
    }
    if (callINList.length == 0) {
      store.dispatch(setIsShowAudioModal(false));
    }
  };
  /**
   * 保持队列改变
   */
  callHoldChanged = (msg) => {
    devMode && console.log("保持队列改变：", msg);
    let allMemData = store.getState().audioHandle.memTelMapCache; //所有人员信息
    let keepInList = store.getState().callInHandle.keepInList;
    let type = msg.type;
    let tel = msg.telStatus.tel;
    // 保持人员信息
    let keeplistMem = {
      tel: tel,
      timeStamp: msg.telStatus.timeStamp,
      waitTime: timeUtil.calTimeStamp(msg.telStatus.timeStamp),
      name: tel,
      deptName: "",
      dutyName: "",
    };
    let memInfo = allMemData[tel];
    if (memInfo) {
      keeplistMem.name = memInfo.name || tel;
      keeplistMem.deptName = memInfo.deptName || "";
      keeplistMem.dutyName = memInfo.dutyName || "";
    }
    if (type == "add") {
      let addKeep = false;
      keepInList.forEach((item, i) => {
        if (item.tel == tel) {
          addKeep = true;
          return false;
        }
      });
      if (!addKeep) {
        keepInList.push(keeplistMem);
        store.dispatch(setKeepInList([...keepInList]));
      }
    } else if (type == "del") {
      keepInList.forEach((item, i) => {
        if (item.tel == tel) {
          keepInList.splice(i, 1);
          i--;
        }
      });
      store.dispatch(setKeepInList([...keepInList]));
    }
  };
  /**
   * 号码状态改变
   */
  telStatusChanged = (msg, isInit) => {
    if (msg) {
      devMode && console.log("号码状态改变", msg);
      let telStatusList = store.getState().audioHandle.telStatusList;
      let tel = msg.tel;
      telStatusList[tel] = msg;
      // 更新号码状态列表，回显人员列表
      store.dispatch(setTelStausList({ ...telStatusList }));
      // 更新手柄通话面板
      this.updateShankCall(msg);
    }
  };
  /**
   * 更新手柄呼叫记录（回显通话面板）
   */
  updateShankCall = (msg, first) => {
    let { configData } = store.getState().loading;
    let isUseVideo = configData.set["disp.set.video.use"];
    let accountDetail = this.dispatchManager.getAccount(); //登陆账号详情
    let allMemData = store.getState().audioHandle.memTelMapCache; //所有人员信息
    let shankCall = store.getState().audioHandle.shankCall;
    let curType = "";
    let tel = msg.tel;
    let conNumber = msg.conNumber || msg.handleNumber; //通话号码
    // let shankCall = {};  //手柄呼叫记录
    let callType = "";
    if (msg.id) return;
    if (
      !(
        msg.status == stsConst.DOUBLETALK ||
        msg.status == stsConst.MONITORANSWER
      ) &&
      tel == accountDetail.mainTel &&
      !shankCall.mainType
    ) {
      this.clearShankCall("main");
      return;
    }
    if (
      !(
        msg.status == stsConst.DOUBLETALK ||
        msg.status == stsConst.MONITORANSWER
      ) &&
      tel == accountDetail.viceTel &&
      !shankCall.subType
    ) {
      this.clearShankCall("sub");
      return;
    }
    // 1. 通知是操作员主/副手柄通知
    if (accountDetail.mainTel == conNumber) {
      curType = "main";
    } else if (accountDetail.viceTel == conNumber) {
      curType = "sub";
    }
    if (msg.videoInfo && msg.videoInfo == "audio") {
      callType = "audio";
    } else if (msg.videoInfo && msg.videoInfo == "video") {
      callType = "video";
    }
    // 根据主/副手柄状态 渲染手柄通话状态
    if (
      curType &&
      (msg.status == stsConst.DOUBLETALK ||
        msg.status == stsConst.MONITORANSWER)
    ) {
      let memInfo = allMemData[tel];
      store.dispatch(setAudioTag(2));
      if (curType == "main") {
        shankCall.mainTalkStatus = msg.status;
        shankCall.mainMemName = (memInfo && memInfo.name) || tel;
        shankCall.maindeptName = (memInfo && memInfo.deptName) || "";
        shankCall.mainDutyName = (memInfo && memInfo.dutyName) || "";
        shankCall.mainTel = tel;
        shankCall.mainDeptId = memInfo && memInfo.deptId;
        shankCall.mainMemId = memInfo && memInfo.id;
        shankCall.mainTimeStamp = msg.timeStamp;
        shankCall.mainCallType = callType;
        shankCall.mainType = "main";
        shankCall.mainLong = "";
        store.dispatch(setIsMainTalk(true));
        store.dispatch(setIsSubTalk(false));
        if (shankCall.mainCallType == "video" && isUseVideo == "true") {
          store.dispatch(setIsShowMainZdh(true));
        }
      } else if (curType == "sub") {
        shankCall.subTalkStatus = msg.status;
        shankCall.subMemName = (memInfo && memInfo.name) || tel;
        shankCall.subdeptName = (memInfo && memInfo.deptName) || "";
        shankCall.subDutyName = (memInfo && memInfo.dutyName) || "";
        shankCall.subDeptId = memInfo && memInfo.deptId;
        shankCall.subMemId = memInfo && memInfo.id;
        shankCall.subTel = tel;
        shankCall.subType = "sub";
        shankCall.subTimeStamp = msg.timeStamp;
        shankCall.subCallType = callType;
        shankCall.subLong = "";
        store.dispatch(setIsMainTalk(false));
        if (shankCall.subCallType == "video" && isUseVideo == "true") {
          store.dispatch(setIsShowSubZdh(true));
        }
        store.dispatch(setIsSubTalk(true));
      }
      store.dispatch(setShankCall({ ...shankCall }));
    } else if (
      msg.status == stsConst.IDLE ||
      msg.status == stsConst.OFFLINE ||
      msg.status == stsConst.CALLTURNING
    ) {
      //如果检测到手柄号码状态挂机，则修改手柄显示状态
      if (
        shankCall.mainType &&
        shankCall.mainType == "main" &&
        msg.tel == accountDetail.mainTel
      ) {
        this.clearShankCall("main");
      } else if (
        shankCall.subType &&
        shankCall.subType == "sub" &&
        msg.tel == accountDetail.viceTel
      ) {
        this.clearShankCall("sub");
      }
    }
    //如果收到当前显示操作员通话面板的号码  状态变成结束通话状态，则清除该面板的通话中显示内容
    if (
      msg.status == stsConst.IDLE ||
      msg.status == stsConst.OFFLINE ||
      msg.status == stsConst.CALLHOLD
    ) {
      if (
        shankCall.mainType &&
        shankCall.mainType == "main" &&
        msg.tel == accountDetail.mainTel
      ) {
        this.clearShankCall("main");
      } else if (
        shankCall.subType &&
        shankCall.subType == "sub" &&
        msg.tel == accountDetail.viceTel
      ) {
        this.clearShankCall("sub");
      }
    }
    // 初始化判断是否有视频通话
    if (
      first ||
      msg.status == stsConst.DOUBLETALK ||
      msg.status == stsConst.MONITORANSWER
    ) {
      this.judgeVideoCall();
    }
  };
  /**
   * 初始化判断是否有视频通话
   */
  judgeVideoCall = () => {
    let { configData } = store.getState().loading;
    if (
      JSON.stringify(configData) !== "{}" &&
      configData.set["disp.set.video.use"] == "true"
    ) {
      let shankCall = store.getState().audioHandle.shankCall;
      let isMainTalk = store.getState().audioHandle.isMainTalk;
      let isSubTalk = store.getState().audioHandle.isSubTalk;
      if (isMainTalk && shankCall.mainCallType == "video") {
        let callInterVal = setInterval(() => {
          // window.scooper.videoManager && window.scooper.videoManager.videoController._windowsArr && window.scooper.videoManager.videoController._windowsArr.length >= 1
          if (
            window.scooper.videoManagers &&
            window.scooper.videoManagers.videoController
          ) {
            if (
              window.scooper.videoManagers.videoController.isPlaying(
                shankCall.mainTel
              ) > -1
            ) {
              // 正在播放 显示出来
              $(".web-rtc-video").removeClass("hide");
            } else {
              // 未播放 进行播放操作
              if (shankCall.mainTel) {
                window.scooper.videoManagers.videoController.playByOrderExpandWindow(
                  shankCall.mainTel,
                  shankCall.mainTel
                );
              }
            }
            clearInterval(callInterVal);
          } else {
            clearInterval(callInterVal);
            return;
          }
        }, 1000);

        store.dispatch(setIsShowMainZdh(false));
        store.dispatch(setIsShowSubZdh(true));
      }
      if (isSubTalk && shankCall.subCallType == "video") {
        let callSubInterVal = setInterval(() => {
          // window.scooper.videoManager.videoController._windowsArr && window.scooper.videoManager.videoController._windowsArr.length > 0
          if (
            window.scooper.videoManagers &&
            window.scooper.videoManagers.videoController
          ) {
            if (
              window.scooper.videoManagers.videoController.isPlaying(
                shankCall.subTel
              ) > -1
            ) {
              // 正在播放 显示出来
              $(".web-rtc-video").removeClass("hide");
            } else {
              // 未播放 进行播放操作
              if (shankCall.subTel) {
                window.scooper.videoManagers.videoController.playByOrderExpandWindow(
                  shankCall.subTel,
                  shankCall.subTel
                );
              }
            }
            clearInterval(callSubInterVal);
          } else {
            clearInterval(callSubInterVal);
            return;
          }
        }, 1000);
        store.dispatch(setIsShowSubZdh(false));

        store.dispatch(setIsShowMainZdh(true));
      }
    }
  };
  /**
   * 计算通话时间
   */
  calOperCallLong = () => {
    let shankCall = store.getState().audioHandle.shankCall;
    if (JSON.stringify(shankCall) == "{}") return;
    if (
      shankCall.mainType &&
      shankCall.mainType == "main" &&
      shankCall.mainTimeStamp
    ) {
      shankCall.mainLong = timeUtil.calTimeStamp(shankCall.mainTimeStamp);
      store.dispatch(setIsMainTalk(true));
    }
    if (
      shankCall.subType &&
      shankCall.subType == "sub" &&
      shankCall.subTimeStamp
    ) {
      shankCall.subLong = timeUtil.calTimeStamp(shankCall.subTimeStamp);
      store.dispatch(setIsSubTalk(true));
    }
    store.dispatch(setShankCall({ ...shankCall }));
  };
  /**
   * 计算呼入等待时间
   */
  calCallInWaitTime = () => {
    let callINList = store.getState().callInHandle.callINList;
    if (callINList.length == 0) return;
    callINList.forEach((item) => {
      item.waitTime = timeUtil.calTimeStamp(item.timeStamp);
    });
    store.dispatch(setCallINList([...callINList]));
  };
  /**
   * 计算保持等待时间
   */
  calCallHoldWaitTime = () => {
    let keepInList = store.getState().callInHandle.keepInList;
    if (keepInList.length == 0) return;
    keepInList.forEach((item) => {
      item.waitTime = timeUtil.calTimeStamp(item.timeStamp);
    });
    store.dispatch(setKeepInList([...keepInList]));
  };
  /**
   * 清除手柄呼叫状态
   */
  clearShankCall = (type) => {
    let shankCall = store.getState().audioHandle.shankCall;
    if (type == "main") {
      if (
        window.scooper.videoManagers &&
        window.scooper.videoManagers.videoController
      ) {
        if (
          window.scooper.videoManagers.videoController.isPlaying(
            shankCall.mainTel
          ) > -1
        ) {
          // 正在播放 -> 关闭视频
          window.scooper.videoManagers.videoController.close(
            window.scooper.videoManagers.videoController.isPlaying(
              shankCall.mainTel
            )
          );
        }
      }
      shankCall.mainTalkStatus = "";
      shankCall.mainCallType = "";
      shankCall.mainDutyName = "";
      shankCall.mainLong = "";
      shankCall.mainMemName = "";
      shankCall.mainTel = "";
      shankCall.mainTimeStamp = "";
      shankCall.mainType = "";
      shankCall.maindeptName = "";
      shankCall.mainDeptId = "";
      shankCall.mainMemId = "";
      store.dispatch(setShankCall({ ...shankCall }));
      store.dispatch(setIsMainTalk(false));
    }
    if (type == "sub") {
      if (
        window.scooper.videoManagers &&
        window.scooper.videoManagers.videoController
      ) {
        if (
          window.scooper.videoManagers.videoController.isPlaying(
            shankCall.subTel
          ) > -1
        ) {
          // 正在播放 -> 关闭视频
          window.scooper.videoManagers.videoController.close(
            window.scooper.videoManagers.videoController.isPlaying(
              shankCall.subTel
            )
          );
        }
      }
      shankCall.subTalkStatus = "";
      shankCall.subCallType = "";
      shankCall.subDutyName = "";
      shankCall.subLong = "";
      shankCall.subMemName = "";
      shankCall.subTel = "";
      shankCall.subTimeStamp = "";
      shankCall.subType = "";
      shankCall.subdeptName = "";
      shankCall.subDeptId = "";
      shankCall.subMemId = "";
      store.dispatch(setIsSubTalk(false));
      store.dispatch(setShankCall({ ...shankCall }));
    }
  };
}

window.scooper = window.scooper || {};
const dispatchManager =
  (window.top.scooper.dispatchManager =
    window.scooper.dispatchManager =
    new DispatchManager());
export default dispatchManager;
