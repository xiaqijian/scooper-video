/*
 * @File: 会议桌（小）
 * @Author: liulian
 * @Date: 2020-08-25 16:22:32
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-13 15:31:45
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setMeetDetailList,
  setCurMeet,
  setAllMeetOpLogs,
  setEditRecord,
  setAddMeetVisible,
} from "../../../../reducer/meet-handle-reduce";
import { addMeetMemTitle } from "../../../../config/constants";
import { Button, message } from "antd";
import MeetOper from "./meet-oper";
import MeetDetail from "./meet-detail-modal";
import AddMember from "../../../../component/add-member";
import meetManager from "../../../../util/meet-manager";
import { getMeetDetail } from "../../../../util/meet-method";
import { meetapis } from "../../../../api/meetapis";

@connect((state) => state.meetHandle, {
  setMeetDetailList,
  setCurMeet,
  setAllMeetOpLogs,
  setEditRecord,
  setAddMeetVisible,
})
class DeskDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMemDetai: false,
      curMeetMem: {},
      memModalVisible: false, //人员选择器弹框
      meetDetailVisible: false, //会议详情弹框
    };
  }

  //生成空位置函数
  restSpan() {
    let doms = [];
    let { curMeets } = this.props;
    if (curMeets.id.toString().indexOf("none-") >= 0) {
      // 空(仅仅是为了填充)
      for (let i = 0; i < 12; i++) {
        doms.push(
          <span
            key={`empty_seat-${i}`}
            className={`meet-list meet-list-none `}
          ></span>
        );
      }
    } else {
      if (curMeets.attendees && curMeets.attendees.length == 0) {
        for (let i = 0; i < 12; i++) {
          doms.push(
            <span
              key={`empty_seat-${i}`}
              onClick={() => {
                this.addMeetMem(i);
              }}
              className={`meet-list meet-list-none ${i == 11 ? "meet-list-add" : ""
                }`}
            ></span>
          );
        }
      } else if (curMeets.attendees && curMeets.attendees.length > 0) {
        for (let i = 0; i < 12 - curMeets.attendees.length; i++) {
          doms.push(
            <span
              key={`empty_seat-${i}`}
              onClick={() => {
                this.addMeetMem(i);
              }}
              className={`meet-list meet-list-none ${i == 12 - curMeets.attendees.length - 1 &&
                curMeets.attendees.length > 0
                ? "meet-list-add"
                : ""
                }`}
            ></span>
          );
        }
      } else {
        for (let i = 0; i < 12; i++) {
          doms.push(
            <span
              key={`empty_seat-${i}`}
              onClick={() => {
                this.addMeetMem(i);
              }}
              className={`meet-list meet-list-none ${i == 11 ? "meet-list-add" : ""
                }`}
            ></span>
          );
        }
      }
    }
    return doms;
  }
  /**
   * 人员详情
   */
  showMemDetail = (item) => {
    this.setState({
      isShowMemDetai: true,
      curMeetMem: item,
    });
  };
  hideMemDetail = () => {
    this.setState({
      isShowMemDetai: false,
      curMeetMem: {},
    });
  };

  /**
   * 向会议中添加人员
   */
  addMeetMem = (index) => {
    // this.setState({
    //     memModalVisible: true
    // })
    if (index + 1) {
      // 有空的
      if (index == 12 - this.props.curMeets.attendees.length - 1) {
        this.setState({
          memModalVisible: true,
        });
      } else {
        return;
      }
    } else {
      this.setState({
        memModalVisible: true,
      });
    }
  };
  /**
   * 获取人员选择器 人员  返回的人员数据
   */
  getMemData = async (memData) => {
    let { curMeets } = this.props;
    let id = curMeets.id;
    let joinMembersArray = [];
    memData.map((item) => {
      joinMembersArray.push(item.memTel);
    });
    let attendeeslist = memData.concat(curMeets.attendees)
    let attendees = memData.map((item) => {
      return {
        account: item.memTel,
        uri: item.memTel,
        name: item.memName,
        organizationName: item.deptName
      }
    })
    console.log(memData);
    if (memData.length > 0 && curMeets.conferenceTimeType != "EDIT_CONFERENCE") {
      let res = await meetapis.meetOperatePrefix.joinAttendees({
        conferenceId: id,
        attendees,
      })
      console.log(res);
    }
    if (memData.length > 0 && curMeets.conferenceTimeType == "EDIT_CONFERENCE") {

      let addattendees = attendeeslist.map((item) => {
        return {
          account: item.memTel || item.account,
          name: item.memName || item.name,
          organizationName: item.deptName || item.organizationName
        }
      })
      const hash = {};
      // 去重
      const newArray = addattendees.reduce((item, next) => {
        hash[next.account] ? '' : hash[next.account] = true && item.push(next);
        return item;
      }, [])
      let params = {
        conference: {
          conferenceId: id,
          conferenceTimeType: curMeets.conferenceTimeType,
          subject: curMeets.subject,
          guestPassword: curMeets.guestPassword,
          chairmanPassword: curMeets.chairmanPassword,
          scheduleStartTime: curMeets.scheduleStartTime,
          // timeEnd: timeEnd,
          duration: curMeets.duration,
        },
        attendees: newArray
      }
      this.editMeetBypre(params, attendees, (res) => {
        if (res.code != 0 || res.data.result == "fail") {
          if (res.message) message.error(res.message);
        } else {
          message.success("添加成功");
        }
      });
    }
    this.setState({
      memModalVisible: false,
    });
    getMeetDetail(curMeets)
  };
  /**
   * 编辑预约会议
   */
  editMeetBypre = async (params, attendees, resultCallback) => {
    let res = await meetapis.meetManagePrefix.updateMeet({
      ...params,

    })
    resultCallback(res)
    console.log(res);
  };
  /**
   * 显示会议详情弹框
   */
  showMeetDetail = (curMeets) => {
    this.setState({
      meetDetailVisible: true,
    });
  };
  /**
   * 隐藏弹框
   */
  hidePop = (tag) => {
    this.setState({
      [tag]: false,
    });
  };
  changeToEdit = () => {
    let { curMeets } = this.props;
    this.props.setEditRecord(curMeets);
    this.props.setAddMeetVisible(true);
  };
  /**
   * 手柄入会
   */
  operJoinMeet = (curMeet) => {
    let id = curMeet.id;
    let operTel = window.scooper.dispatchManager.accountDetail.mainTel;
    window.scooper.meetManager.meetsObj.joinMember(id, operTel);
  };
  componentDidMount() { }

  render() {
    let { curMeets, allMeetOpLogs } = this.props;
    let { meetDetailVisible } = this.state;
    let curMeetOpLogs;
    allMeetOpLogs.map((item) => {
      if (item.id == curMeets.id) {
        curMeetOpLogs = item.logs;
      }
    });
    const { isShowMemDetai, curMeetMem, memModalVisible } = this.state;
    return (
      <div className="desk-detail">
        {/* 显示入会日志 */}
        {curMeets.id.indexOf("none") < 0 &&
          curMeetOpLogs &&
          curMeetOpLogs.length > 0 && (
            <div className="meet-msg">
              <i className="icon-msg"></i>
              <span className="msg-time">{curMeetOpLogs[0].time}</span>
              <span
                title={curMeetOpLogs[0].log}
                className="msg-content over-ellipsis"
              >
                {curMeetOpLogs[0].log}
              </span>
            </div>
          )}
        {/* {curMeets.id.indexOf("none") < 0 &&
          curMeets.conferenceTimeType != "EDIT_CONFERENCE" && (
            <Button
              type="primary"
              ghost
              className="btn-joinMeet"
              onClick={() => {
                this.operJoinMeet(curMeets);
              }}
            >
              手柄入会
            </Button>
          )} */}

        <div className="desk-detail-wrap">
          <div
            className={`meet-table ${curMeets.id.indexOf("none") < 0 ? "" : "meet-all-none"
              }`}
          >
            {curMeets.conferenceTimeType != "EDIT_CONFERENCE" &&
              curMeets.id.indexOf("none") < 0 && (
                <div className="meet-info">
                  <span className="meet-info-num">
                    会议号：
                    {curMeets.accessCode ||
                      curMeets.subject ||
                      curMeets.id}
                    <i
                      className="meet-info-icon"
                      onClick={() => {
                        this.showMeetDetail(curMeets);
                      }}
                    ></i>
                  </span>
                </div>
              )}
            {curMeets.conferenceTimeType == "EDIT_CONFERENCE" &&
              curMeets.id.indexOf("none") < 0 && (
                <div className="meet-info-pre">
                  <div className="pre-wrap">
                    <span className="pre-title">预约会议</span>
                    <i
                      className="meet-info-icon"
                      onClick={() => {
                        this.showMeetDetail(curMeets);
                      }}
                    ></i>
                  </div>
                  <span className="meet-prev-time">
                    预约时间：{curMeets.timeBegin}
                  </span>
                </div>
              )}
          </div>
          <div className="meet-list-wrap">
            {curMeets.attendees &&
              curMeets.attendees.length > 0 &&
              curMeets.attendees.map((val, index) => {
                if (index > 11) {
                  return "";
                }
                if (index == 11) {
                  return (
                    <span
                      key={`attendees-add`}
                      onClick={() => {
                        this.addMeetMem("");
                      }}
                      className={`meet-list meet-list-add`}
                    ></span>
                  );
                }
                if (index == 10 && curMeets.attendees.length > 10) {
                  return (
                    <span
                      key="attendees-emph"
                      onClick={this.props.showBigClick}
                      className={`meet-list meet-list-emph`}
                    ></span>
                  );
                }
                return (
                  <span
                    key={`attendees-${index}`}
                    title={val.name}
                    className={`meet-list ${val.level == "private" ? "mem-talk" : ""
                      } ${val.chair && curMeets.conferenceTimeType != "EDIT_CONFERENCE"
                        ? "meet-chairman"
                        : ""
                      } ${val.status == "calling" ? "mem-calling" : ""}${val.level == "handup" ? "mem-hands" : ""
                      } ${val.status == "reject" || val.status == "unresponse"
                        ? "mem-reject"
                        : ""
                      } ${val.level == "audience" ? "mem-jy" : ""} ${val.status == "quit" ? "mem-quit" : ""
                      }`}
                    onClick={() => this.showMemDetail(val)}
                  >
                    <span className="mem-name-span over-ellipsis">
                      {val.name}
                    </span>
                  </span>
                );
              })}
            {this.restSpan().map((val) => {
              return val;
            })}
          </div>
          {isShowMemDetai && curMeetMem && (
            <MeetOper
              curMeetMem={curMeetMem}
              curMeet={curMeets}
              hideMemDetail={this.hideMemDetail}
            />
          )}
          {
            <AddMember
              modalVisible={memModalVisible}
              getMemData={(mems) => this.getMemData(mems)}
              title={addMeetMemTitle}
            />
          }
          {meetDetailVisible && (
            <MeetDetail
              visible={meetDetailVisible}
              data={curMeets}
              hidePop={this.hidePop}
              changeToEdit={this.changeToEdit}
            />
          )}
        </div>
      </div>
    );
  }
}

export default DeskDetail;
