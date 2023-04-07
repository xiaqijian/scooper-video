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
import { meetapis } from '../api/meetapis'

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
        if (msg.id) {
          let { meetDetailList } = store.getState().meetHandle;
          if (msg.type == "delAll") {
            meetDetailList.map((item) => {
              if (item.id == msg.id && !item.locked) {
                item.attendees = [];
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
    if (msg.id) {
      meetDetailList.map((item) => {
        if (item.id == msg.id) {
          //更新status
          item.attendees &&
            item.attendees.map((mem, i) => {
              if (mem.tel == msg.tel) {
                mem.status = msg.status;
              }
            });
          if (item.attendees.length == 0 && msg.status == "calling") {
            let param = {
              id: item.id,
              status: msg.status,
              tel: msg.tel,
              name:
                (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].name) ||
                msg.tel,
              deptName:
                (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].deptName) ||
                "",
            };
            item.attendees.push(param);
          }
          let newName =
            (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].name) ||
            msg.tel;
          let opMsg = "";
          if (msg.status == "reject" || msg.status == "unresponse") {
            opMsg = newName + "拒绝加入会场";
          } else if (msg.status == "calling") {
            opMsg = "正在呼叫" + newName;
          }
          this.addOpLog(msg.id, opMsg);
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
        if (item.id == msg.id) {
          item.attendees &&
            item.attendees.map((mem, i) => {
              if (mem.tel == msg.tel) {
                if (msg.level != "chairman") {
                  mem.level = level;
                }

                let opMsg =
                  mem.name ||
                  (memTelMapCache[msg.tel] &&
                    memTelMapCache[msg.tel].name) ||
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
                this.addOpLog(msg.id, opMsg);
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
        if (item.id == msg.id) {
          item.attendees &&
            item.attendees.map((mem, i) => {
              if (mem.tel == msg.tel) {
                mem.status = "quit";
              }
            });
        }
      });
      // const items = meetDetailList.find(meet => meet.id  == msg.id);
      // 填充会议列表
      fillMeetDetailList([...meetDetailList]);
      let opMsg =
        (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].name) || msg.tel;
      opMsg += "离开会场";
      this.addOpLog(msg.id, opMsg);
    } else if (msg.type == "join") {
      meetDetailList.map((item) => {
        if (item.id == msg.id) {
          let findMeetMember = false;
          let mem = {
            tel: msg.tel,
            level: level || "",
          };
          item.attendees = item.attendees || [];
          item.attendees &&
            item.attendees.map((member, i) => {
              if (member.tel == msg.tel) {
                findMeetMember = true;
                member.level = level;
                return false;
              }
            });
          if (!findMeetMember) {
            mem.level = level;
            mem.id = msg.id;
            mem.name =
              (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].name) ||
              msg.tel;
            mem.deptName =
              (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].deptName) ||
              "";
            item.attendees.push(mem);
          }
          let newName =
            (memTelMapCache[msg.tel] && memTelMapCache[msg.tel].name) ||
            msg.tel;
          let opMsg = newName + "加入会场";
          this.addOpLog(msg.id, opMsg);
        }
      });
      // const items = meetDetailList.find(meet => meet.id  == msg.id);
      fillMeetDetailList([...meetDetailList]);
    }
  };
  /**
   * 添加日志
   */
  addOpLog = async (id, opMsg) => {
    let { allMeetOpLogs } = store.getState().meetHandle;
    if (!opMsg) return;
    let time = timeUtil.getTime();
    let log = {
      time: time,
      log: opMsg,
    };
    let findMeet = false;
    allMeetOpLogs.map((item) => {
      if (item.id == id) {
        findMeet = true;
        item.logs.unshift(log);
      }
    });
    // 该会场操作记录为空，新建该会场的操作记录
    if (!findMeet) {
      let meetOplogs = {
        id: id, //
        logs: [],
      };
      meetOplogs.logs.unshift(log);
      allMeetOpLogs.unshift(meetOplogs);
    }
    // let res = await meetapis.meetManagePrefix.getMeetLogs({
    //   confId,
    //   startTime,
    //   endTime,
    // })
    store.dispatch(setAllMeetOpLogs([...allMeetOpLogs]));
  };
  /**
   * 监听会场状态变化通知
   * {"playvoice":false,"id":"1008","destroy":false,"recording":false,"subject":"默认","locked":false}
   */
  meetStatusChanged = (msg) => {
    let { meetDetailList } = store.getState().meetHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    devMode && console.log("收到会场状态变化通知：", msg);
    if (msg.conferenceTimeType == "EDIT_CONFERENCE" || msg.meetType == "EDIT_CONFERENCE") {
      // 预约会议
      meetDetailList.map((item, index) => {
        if (item.id == msg.id) {
          item.subject = msg.subject;
          item.accessCode = msg.accessCode;
          item.guestPassword = msg.guestPassword;
          item.chairmanPassword = msg.chairmanPassword;
          item.timeBegin = msg.timeBegin;
          item.timeEnd = msg.timeEnd;
          let memberArr = [];
          if (msg.members.length > 0) {
            msg.members.map((mem) => {
              if (!mem.tel) {
                let param = {
                  tel: mem,
                  id: item.id,
                };
                memberArr.push(param);
              } else {
                memberArr.push(mem);
              }
            });
          }
          memberArr = uniqueArr(memberArr); //去重
          memberArr.map((realMem) => {
            realMem.name =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].name) ||
              realMem.tel;
            realMem.deptName =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].deptName) ||
              "";
          });
          item.attendees = memberArr;
        }
      });
      const items = meetDetailList.find((meet) => meet.id == msg.id);
      fillMeetDetailList(meetDetailList, items);
    } else {
      //预约会议转立即会议
      var findReserveMeet = false;
      meetDetailList.map((meet, i) => {
        if (
          meet.id &&
          meet.id == msg.id &&
          meet.conferenceTimeType == "EDIT_CONFERENCE"
        ) {
          //预约会议转立即会议

          findReserveMeet = true;
          meet.conferenceTimeType = "INSTANT_CONFERENCE";
          let memberArr = [];
          if (msg.members.length > 0) {
            msg.members.map((mem) => {
              if (!mem.tel) {
                let param = {
                  tel: mem,
                  id: meet.id,
                };
                memberArr.push(param);
              } else {
                memberArr.push(mem);
              }
            });
          }
          memberArr = uniqueArr(memberArr); //去重
          memberArr.map((realMem) => {
            realMem.name =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].name) ||
              realMem.tel;
            realMem.deptName =
              (memTelMapCache[realMem.tel] &&
                memTelMapCache[realMem.tel].deptName) ||
              "";
          });
          meet.attendees = memberArr;
        }
        fillMeetDetailList([...meetDetailList]);
      });

      if (findReserveMeet) return;
      // 立即会议
      meetDetailList.map((meet) => {
        if (meet.id == msg.id) {
          meet.subject = msg.subject || msg.name || meet.subject;
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
          this.addOpLog(meet.id, opMsg);
          meet.recording = msg.recording;
          meet.playvoice = msg.playvoice;
          meet.locked = msg.locked;
          meet.chairman = msg.chairman;
          meet.accessCode = msg.accessCode;
          meet.guestPassword = msg.guestPassword;
          meet.chairmanPassword = msg.chairmanPassword;
          meet.timeBegin = meet.timeBegin || msg.timeBegin;
          meet.timeEnd = meet.timeEnd || msg.timeEnd;
        }
      });
      const items = meetDetailList.find((meet) => meet.id == msg.id);
      fillMeetDetailList(meetDetailList, items);
    }
  };

  /**
   * 会场列表变化通知
   * {type:'add'/'remove' meet:{id:'',subject:''...}}
   */
  meetListChanged = (msg) => {
    let { meetDetailList } = store.getState().meetHandle;
    devMode && console.log("收到会场列表变化通知：", msg);
    if (msg.type == "add") {
      this.addMeet(msg.meet.id);
    } else if (msg.type == "remove") {
      meetDetailList.map((item, index) => {
        if (item.id == msg.meet.id) {
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
  addMeet = (id) => {
    let { meetDetailList } = store.getState().meetHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    if (!id) return;
    window.scooper.meetManager &&
      window.scooper.meetManager.meetsObj.getMeet(id, (meetInfo) => {
        devMode && console.log(meetInfo);
        if (!meetInfo) return;
        meetInfo.id = meetInfo.id || meetInfo.id;
        meetInfo.subject = meetInfo.subject || meetInfo.name;
        meetInfo.meetSymbol = "";
        meetInfo.timeLength = "";
        if (
          meetInfo.id ==
          window.scooper.dispatchManager.accountDetail.accUsername
        ) {
          // 默认会场
          meetInfo.meetCreateId = "default";
          meetInfo.meetSymbol = "main";

          // item.isSetMain = 1;
          meetInfo.accessCode = meetInfo.id; //meetInfo.meetAccess为空
        } else if (
          meetInfo.id == meetInfo.subject ||
          meetInfo.meetCreateId == meetInfo.subject
        ) {
          // 其他操作员的默认会场
          meetInfo.accessCode = meetInfo.id;
        }
        if (meetInfo.members.length > 0) {
          // 与会人员
          meetInfo.members = uniqueArr(meetInfo.members); //去重

          meetInfo.members.map((mem) => {
            mem.name =
              (memTelMapCache[mem.tel] && memTelMapCache[mem.tel].name) ||
              mem.tel;
            mem.deptName =
              (memTelMapCache[mem.tel] && memTelMapCache[mem.tel].deptName) ||
              "";
            if (mem.level == "chairman") {
              mem.chair = true;
            }
          });
          meetInfo.attendees = meetInfo.members;
        } else {
          meetInfo.attendees = [];
        }
        const findMeet = meetDetailList.find((meet) => meet.id == id);

        if (findMeet) return; //找到了
        let findMeetList = false;
        meetDetailList.some((element, i) => {
          if (element.id.toString().indexOf("none-") >= 0) {
            meetDetailList[i] = meetInfo;
            findMeetList = true;
            return true;
          }
        });
        if (
          !findMeetList &&
          meetDetailList.length >= 4 &&
          meetDetailList[3].id.toString().indexOf("none-") < 0 &&
          meetDetailList[2].id.toString().indexOf("none-") < 0 &&
          meetDetailList[1].id.toString().indexOf("none-") < 0 &&
          meetDetailList[0].id.toString().indexOf("none-") < 0
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
      if (item.conferenceTimeType != "EDIT_CONFERENCE") {
        //  (操作员和其他操作员的默认会场不显示会议时长)
        // if((item.meetCreateId == 'default' || item.id == item.subject || item.meetCreateId == item.subject) && item.attendees && item.attendees.length == 0){
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
