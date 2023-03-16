/*
 * @File: 会议会商中一些通用的方法
 * @Author: liulian
 * @Date: 2020-09-22 16:13:24
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-09 09:18:05
 */
import { setCurMeet, setMeetDetailList } from "../reducer/meet-handle-reduce";
import { uniqueArr } from "./method";
import store from "../store";
import dispatchManager from "./dispatch-manager";

export const joinMeet = (tel) => {
  let { meetDetailList } = store.getState().meetHandle;
  let findSymbol = false;
  meetDetailList.map((item) => {
    if (item.meetSymbol == "main") {
      findSymbol = true;
      dispatchManager.dispatcher.meets.joinMember(item.meetId, tel);
      return;
    }
  });
  if (!findSymbol) {
    let meetId = dispatchManager.accountDetail.accUsername;
    dispatchManager.dispatcher.meets.joinMember(meetId, tel);
  }
};
/**
 * 获取主会场id
 */
export const getMainMeetId = () => {
  let { meetDetailList } = store.getState().meetHandle;
  let findSymbol = false;
  let meetId;
  meetDetailList.map((item) => {
    if (item.meetSymbol == "main") {
      findSymbol = true;
      meetId = item.meetId;
      return;
    }
  });
  if (!findSymbol) {
    meetId = dispatchManager.accountDetail.accUsername;
  }

  return meetId;
};
export const loadMeetList = () => {
  let { memTelMapCache } = store.getState().audioHandle;
  console.log("memTelMapCache", memTelMapCache);
  window.scooper.meetManager &&
    window.scooper.meetManager.meetsObj.listMeets((data) => {
      console.log("memTelMapCache", data);

      data.list &&
        data.list.map((item) => {
          item.members = uniqueArr(item.members);
          if (item.members.length > 0) {
            item.members.map((mem) => {
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
          }
          item.meetMem = item.members || [];
          if (item.meetCreateId == "default") {
            item.meetSymbol = "main";
            item.isSetMain = 1;
          }
        });
      console.log("memTelMapCache", data.list);

      fillMeetDetailList(data.list);
    });
};
/**
 * 填充会议列表
 */
export const fillMeetDetailList = (list, curMeet) => {
  let sortList = sortMeetList(list);
  let meetList = [];
  let fillList = [];
  if (sortList.length < 4) {
    // 不足4个时 填充会议列表
    for (var i = sortList.length; i < 4; i++) {
      fillList.push({ meetId: "none-" + i, members: [], meetMem: [] });
    }
    store.dispatch(setMeetDetailList([...sortList, ...fillList]));
    meetList = [...sortList, ...fillList];
  } else {
    store.dispatch(setMeetDetailList([...sortList]));
    meetList = [...sortList];
  }
  if (curMeet) {
    store.dispatch(setCurMeet(curMeet));
    setMain(sortList, curMeet);
  }
};
export const setMain = (list, curMeet) => {
  list.map((li) => {
    if (
      li.meetId == curMeet.meetId &&
      li.meetSymbol != "main" &&
      li.meetAttr != "MEET_RESERVE"
    ) {
      li.isSetMain = 1;
    } else {
      li.isSetMain = 2;
    }
  });
  let id = "meet-" + curMeet.meetId;
  let curDom = document.getElementById(id);
  curDom && curDom.scrollIntoView(false);
};

/**
 * 会场列表排序  操作员的默认会场 > 其他操作员的默认会场 > 其他
 * @param {*} list
 */
export const sortMeetList = (list) => {
  let sortList = [];
  let curDefault = []; //当前操作员的默认会场
  let otherDefault = []; //其他操作员的默认会场
  let ordInstant = []; //普通立即会议
  let ordReserve = []; //普通预约会议
  let noneList = [];
  if (list && list.length > 0) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].meetCreateId == "default") {
        curDefault.push(list[i]);
      } else if (
        list[i].meetId.toString().indexOf("none-") == -1 &&
        (list[i].meetId == list[i].meetName ||
          list[i].meetCreateId == list[i].meetName)
      ) {
        otherDefault.push(list[i]);
      } else if (
        list[i].meetId.toString().indexOf("none-") == -1 &&
        list[i].meetAttr !== "MEET_RESERVE"
      ) {
        ordInstant.push(list[i]);
      } else if (
        list[i].meetId.toString().indexOf("none-") == -1 &&
        list[i].meetAttr == "MEET_RESERVE"
      ) {
        ordReserve.push(list[i]);
      } else if (list[i].meetId.toString().indexOf("none-") >= 0) {
        noneList.push(list[i]);
      }
    }
    sortList = curDefault.concat(
      otherDefault,
      ordInstant,
      ordReserve,
      noneList
    );
    return sortList;
  } else {
    return [];
  }
};
function sortBy(props) {
  return function (a, b) {
    return a[props] - b[props];
  };
}
