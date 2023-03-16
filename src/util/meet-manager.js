/*
 * @File: 会议类管理
 * @Author: liulian
 * @Date: 2020-09-18 15:48:17
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 10:28:32
 */
import EventDispatcher from "./event";
import store from "../store";
import {
  setMeetDetailList,
  setAllMeetOpLogs,
} from "../reducer/meet-handle-reduce";
import timeUtil from "./time-util";
import { fillMeetDetailList } from "./meet-method";
import { uniqueArr } from "./method";
import { devMode } from "../config/constants";

let dispatchManager = window.scooper.dispatchManager;
/**
 * 调度 - 会议
 */
class DispatchMeets extends EventDispatcher {
  meetsObj; //调度会议对象
  dispatcher; //scooper.dispatch
  constructor(props) {
    super(props);
    dispatchManager.register("dispatch.loaded", async () => {
      this.dispatcher = dispatchManager.dispatcher;
      this.meetsObj = dispatchManager.dispatcher.meets;
      const meetListen = new MeetListen({ dispatchManager: this });
      meetListen.init();
      setInterval(() => {
        meetListen.calMeetLength();
      }, 1000);
    });
  }
  /**
   * 获取scooper.dispatch.meets对象
   */
  getMeets() {
    if (!this.meetsObj) {
      if (!dispatchManager.dispatcher.meets) {
        throw new Error("scooper.dispatch.meets is undefined!");
      }
      this.meetsObj = dispatchManager.dispatcher.meets;
    }
    return this.meetsObj;
  }
}

/**
 * 调度-状态监听
 */
