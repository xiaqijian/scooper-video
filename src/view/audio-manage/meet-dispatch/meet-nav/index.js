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
import { meetapis } from "../../../../api/meetapis";
import store from "../../../../store";
import moment from "moment";

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
      // addMeetVisible: false，
      meetlist: []
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
          }
          item.attendees = item.members || [];
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
            let resMeetInfoArray = res[item.id];
            if (item.id && resMeetInfoArray.length > 0) {
              if (item.id == resMeetInfoArray[0].id) {
                resMeetInfoArray.forEach((element) => {
                  //要查 当前号码在 meetList对应的meetMem里边吗？ 在：修改状态，不在push进去
                  let findMeetMember = false;
                  let mem = {
                    tel: element.tel,
                  };
                  item.attendees = item.attendees || [];
                  item.attendees &&
                    item.attendees.length > 0 &&
                    item.attendees.map((member, i) => {
                      if (member.tel == element.tel) {
                        findMeetMember = true;
                        member.status = element.status;
                        return false;
                      }
                    });
                  if (!findMeetMember) {
                    let param = {
                      id: element.id,
                      status: element.status,
                      tel: element.tel,
                      name:
                        (memTelMapCache[element.tel] &&
                          memTelMapCache[element.tel].name) ||
                        element.tel,
                      deptName:
                        (memTelMapCache[element.tel] &&
                          memTelMapCache[element.tel].deptName) ||
                        "",
                    };
                    item.attendees.push(param);
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
  meetListClick = async (listItem) => {
    let { meetDetailList } = this.props;
    const { id } = listItem;
    let res = await meetapis.meetManagePrefix.getMeetInfo({ conferenceId: id })
    console.log(listItem);
    if (listItem.active) {
      let getMeetingDetail = await meetapis.meetManagePrefix.getMeetingDetail({ conferenceId: id })
      console.log(res, getMeetingDetail);
      let listParticipantsres = await meetapis.meetManagePrefix.listParticipants({ conferenceId: id })
      console.log(listParticipantsres);
      meetDetailList.map((item, index) => {
        if (item.id == listItem.id) {
          item.isSetMain = 1;
        } else {
          item.isSetMain = 2;
        }
      });
      listItem.isSetMain = 1;
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
      fillMeetDetailList(meetDetailList, listItem);
    } else {
      meetDetailList.map((item, index) => {
        if (item.id == listItem.id) {
          item.isSetMain = 1;
        } else {
          item.isSetMain = 2;
        }
      });
      listItem.isSetMain = 1;
      let lists = []
      // res.data.attendees.map((item) => {
      //   listParticipantsres.content.map(items => {
      //     if (item.uri === items.generalParam.uri) {
      //       lists.push({
      //         ...item,
      //         ...items,
      //       })
      //     }
      //   })
      // })
      listItem.attendees = res.data.attendees || [];
      // listItem.onlinedata = getMeetingDetail;
      // listItem.content = listParticipantsres.content;
      fillMeetDetailList(meetDetailList, listItem);
    }


  };
  setMainMeet = (listItem) => {
    let { meetDetailList } = this.props;
    meetDetailList.map((item, index) => {
      if (item.id == listItem.id) {
        item.meetSymbol = "main";
      } else {
        item.meetSymbol = "";
      }
    });
    message.success("设置主会场成功");
    fillMeetDetailList(meetDetailList, listItem);
  };
  componentWillMount() {
    this.getMeetList();
    // this.loadAllMeetList();
  }
  getMeetList = async () => {
    let res = await meetapis.meetManagePrefix.reservedMeets();
    console.log(res, '查询正在召开和待召开的会议列表');
    let meetDetailList = [...res.data.content];
    meetDetailList.map((item) => {

      item.timeBegin = moment.utc(item.scheduleStartTime).local().format('YYYY-MM-DD HH:mm:ss');

    });
    console.log(meetDetailList);
    store.dispatch(setMeetDetailList([...meetDetailList]));
    this.setState({
      meetlist: meetDetailList
    }, () => {

    })
    try {
      this.meetListClick(meetDetailList[0])

    } catch (error) {
      console.log(error);
    }
    // this.initListMeetsRecord(res.data.content);

  }
  render() {
    const { meetlist } = this.state;
    let { allMeetList, meetDetailList, curMeet, addMeetVisible, editRecord } =
      this.props;
    console.log(meetDetailList);
    return (
      <div className="meet-wrap">
        <SearchBox />
        {/* <button onClick={this.getMeetList}>好好</button> */}
        <ul>
          {meetDetailList &&
            meetDetailList.map((item, index) => {

              return (
                <li
                  key={`meet-${index}`}
                  className={`${curMeet.id == item.id ? "meet-sel" : ""
                    }`}
                  onClick={() => this.meetListClick(item)}
                >
                  <i
                    className={`${!item.active
                      ? "icon-prevMeet"
                      : "icon-meet"
                      }`}
                  ></i>
                  <span className="meet-name over-ellipsis">
                    {item.subject || item.id}
                  </span>
                  {/* <span className="meet-num">
                    {!item.active
                      ? "(预约" +
                      (item.attendees && item.attendees.length) +
                      "人)"
                      : "(" +
                      ((item.attendees && item.attendees.length) || 0) +
                      "人)"}
                  </span> */}
                  {item.meetSymbol == "main" && (
                    <span className="meet-symbol">主会场</span>
                  )}
                  {item.isSetMain == 1 &&
                    item.meetSymbol != "main" &&
                    item.conferenceTimeType != "EDIT_CONFERENCE" && (
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
