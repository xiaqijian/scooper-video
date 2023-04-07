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
import { meetapis } from '../../../../api/meetapis'
import { getMeetDetail } from '../../../../util/meet-method'

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
    if (item && item.id && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.changeMemberToChairman(
        item.id,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 禁言
   */
  noSpeak = async (item) => {
    console.log(item);
    let res = await meetapis.meetOperatePrefix.participantsStatus({
      conferenceId: item.id,
      participantId: item.state.participantId,
      isMute: true
    })
    // if (item && item.id && (item.tel || item.memTel)) {
    //   window.scooper.meetManager.meetsObj.changeMemberLevel(
    //     item.id,
    //     item.tel || item.memTel,
    //     "audience"
    //   );
    //   this.props.hideMemDetail();
    // }
  };
  /**
   * 发言
   */
  canSpeak = async (item) => {
    let res = await meetapis.meetOperatePrefix.participantsStatus({
      conferenceId: item.id,
      participantId: item.state.participantId,
      isMute: false
    })
    getMeetDetail(item)
    // if (item && item.id && (item.tel || item.memTel)) {
    //   window.scooper.meetManager.meetsObj.changeMemberLevel(
    //     item.id,
    //     item.tel || item.memTel,
    //     "speak"
    //   );
    //   this.props.hideMemDetail();
    // }
  };
  /**
   * 单独通话
   */
  singlCall = (item) => {
    if (item && item.id && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.privateTalk(
        item.id,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 取回通话
   */
  backToMeet = (item) => {
    if (item && item.id && (item.tel || item.memTel)) {
      window.scooper.meetManager.meetsObj.backToMeet(
        item.id,
        item.tel || item.memTel
      );
      this.props.hideMemDetail();
    }
  };
  /**
   * 移除会场
   */
  removeMeet = async (item) => {
    let res = await meetapis.meetOperatePrefix.participants({
      conferenceId: item.id,
      ids: [item.state.participantId],
    })
    getMeetDetail(item)
    // if (item && item.id && (item.tel || item.memTel)) {
    //   window.scooper.meetManager.meetsObj.kickMember(
    //     item.id,
    //     item.tel || item.memTel
    //   );
    //   this.props.hideMemDetail();
    // }
  };
  /**
   * 挂断
   */
  hungUp = async (item) => {
    let res = await meetapis.meetOperatePrefix.participantsStatus({
      conferenceId: item.id,
      participantId: item.state.participantId,
      isOnline: false
    })
    getMeetDetail(item)
    // if (item && (item.tel || item.memTel)) {
    //   window.scooper.dispatchManager.dispatcher.calls.hungUp(
    //     item.tel || item.memTel
    //   );
    //   this.props.hideMemDetail();
    // }
  };
  /**
   * 重新呼叫
   */
  reJoinMeet = async (item, meet) => {
    let res = await meetapis.meetOperatePrefix.participantsStatus({
      conferenceId: item.id,
      participantId: item.state.participantId,
      isOnline: false
    })
    getMeetDetail(item)
    // let id = meet.id;
    // let tel = mem && (mem.tel || mem.memTel);
    // if (tel && id) {
    //   window.scooper.meetManager.meetsObj.joinMember(id, tel);
    // }
    // this.props.hideMemDetail();
  };

  componentWillMount() { }

  componentDidMount() { }

  render() {
    let { curMeetMem, curMeet } = this.props;
    return (
      <div
        className={`memDetail-wrap ${curMeetMem.status == "fail" ? "memDetail-fail" : ""
          }`}
      >
        <div className="curMeetMem-info">
          <span
            className="mem-info-name over-ellipsis"
            title={curMeetMem.name}
          >
            {curMeetMem.name}
          </span>
          <i className="icon-close" onClick={this.props.hideMemDetail}></i>
          <span className="mem-info-dept">{curMeetMem.deptName || ""}</span>
        </div>
        {!curMeetMem.state.online ? (
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
            {/* {(curMeetMem.chair == true || curMeetMem.level == "chairman") && (
              <li>这是主持人</li>
            )} */}
            {/* {!(curMeetMem.chair || curMeetMem.level == "chairman") && (
              <li
                onClick={() => {
                  this.setChairMember(curMeetMem);
                }}
              >
                设为主持人
              </li>
            )} */}
            {(!curMeetMem.state.mute) && (
              <li
                onClick={() => {
                  this.canSpeak(curMeetMem);
                }}
              >
                发言
              </li>
            )}
            {curMeetMem.state.mute && (
              <li
                onClick={() => {
                  this.noSpeak(curMeetMem);
                }}
              >
                禁言
              </li>
            )}
            {/* {curMeetMem.level != "private" && (
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
            )} */}
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
