/*
 * @File: 会议调度 - 左侧列表
 * @Author: liulian
 * @Date: 2020-06-09 15:11:50
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-10 16:24:06
 */
import React, { Component } from "react";
import SearchBox from "./search-box";
import { connect } from "react-redux";
import { setMemTelMapCache } from "../../../../reducer/audio-handle-reducer";
import {
  setAllMeetList,
  setMeetDetailList,
  setCurMeet,
  setAddMeetVisible,
  setEditRecord,
} from "../../../../reducer/meet-handle-reduce";
import { uniqueArr } from "../../../../util/method";
import { Button, message } from "antd";
import AddMeetModal from "./add-meet-modal";
import meetManager from "../../../../util/meet-manager";
import { fillMeetDetailList } from "../../../../util/meet-method";

@connect((state) => state.audioHandle, {
  setMemTelMapCache,
})
@connect((state) => state.meetHandle, {
  setAllMeetList,
  setMeetDetailList,
  setCurMeet,
  setAddMeetVisible,
  setEditRecord,
})
class MeetNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // addMeetVisible: false
    };
  }

  loadAllMeetList = () => {
    let { memTelMapCache } = this.props;
    let _this = this;
    meetManager.meetsObj.listMeets((data) => {
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
      fillMeetDetailList(data.list);
      _this.initListMeetsRecord(data.list);
    });
  };
  /**
   * 初始化获取会议记录 -- 用于填充初始状态下 会议桌中成员的状态
   * @param {*} meetDetailList 会议列表
   */
  initListMeetsRecord = (meetDetailList) => {
    let { memTelMapCache } = this.props;
    meetManager.meetsObj.listMeetsRecord((data) => {
      if (data.code == 0) {
        let res = data.data;
        meetDetailList.length > 0 &&
          meetDetailList.map((item) => {
            let resMeetInfoArray = res[item.meetId];
            if (item.meetId && resMeetInfoArray.length > 0) {
              if (item.meetId == resMeetInfoArray[0].meetId) {
                resMeetInfoArray.forEach((element) => {
                  //要查 当前号码在 meetList对应的meetMem里边吗？ 在：修改状态，不在push进去
                  let findMeetMember = false;
                  let mem = {
                    tel: element.tel,
                  };
                  item.meetMem = item.meetMem || [];
                  item.meetMem &&
                    item.meetMem.length > 0 &&
                    item.meetMem.map((member, i) => {
                      if (member.tel == element.tel) {
                        findMeetMember = true;
                        member.status = element.status;
                        return false;
                      }
                    });
                  if (!findMeetMember) {
                    let param = {
                      meetId: element.meetId,
                      status: element.status,
                      tel: element.tel,
                      memName:
                        (memTelMapCache[element.tel] &&
                          memTelMapCache[element.tel].memName) ||
                        element.tel,
                      deptName:
                        (memTelMapCache[element.tel] &&
                          memTelMapCache[element.tel].deptName) ||
                        "",
                    };
                    item.meetMem.push(param);
                  }
                });
              }
            }
          });
        fillMeetDetailList([...meetDetailList]);
      }
    });
  };

  /**
   * 新建会议
   */
  addMeet = () => {
    this.props.setAddMeetVisible(true);
  };
  /**
   * 隐藏弹框
   */
  hidePop = (tag) => {
    if (tag == "addMeetVisible") {
      this.props.setAddMeetVisible(false);
    }
  };
  /**
   * 会议列表点击
   */
  meetListClick = (listItem) => {
    let { meetDetailList } = this.props;
    meetDetailList.map((item, index) => {
      if (item.meetId == listItem.meetId) {
        item.isSetMain = 1;
      } else {
        item.isSetMain = 2;
      }
    });
    listItem.isSetMain = 1;
    fillMeetDetailList(meetDetailList, listItem);
  };
  setMainMeet = (listItem) => {
    let { meetDetailList } = this.props;
    meetDetailList.map((item, index) => {
      if (item.meetId == listItem.meetId) {
        item.meetSymbol = "main";
      } else {
        item.meetSymbol = "";
      }
    });
    message.success("设置主会场成功");
    fillMeetDetailList(meetDetailList, listItem);
  };
  componentWillMount() {
    // this.loadAllMeetList();
  }

  render() {
    let { allMeetList, meetDetailList, curMeet, addMeetVisible, editRecord } =
      this.props;
    const meetDetailList1 = [
      {
        meetId: "11",
        meetAttr: 11,
        meetName: 11,
        meetMem: [],
        meetSymbol: "main",
        isSetMain: 1,
      },
    ];
    return (
      <div className="meet-wrap">
        <SearchBox />
        <ul>
          {meetDetailList &&
            meetDetailList.map((item, index) => {
              if (item.meetId.indexOf("none") < 0) {
                return (
                  <li
                    key={`meet-${index}`}
                    className={`${
                      curMeet.meetId == item.meetId ? "meet-sel" : ""
                    }`}
                    onClick={() => this.meetListClick(item)}
                  >
                    <i
                      className={`${
                        item.meetAttr == "MEET_RESERVE"
                          ? "icon-prevMeet"
                          : "icon-meet"
                      }`}
                    ></i>
                    <span className="meet-name over-ellipsis">
                      {item.meetName || item.meetId}
                    </span>
                    <span className="meet-num">
                      {item.meetAttr == "MEET_RESERVE"
                        ? "(预约" +
                          (item.meetMem && item.meetMem.length) +
                          "人)"
                        : "(" +
                          ((item.meetMem && item.meetMem.length) || 0) +
                          "人)"}
                    </span>
                    {item.meetSymbol == "main" && (
                      <span className="meet-symbol">主会场</span>
                    )}
                    {item.isSetMain == 1 &&
                      item.meetSymbol != "main" &&
                      item.meetAttr != "MEET_RESERVE" && (
                        <span
                          className="main-meet"
                          title="设置主会场"
                          onClick={() => this.setMainMeet(item)}
                        >
                          <i className="icon-mainMeet"></i>
                          <span className="main-meet-span">主会场</span>
                        </span>
                      )}
                  </li>
                );
              }
            })}
        </ul>
        <Button
          className="add-meet"
          ghost
          onClick={() => {
            this.addMeet();
          }}
        >
          <i className="icon-addMeet"></i>新建会议
        </Button>
        {addMeetVisible && (
          <AddMeetModal
            visible={addMeetVisible}
            hidePop={this.hidePop}
            data={editRecord}
          />
        )}
      </div>
    );
  }
}

export default MeetNav;
