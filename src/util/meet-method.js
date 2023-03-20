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
import { meetapis } from '../api/meetapis';
import moment from "moment";

export const joinMeet = (tel) => {
  let { meetDetailList } = store.getState().meetHandle;
  let findSymbol = false;
  meetDetailList.map((item) => {
    if (item.meetSymbol == "main") {
      findSymbol = true;
      dispatchManager.dispatcher.meets.joinMember(item.id, tel);
      return;
    }
  });
  if (!findSymbol) {
    let id = dispatchManager.accountDetail.accUsername;
    dispatchManager.dispatcher.meets.joinMember(id, tel);
  }
};
/**
 * 获取主会场id
 */
export const getMainMeetId = () => {
  let { meetDetailList } = store.getState().meetHandle;
  let findSymbol = false;
  let id;
  meetDetailList.map((item) => {
    if (item.meetSymbol == "main") {
      findSymbol = true;
      id = item.id;
      return;
    }
  });
  if (!findSymbol) {
    id = dispatchManager.accountDetail.accUsername;
  }

  return id;
};
export const loadMeetList = async () => {
  // let res = await meetapis.meetManagePrefix.reservedMeets();
  // console.log('查询正在召开和待召开的会议列表', res);
  // let { memTelMapCache } = store.getState().audioHandle;
  // console.log("memTelMapCache", memTelMapCache);
  // window.scooper.meetManager &&
  //   window.scooper.meetManager.meetsObj.listMeets((data) => {
  //     console.log("memTelMapCache", data);

  //     data.list &&
  //       data.list.map((item) => {
  //         item.members = uniqueArr(item.members);
  //         if (item.members.length > 0) {
  //           item.members.map((mem) => {
  //             mem.name =
  //               (memTelMapCache[mem.tel] && memTelMapCache[mem.tel].name) ||
  //               mem.tel;
  //             mem.deptName =
  //               (memTelMapCache[mem.tel] && memTelMapCache[mem.tel].deptName) ||
  //               "";
  //             if (mem.level == "chairman") {
  //               mem.chair = true;
  //             }
  //           });
  //         }
  //         item.attendees = item.members || [];
  //         if (item.meetCreateId == "default") {
  //           item.meetSymbol = "main";
  //           item.isSetMain = 1;
  //         }
  //       });
  //     console.log("memTelMapCache", data.list);

  //     fillMeetDetailList(data.list);
  //   });
  let res = await meetapis.meetManagePrefix.reservedMeets();
  console.log(res, '查询正在召开和待召开的会议列表');
  let meetDetailList = [...res.data.content];
  meetDetailList.map((item) => {

    item.timeBegin = moment.utc(item.scheduleStartTime).local().format('YYYY-MM-DD HH:mm:ss');

  });
  console.log(meetDetailList);
  store.dispatch(setMeetDetailList([...meetDetailList]));

  // fillMeetDetailList(meetDetailList)
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
      fillList.push({ id: "none-" + i, members: [], attendees: [] });
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
      li.id == curMeet.id &&
      li.meetSymbol != "main" &&
      li.conferenceTimeType != "EDIT_CONFERENCE"
    ) {
      li.isSetMain = 1;
    } else {
      li.isSetMain = 2;
    }
  });
  let id = "meet-" + curMeet.id;
  let curDom = document.getElementById(id);
  curDom && curDom.scrollIntoView(false);
};
// chongxinhuoquxiangqing
export const getMeetDetail = async (listItem) => {
  const { id } = listItem;
  let res = await meetapis.meetManagePrefix.getMeetInfo({ conferenceId: id })
  if (listItem.active) {
    let getMeetingDetail = await meetapis.meetManagePrefix.getMeetingDetail({ conferenceId: id })
    console.log(res, getMeetingDetail);
    let listParticipantsres = await meetapis.meetManagePrefix.listParticipants({ conferenceId: id })
    console.log(listParticipantsres);
    let lists = []
    res.data.attendees.map((item) => {
      listParticipantsres.content.map(items => {
        if (item.uri === items.generalParam.uri) {
          lists.push({
            ...item,
            ...items,
          })
        }
      })
    })
    listItem.attendees = lists || [];
    listItem.onlinedata = getMeetingDetail;
    listItem.content = listParticipantsres.content;
    store.dispatch(setCurMeet(listItem));
  } else {
    listItem.attendees = res.data.attendees || [];
    store.dispatch(setCurMeet(listItem));
  }
}

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
        list[i].id.toString().indexOf("none-") == -1 &&
        (list[i].id == list[i].subject ||
          list[i].meetCreateId == list[i].subject)
      ) {
        otherDefault.push(list[i]);
      } else if (
        list[i].id.toString().indexOf("none-") == -1 &&
        list[i].conferenceTimeType !== "EDIT_CONFERENCE"
      ) {
        ordInstant.push(list[i]);
      } else if (
        list[i].id.toString().indexOf("none-") == -1 &&
        list[i].conferenceTimeType == "EDIT_CONFERENCE"
      ) {
        ordReserve.push(list[i]);
      } else if (list[i].id.toString().indexOf("none-") >= 0) {
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