class MeetListen {
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
    this.registerMeetStatus(); //会场状态变化通知
    this.registerMeetListChanged(); //会场列表变化通知
    this.registerMeetMemChanged(); //会场成员状态变化通知
    this.registerMeetMemRecord(); //会场成员记录变化通知
    this.registerMeetMemRecordDelAll(); //会场成员记录全部清除通知
    // this.registerPackResData();//操作响应包
  }

  /**
   * 监听会场状态变化通知
   */
  registerMeetStatus() {
    this.listenObj(this.dispatcher.event_const.MEET_STS, (evt) => {
      this.meetStatusChanged(evt.msg);
    });
  }
  /**
   * 监听会场列表变化通知
   */
  registerMeetListChanged() {
    this.listenObj(this.dispatcher.event_const.MEET_LST, (evt) => {
      this.meetListChanged(evt.msg);
    });
  }
  /**
   * 监听会场成员状态变化通知
   */
  registerMeetMemChanged() {
    this.listenObj(this.dispatcher.event_const.MEET_MEM, (evt) => {
      // console.log(evt);
      this.meetMemChanged(evt.msg);
    });
  }
  /**
   * 会场成员记录变化通知
   */
  registerMeetMemRecord() {
    this.listenObj(
      this.dispatcher.event_const.MEET_MEM_RECORD_NOTIFY,
      (evt) => {
        this.meetMemRecordChanged(evt.msg);
      }
    );
  }
  /**
   * 会场成员记录全部清除通知
   */
  registerMeetMemRecordDelAll = () => {
    this.listenObj(
      this.dispatcher.event_const.MEET_MEM_RECORD_DEL_ALL_NOTIFY,
      (evt) => {
        let msg = evt.msg;
        devMode && console.log("收到会场成员记录全部清除通知：", msg);
        if (msg.meetId) {
          let { meetDetailList } = store.getState().meetHandle;
          if (msg.type == "delAll") {
            meetDetailList.map((item) => {
              if (item.meetId == msg.meetId && !item.locked) {
                item.meetMem = [];
              }
            });
            fillMeetDetailList([...meetDetailList]);
          }
        }
      }
    );
  };
  /**
   * 会场成员记录变化通知
   */
  meetMemRecordChanged = (msg) => {
    devMode && console.log("收到会场成员记录变化通知：", msg);
    let { meetDetailList } = store.getState().meetHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    if (msg.meetId) {
      meetDetailList.map((item) => {
        if (item.meetId == msg.meetId) {
          //更新status
          item.meetMem &&
            item.meetMem.map((mem, i) => {
              if (mem.tel == msg.tel) {
                mem.status = msg.status;
              }
            });
          if (item.meetMem.length == 0 && msg.status == "calling") {
            let param = {
              meetId: item.meetId,
              status: msg.status,
              tel: msg.tel,
              memName:
                (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].memName) ||
                msg.tel,
              deptName:
                (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].deptName) ||
                "",
            };
            item.meetMem.push(param);
          }
          let newName =
            (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].memName) ||
            msg.tel;
          let opMsg = "";
          if (msg.status == "reject" || msg.status == "unresponse") {
            opMsg = newName + "拒绝加入会场";
          } else if (msg.status == "calling") {
            opMsg = "正在呼叫" + newName;
          }
          this.addOpLog(msg.meetId, opMsg);
        }
      });
      fillMeetDetailList([...meetDetailList]);
    }
  };
  /**
   * 会场成员状态变化通知（进入，退出，等级变化）
   */
  meetMemChanged = (msg) => {
    devMode && console.log("收到会场成员状态变化通知：", msg);
    let { meetDetailList } = store.getState().meetHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    let level = msg.level;
    if (msg.type == "level") {
      //等级发生变化
      meetDetailList.map((item) => {
        if (item.meetId == msg.meetId) {
          item.meetMem &&
            item.meetMem.map((mem, i) => {
              if (mem.tel == msg.tel) {
                if (msg.level != "chairman") {
                  mem.level = level;
                }

                let opMsg =
                  mem.memName ||
                  (memTelMapCache[msg.tel] &&
                    memTelMapCache[msg.tel].memName) ||
                  msg.tel;
                if (level == "handup") {
                  opMsg += "举手发言";
                } else if (level == "chairman") {
                  opMsg += "被设置为主持人";
                  mem.chair = true;
                } else {
                  level == "audience" && (opMsg += "被禁言");
                  level == "speak" && (opMsg += "可发言");
                  level == "private" && (opMsg += "单独通话");
                }
                this.addOpLog(msg.meetId, opMsg);
              } else if (msg.level == "chairman") {
                mem.chair = false; //清除上一个主持人状态
              }
            });
        }
      });
      fillMeetDetailList([...meetDetailList]);
    } else if (msg.type == "leave") {
      //离开会场
      meetDetailList.map((item) => {
        if (item.meetId == msg.meetId) {
          item.meetMem &&
            item.meetMem.map((mem, i) => {
              if (mem.tel == msg.tel) {
                mem.status = "quit";
              }
            });
        }
      });
      // const items = meetDetailList.find(meet => meet.meetId  == msg.meetId);
      // 填充会议列表
      fillMeetDetailList([...meetDetailList]);
      let opMsg =
        (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].memName) || msg.tel;
      opMsg += "离开会场";
      this.addOpLog(msg.meetId, opMsg);
    } else if (msg.type == "join") {
      meetDetailList.map((item) => {
        if (item.meetId == msg.meetId) {
          let findMeetMember = false;
          let mem = {
            tel: msg.tel,
            level: level || "",
          };
          item.meetMem = item.meetMem || [];
          item.meetMem &&
            item.meetMem.map((member, i) => {
              if (member.tel == msg.tel) {
                findMeetMember = true;
                member.level = level;
                return false;
              }
            });
          if (!findMeetMember) {
            mem.level = level;
            mem.meetId = msg.meetId;
            mem.memName =
              (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].memName) ||
              msg.tel;
            mem.deptName =
              (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].deptName) ||
              "";
            item.meetMem.push(mem);
          }
          let newName =
            (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].memName) ||
            msg.tel;
          let opMsg = newName + "加入会场";
          this.addOpLog(msg.meetId, opMsg);
        }
      });
      // const items = meetDetailList.find(meet => meet.meetId  == msg.meetId);
      fillMeetDetailList([...meetDetailList]);
    }
  };
  /**
   * 添加日志
   */
  addOpLog = (meetId, opMsg) => {
    let { allMeetOpLogs } = store.getState().meetHandle;
    if (!opMsg) return;
    let time = timeUtil.getTime();
    let log = {
      time: time,
      log: opMsg,
    };
    let findMeet = false;
    allMeetOpLogs.map((item) => {
      if (item.meetId == meetId) {
        findMeet = true;
        item.logs.unshift(log);
      }
    });
    // 该会场操作记录为空，新建该会场的操作记录
    if (!findMeet) {
      let meetOplogs = {
        meetId: meetId, //
        logs: [],
      };
      meetOplogs.logs.unshift(log);
      allMeetOpLogs.unshift(meetOplogs);
    }
    store.dispatch(setAllMeetOpLogs([...allMeetOpLogs]));
  };
  /**
   * 监听会场状态变化通知
   * {"playvoice":false,"meetId":"1008","destroy":false,"recording":false,"meetName":"默认","locked":false}
   */
  meetStatusChanged = (msg) => {
    let { meetDetailList } = store.getState().meetHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    devMode && console.log("收到会场状态变化通知：", msg);
    if (msg.meetAttr == "MEET_RESERVE" || msg.meetType == "MEET_RESERVE") {
      // 预约会议
      meetDetailList.map((item, index) => {
        if (item.meetId == msg.id) {
          item.meetName = msg.meetName;
          item.meetAccess = msg.meetAccess;
          item.passwdAudience = msg.passwdAudience;
          item.passwdSpeaker = msg.passwdSpeaker;
          item.timeBegin = msg.timeBegin;
          item.timeEnd = msg.timeEnd;
          let memberArr = [];
          if (msg.members.length > 0) {
            msg.members.map((mem) => {
              if (!mem.tel) {
                let param = {
                  tel: mem,
                  meetId: item.meetId,
                };
                memberArr.push(param);
              } else {
                memberArr.push(mem);
              }
            });
          }
          memberArr = uniqueArr(memberArr); //去重
          memberArr.map((realMem) => {
            realMem.memName =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].memName) ||
              realMem.tel;
            realMem.deptName =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].deptName) ||
              "";
          });
          item.meetMem = memberArr;
        }
      });
      const items = meetDetailList.find((meet) => meet.meetId == msg.id);
      fillMeetDetailList(meetDetailList, items);
    } else {
      //预约会议转立即会议
      var findReserveMeet = false;
      meetDetailList.map((meet, i) => {
        if (
          meet.meetId &&
          meet.meetId == msg.id &&
          meet.meetAttr == "MEET_RESERVE"
        ) {
          //预约会议转立即会议

          findReserveMeet = true;
          meet.meetAttr = "MEET_INSTANT";
          let memberArr = [];
          if (msg.members.length > 0) {
            msg.members.map((mem) => {
              if (!mem.tel) {
                let param = {
                  tel: mem,
                  meetId: meet.meetId,
                };
                memberArr.push(param);
              } else {
                memberArr.push(mem);
              }
            });
          }
          memberArr = uniqueArr(memberArr); //去重
          memberArr.map((realMem) => {
            realMem.memName =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].memName) ||
              realMem.tel;
            realMem.deptName =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].deptName) ||
              "";
          });
          meet.meetMem = memberArr;
        }
        fillMeetDetailList([...meetDetailList]);
      });

      if (findReserveMeet) return;
      // 立即会议
      meetDetailList.map((meet) => {
        if (meet.meetId == msg.id) {
          meet.meetName = msg.meetName || msg.name || meet.meetName;
          let opMsg;
          if (meet.recording != msg.recording) {
            opMsg = "会场" + (msg.recording ? "开始录音" : "结束录音");
          }
          if (meet.playvoice != msg.playvoice) {
            opMsg = "会场" + (msg.playvoice ? "开始放音" : "结束放音");
          }
          if (meet.locked != msg.locked) {
            opMsg = "会场" + (msg.locked ? "锁定" : "解锁");
          }
          this.addOpLog(meet.meetId, opMsg);
          meet.recording = msg.recording;
          meet.playvoice = msg.playvoice;
          meet.locked = msg.locked;
          meet.chairman = msg.chairman;
          meet.meetAccess = msg.meetAccess;
          meet.passwdAudience = msg.passwdAudience;
          meet.passwdSpeaker = msg.passwdSpeaker;
          meet.timeBegin = meet.timeBegin || msg.timeBegin;
          meet.timeEnd = meet.timeEnd || msg.timeEnd;
        }
      });
      const items = meetDetailList.find((meet) => meet.meetId == msg.id);
      fillMeetDetailList(meetDetailList, items);
    }
  };

  /**
   * 会场列表变化通知
   * {type:'add'/'remove' meet:{id:'',meetName:''...}}
   */
  meetListChanged = (msg) => {
    let { meetDetailList } = store.getState().meetHandle;
    devMode && console.log("收到会场列表变化通知：", msg);
    if (msg.type == "add") {
      this.addMeet(msg.meet.id);
    } else if (msg.type == "remove") {
      meetDetailList.map((item, index) => {
        if (item.meetId == msg.meet.id) {
          if (item.meetSymbol == "main") {
            // 删除的是主会场，更新主会场到默认会场
            const items = meetDetailList.find(
              (meet) => meet.meetCreateId == "default"
            ); //当前操作员的默认会场
            items.meetSymbol = "main";
          }
          meetDetailList.splice(index, 1);
        }
      });
    }
    fillMeetDetailList(meetDetailList);
  };
  /**
   * 新建会场
   */
  addMeet = (meetId) => {
    let { meetDetailList } = store.getState().meetHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    if (!meetId) return;
    window.scooper.meetManager &&
      window.scooper.meetManager.meetsObj.getMeet(meetId, (meetInfo) => {
        devMode && console.log(meetInfo);
        if (!meetInfo) return;
        meetInfo.meetId = meetInfo.meetId || meetInfo.id;
        meetInfo.meetName = meetInfo.meetName || meetInfo.name;
        meetInfo.meetSymbol = "";
        meetInfo.timeLength = "";
        if (
          meetInfo.meetId ==
          window.scooper.dispatchManager.accountDetail.accUsername
        ) {
          // 默认会场
          meetInfo.meetCreateId = "default";
          meetInfo.meetSymbol = "main";

          // item.isSetMain = 1;
          meetInfo.meetAccess = meetInfo.meetId; //meetInfo.meetAccess为空
        } else if (
          meetInfo.meetId == meetInfo.meetName ||
          meetInfo.meetCreateId == meetInfo.meetName
        ) {
          // 其他操作员的默认会场
          meetInfo.meetAccess = meetInfo.meetId;
        }
        if (meetInfo.members.length > 0) {
          // 与会人员
          meetInfo.members = uniqueArr(meetInfo.members); //去重

          meetInfo.members.map((mem) => {
            mem.memName =
              (memTelMapCache[mem.tel] && memTelMapCache[mem.tel].memName) ||
              mem.tel;
            mem.deptName =
              (memTelMapCache[mem.tel] && memTelMapCache[mem.tel].deptName) ||
              "";
            if (mem.level == "chairman") {
              mem.chair = true;
            }
          });
          meetInfo.meetMem = meetInfo.members;
        } else {
          meetInfo.meetMem = [];
        }
        const findMeet = meetDetailList.find((meet) => meet.meetId == meetId);

        if (findMeet) return; //找到了
        let findMeetList = false;
        meetDetailList.some((element, i) => {
          if (element.meetId.toString().indexOf("none-") >= 0) {
            meetDetailList[i] = meetInfo;
            findMeetList = true;
            return true;
          }
        });
        if (
          !findMeetList &&
          meetDetailList.length >= 4 &&
          meetDetailList[3].meetId.toString().indexOf("none-") < 0 &&
          meetDetailList[2].meetId.toString().indexOf("none-") < 0 &&
          meetDetailList[1].meetId.toString().indexOf("none-") < 0 &&
          meetDetailList[0].meetId.toString().indexOf("none-") < 0
        ) {
          meetDetailList.push(meetInfo);
        }

        fillMeetDetailList(meetDetailList);
      });
  };
  /**
   * 计算会议时间
   */
  calMeetLength = () => {
    let { meetDetailList } = store.getState().meetHandle;
    meetDetailList.map((item) => {
      // 立即会议 计算会议时长
      if (item.meetAttr != "MEET_RESERVE") {
        //  (操作员和其他操作员的默认会场不显示会议时长)
        // if((item.meetCreateId == 'default' || item.meetId == item.meetName || item.meetCreateId == item.meetName) && item.meetMem && item.meetMem.length == 0){
        //     return ;
        // }
        let date = timeUtil.transDateByDateStr(item.timeBegin);
        if (date) {
          let dateStamp = date.getTime();
          item.timeLength = timeUtil.calTimeStamp(dateStamp);
        }
      }
    });
    store.dispatch(setMeetDetailList([...meetDetailList]));
  };
}

window.scooper = window.scooper || {};
const meetManager = (window.scooper.meetManager = new DispatchMeets());
export default meetManager;
