/*
 * @File: 会议人员操作
 * @Author: liulian
 * @Date: 2020-09-16 11:33:39
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-13 15:07:34
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { setMeetDetailList } from "../../../../reducer/meet-handle-reduce";

@connect((state) => state.meetHandle, { setMeetDetailList })
class MeetOper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMemDetai: false,
      curMeetMem: {},
    };
  }
  /**
   * 设置主持人
   */
  setChairMember = (item) => {
    if (item && item.meetId && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.changeMemberToChairman(
        item.meetId,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 禁言
   */
  noSpeak = (item) => {
    if (item && item.meetId && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.changeMemberLevel(
        item.meetId,
        item.tel || item.memTel,
        "audience"
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 发言
   */
  canSpeak = (item) => {
    if (item && item.meetId && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.changeMemberLevel(
        item.meetId,
        item.tel || item.memTel,
        "speak"
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 单独通话
   */
  singlCall = (item) => {
    if (item && item.meetId && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.privateTalk(
        item.meetId,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 取回通话
   */
  backToMeet = (item) => {
    if (item && item.meetId && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.backToMeet(
        item.meetId,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 移除会场
   */
  removeMeet = (item) => {
    if (item && item.meetId && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.kickMember(
        item.meetId,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 挂断
   */
  hungUp = (item) => {
    if (item && (item.tel || item.memTel)) {
      window.scooper.dispatchManager.dispatcher.calls.hungUp(
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 重新呼叫
   */
  reJoinMeet = (mem, meet) => {
    let meetId = meet.meetId;
    let tel = mem && (mem.tel || mem.memTel);
    if (tel && meetId) {
      window.scooper.meetManager.meetsObj.joinMember(meetId, tel);
    }
    this.props.hideMemDetail();
  };

  componentWillMount() {}

  componentDidMount() {}

  render() {
    let { curMeetMem, curMeet } = this.props;
    return (
      <div
        className={`memDetail-wrap ${
          curMeetMem.status == "fail" ? "memDetail-fail" : ""
        }`}
      >
        <div className="curMeetMem-info">
          <span
            className="mem-info-name over-ellipsis"
            title={curMeetMem.memName}
          >
            {curMeetMem.memName}
          </span>
          <i className="icon-close" onClick={this.props.hideMemDetail}></i>
          <span className="mem-info-dept">{curMeetMem.deptName || ""}</span>
        </div>
        {curMeetMem.status == "reject" ||
        curMeetMem.status == "quit" ||
        curMeetMem.status == "unresponse" ? (
          <ul className="meet-oper">
            <li
              onClick={() => {
                this.reJoinMeet(curMeetMem, curMeet);
              }}
            >
              重新呼叫
            </li>
          </ul>
        ) : (
          <ul className="meet-oper">
            {(curMeetMem.chair == true || curMeetMem.level == "chairman") && (
              <li>这是主持人</li>
            )}
            {!(curMeetMem.chair || curMeetMem.level == "chairman") && (
              <li
                onClick={() => {
                  this.setChairMember(curMeetMem);
                }}
              >
                设为主持人
              </li>
            )}
            {(curMeetMem.level == "audience" ||
              curMeetMem.level == "handup") && (
              <li
                onClick={() => {
                  this.canSpeak(curMeetMem);
                }}
              >
                发言
              </li>
            )}
            {curMeetMem.level != "audience" && curMeetMem.level != "handup" && (
              <li
                onClick={() => {
                  this.noSpeak(curMeetMem);
                }}
              >
                禁言
              </li>
            )}
            {curMeetMem.level != "private" && (
              <li
                onClick={() => {
                  this.singlCall(curMeetMem);
                }}
              >
                单独通话
              </li>
            )}
            {curMeetMem.level == "private" && (
              <li
                onClick={() => {
                  this.backToMeet(curMeetMem);
                }}
              >
                取回通话
              </li>
            )}
            <li
              onClick={() => {
                this.removeMeet(curMeetMem);
              }}
            >
              移出会场
            </li>
            <li
              className="meet-hung"
              onClick={() => {
                this.hungUp(curMeetMem);
              }}
            >
              挂断
            </li>
          </ul>
        )}
      </div>
    );
  }
}

export default MeetOper;
