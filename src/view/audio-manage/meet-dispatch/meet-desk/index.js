/*
 * @File: 会议调度 -- 会议桌入口
 * @Author: liulian
 * @Date: 2020-06-09 15:11:50
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-09 16:49:30
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setMeetDetailList,
  setCurMeet,
} from "../../../../reducer/meet-handle-reduce";
import { fillMeetDetailList } from "../../../../util/meet-method";
import { meetapis } from "../../../../api/meetapis";
import DeskDetail from "./desk-detail";
import MeetOperate from "../meet-operate";
import BigMeet from "../big-meet";

@connect((state) => state.meetHandle, { setMeetDetailList, setCurMeet })
class MeetDesk extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowBigMeet: false,
      curSelectMeet: {}, //当前选中的会议
    };
  }
  componentDidMount() { }
  /**
   * 会议桌点击
   */
  deskItemClick = async (list) => {
    if (list.id.indexOf("none-") == -1) {
      // this.props.setCurMeet(list)
      const { id } = list;

      let res = await meetapis.meetManagePrefix.getMeetInfo({ conferenceId: id })
      if (list.active) {
        let getMeetingDetailres = await meetapis.meetManagePrefix.getMeetingDetail({ conferenceId: id })
        let listParticipantsres = await meetapis.meetManagePrefix.listParticipants({ conferenceId: id })
        console.log(res, getMeetingDetailres);
        console.log(listParticipantsres);
        let { meetDetailList } = this.props;
        meetDetailList.map((item, index) => {
          if (item.id == list.id) {
            item.isSetMain = 1;
          } else {
            item.isSetMain = 2;
          }
        });
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
        list.isSetMain = 1;
        list.onlinedata = getMeetingDetailres;
        list.content = listParticipantsres.content;
        list.attendees = lists;

        fillMeetDetailList(meetDetailList, list);
      } else {
        let { meetDetailList } = this.props;
        meetDetailList.map((item, index) => {
          if (item.id == list.id) {
            item.isSetMain = 1;
          } else {
            item.isSetMain = 2;
          }
        });
        list.isSetMain = 1;
        list.attendees = res.data.attendees;

        fillMeetDetailList(meetDetailList, list);
      }

    }
  };
  /**
   * 显示大会议桌
   */
  showBig = async (item) => {
    const { id } = item;
    if (!id) {
      return
    }
    if (item.id.toString().indexOf("none-") == -1) {
      this.setState({
        isShowBigMeet: !this.state.isShowBigMeet,
        curSelectMeet: {
          ...item,
        },
      });
    }
  };
  /**
   * 显示小会议桌
   */
  showSmall = () => {
    this.setState({
      isShowBigMeet: !this.state.isShowBigMeet,
      curSelectMeet: {},
    });
  };

  render() {
    let { meetDetailList, curMeet } = this.props;
    let { isShowBigMeet } = this.state;
    return (
      <div style={{ height: "100%" }}>
        <div className="demo-content">
          {/* <QueueAnim className="demo-content" */}
          {/* key="demo"
                    type={['right', 'left']}
                    ease={['easeOutQuart', 'easeInOutQuart']}> */}
          {!isShowBigMeet ? (
            <div className="meet-desk-wrap" key="a">
              {meetDetailList &&
                meetDetailList.map((item, index) => {
                  return (
                    <div
                      id={`meet-${item.id}`}
                      onClick={() => {
                        this.deskItemClick(item);
                      }}
                      className={`desk-wrap ${curMeet.id == item.id ? "meet-desk-sel" : ""
                        } `}
                      key={`desk-${index}`}
                    >
                      <div className="desk-title">
                        {item.meetSymbol == "main" && (
                          <span className="meet-symbol">主会场</span>
                        )}
                        <span className="desk-name">
                          {item.subject || item.id}
                        </span>
                        {item.attendees &&
                          item.attendees.length > 0 &&
                          item.conferenceTimeType != "EDIT_CONFERENCE" && (
                            <span className="desk-name">
                              ({item.attendees.length}人)
                            </span>
                          )}
                        {item.attendees &&
                          item.attendees.length > 0 &&
                          item.conferenceTimeType == "EDIT_CONFERENCE" && (
                            <span className="desk-name">
                              (预约{item.attendees.length}人)
                            </span>
                          )}
                        {((item.conferenceTimeType &&
                          item.conferenceTimeType != undefined &&
                          item.conferenceTimeType != "EDIT_CONFERENCE") ||
                          !(
                            item.meetCreateId == "default" ||
                            item.id == item.subject ||
                            item.meetCreateId == item.subject
                          )) && (
                            <span className="desk-time">{item.timeLength}</span>
                          )}
                        {item.recording && <i className="icon-ly"></i>}
                        {item.playvoice && <i className="icon-fy"></i>}
                        {item.locked && <i className="icon-sd"></i>}
                        <i
                          className="icon-img icon-zdh"
                          onClick={() => this.showBig(item)}
                        ></i>
                      </div>
                      <DeskDetail
                        curMeets={item}
                        showBigClick={() => {
                          this.showBig(item);
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          ) : (
            <BigMeet key="b" onClick={this.showSmall} curSelectMeet={curMeet} />
          )}
        </div>
        {/* </QueueAnim> */}
        <MeetOperate />
      </div>
    );
  }
}

export default MeetDesk;
