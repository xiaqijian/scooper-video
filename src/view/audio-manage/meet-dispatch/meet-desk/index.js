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
  componentDidMount() {}
  /**
   * 会议桌点击
   */
  deskItemClick = (list) => {
    if (list.meetId.indexOf("none-") == -1) {
      // this.props.setCurMeet(list)
      let { meetDetailList } = this.props;
      meetDetailList.map((item, index) => {
        if (item.meetId == list.meetId) {
          item.isSetMain = 1;
        } else {
          item.isSetMain = 2;
        }
      });
      list.isSetMain = 1;
      fillMeetDetailList(meetDetailList, list);
    }
  };
  /**
   * 显示大会议桌
   */
  showBig = (item) => {
    if (item.meetId.toString().indexOf("none-") == -1) {
      this.setState({
        isShowBigMeet: !this.state.isShowBigMeet,
        curSelectMeet: item,
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
                      id={`meet-${item.meetId}`}
                      onClick={() => {
                        this.deskItemClick(item);
                      }}
                      className={`desk-wrap ${
                        curMeet.meetId == item.meetId ? "meet-desk-sel" : ""
                      } `}
                      key={`desk-${index}`}
                    >
                      <div className="desk-title">
                        {item.meetSymbol == "main" && (
                          <span className="meet-symbol">主会场</span>
                        )}
                        {item.meetId.indexOf("none") < 0 && (
                          <span className="desk-name">
                            {item.meetName || item.meetId}
                          </span>
                        )}
                        {item.meetMem &&
                          item.meetMem.length > 0 &&
                          item.meetAttr != "MEET_RESERVE" && (
                            <span className="desk-name">
                              ({item.meetMem.length}人)
                            </span>
                          )}
                        {item.meetMem &&
                          item.meetMem.length > 0 &&
                          item.meetAttr == "MEET_RESERVE" && (
                            <span className="desk-name">
                              (预约{item.meetMem.length}人)
                            </span>
                          )}
                        {((item.meetAttr &&
                          item.meetAttr != undefined &&
                          item.meetAttr != "MEET_RESERVE") ||
                          !(
                            item.meetCreateId == "default" ||
                            item.meetId == item.meetName ||
                            item.meetCreateId == item.meetName
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
