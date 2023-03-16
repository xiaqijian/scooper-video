/*
 * @File: 会议操作按钮
 * @Author: liulian
 * @Date: 2020-08-25 16:22:32
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-10 10:50:31
 */

import React, {
  Component
} from "react";
import {
  connect
} from "react-redux";
import {
  setCurMeet,
  setMeetDetailList,
} from "../../../reducer/meet-handle-reduce";
import {
  Button,
  message,
  Modal
} from "antd";
import {
  getTelStatus
} from "../../../util/method";
import {
  meetapis
} from "../../../api/meetapis";

const {
  confirm
} = Modal;

@connect((state) => state.meetHandle, {
  setCurMeet,
  setMeetDetailList
})
class MeetOperate extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  /**
   * 销毁会议弹框确认
   */
  showDestoryConfirm = (meetId) => {
    let _this = this;
    confirm({
      title: "是否撤销会议",
      content: "",
      onOk() {
        _this.destoryMeet(meetId);
      },
      onCancel() {},
    });
  };
  /**
   * 销毁会议
   */
  destoryMeet = async (conferenceId) => {
    await meetapis.meetManagePrefix.deleteMeet({
      conferenceId
    })
    // message.success("撤销成功");
  };
  /**
   * 结束会议
   */
  endMeetHandle = async (conferenceId) => {
    await meetapis.meetManagePrefix.endMeet({
      conferenceId
    })
  }
  showEndMeetConfirm = (meetId) => {
    let _this = this;
    console.log(meetId);
    confirm({
      title: "是否结束会议",
      content: "",
      onOk() {
        _this.endMeetHandle(meetId)
        message.success("会议已结束");
      },
    });
  };
  /**
   * 全体禁言
   */
  allNoSpeak = (curMeet) => {
    let meetId = curMeet.meetId;
    curMeet.meetMem.map((item) => {
      if (
        (item.tel || item.memTel) &&
        getTelStatus(item.tel || item.memTel) == "callst_meet"
      ) {
        let memMeetId = item.meetId || meetId;
        window.scooper.meetManager.meetsObj.changeMemberLevel(
          memMeetId,
          item.tel || item.memTel,
          "audience"
        );
      }
    });
  };
  /**
   * 全体发言
   */
  allSpeak = (curMeet) => {
    let meetId = curMeet.meetId;
    curMeet.meetMem.map((item) => {
      if (
        (item.tel || item.memTel) &&
        getTelStatus(item.tel || item.memTel) == "callst_meet"
      ) {
        let memMeetId = item.meetId || meetId;
        window.scooper.meetManager.meetsObj.changeMemberLevel(
          memMeetId,
          item.tel || item.memTel,
          "speak"
        );
      }
    });
  };
  /**
   * 停止录音
   */
  stopRecord = (curMeet) => {
    let meetId = curMeet.meetId;
    window.scooper.meetManager.meetsObj.stopRecord(meetId);
  };
  /**
   * 开始录音
   */
  startRecord = (curMeet) => {
    let meetId = curMeet.meetId;
    window.scooper.meetManager.meetsObj.startRecord(meetId);
  };
  /**
   * 会议解锁
   */
  lock = (curMeet) => {
    let meetId = curMeet.meetId;
    window.scooper.meetManager.meetsObj.lock(meetId);
  };
  /**
   * 会议锁定
   */
  unLock = (curMeet) => {
    let meetId = curMeet.meetId;
    window.scooper.meetManager.meetsObj.unlock(meetId);
  };
  /**
   * 取消放音
   */
  cancelPlayVoice = (curMeet) => {
    let meetId = curMeet.meetId;
    window.scooper.meetManager.meetsObj.stopPlayVoice(meetId);
  };
  /**
   * 会议放音
   */
  playVoice = (curMeet) => {
    let meetId = curMeet.meetId;
    window.scooper.meetManager.meetsObj.startPlayVoice(meetId);
  };

  render() {
    let {
      curMeet
    } = this.props;
    let meetStatus =
      window.scooper.dispatchManager &&
      window.scooper.dispatchManager.accountDetail ?
      window.scooper.dispatchManager.accountDetail.meetRecord :
      "";
    return ( <
      div className = "meet-operate" >
      <
      Button className = "meet-jy"
      onClick = {
        () => {
          this.allNoSpeak(curMeet);
        }
      } >
      <
      i className = "icon-jy" > < /i>全体禁言 < /
      Button > <
      Button className = "meet-fy"
      onClick = {
        () => {
          this.allSpeak(curMeet);
        }
      } >
      <
      i className = "icon-fy" > < /i>全体发言 < /
      Button > {
        meetStatus == 1 ? ( //会场录音大开关开启  ---> 自动录制
          <
          Button className = "meet-tzly" >
          <
          i className = "icon-ly" > < /i>正在录音 < /
          Button >
        ) : //会场录音大开关关闭  ---> 手动录制
          curMeet && JSON.stringify(curMeet) !== "{}" && curMeet.recording ? ( <
            Button className = "meet-tzly"
            onClick = {
              () => {
                this.stopRecord(curMeet);
              }
            } >
            <
            i className = "icon-ly" > < /i>停止录音 < /
            Button >
          ) : ( <
            Button className = "meet-ly"
            onClick = {
              () => {
                this.startRecord(curMeet);
              }
            } >
            <
            i className = "icon-ly" > < /i>会场录音 < /
            Button >
          )
      }

      {
        /* {curMeet && JSON.stringify(curMeet) !== '{}' && curMeet.recording ?
                        <Button className='meet-tzly' onClick={()=>{this.stopRecord(curMeet)}} ><i className='icon-ly'></i>停止录音</Button>
                        :
                        <Button className='meet-ly' onClick={()=>{this.startRecord(curMeet)}}><i className='icon-ly'></i>会场录音</Button>
                       } */
      } {
        curMeet && JSON.stringify(curMeet) !== "{}" && curMeet.locked ? ( <
          Button className = "meet-js"
          onClick = {
            () => {
              this.unLock(curMeet);
            }
          } >
          <
          i className = "icon-js" > < /i>会议解锁 < /
          Button >
        ) : ( <
          Button className = "meet-sd"
          onClick = {
            () => {
              this.lock(curMeet);
            }
          } >
          <
          i className = "icon-sd" > < /i>会议锁定 < /
          Button >
        )
      } {
        curMeet && JSON.stringify(curMeet) !== "{}" && curMeet.playvoice ? ( <
          Button className = "meet-qxfy"
          onClick = {
            () => {
              this.cancelPlayVoice(curMeet);
            }
          } >
          <
          i className = "icon-fangy" > < /i>取消放音 < /
          Button >
        ) : ( <
          Button className = "meet-fangy"
          onClick = {
            () => {
              this.playVoice(curMeet);
            }
          } >
          <
          i className = "icon-fangy" > < /i>会议放音 < /
          Button >
        )
      }

      {
        curMeet &&
          JSON.stringify(curMeet) !== "{}" &&
          (curMeet.meetAttr == "MEET_RESERVE" ||
            (curMeet.meetMem &&
              curMeet.meetMem.length == 0 &&
              !(
                curMeet.meetId == curMeet.meetName ||
                curMeet.meetCreateId == curMeet.meetName
              ) &&
              !(curMeet.meetCreateId == "default"))) ? ( <
            Button className = "meet-destory"
            onClick = {
              () => this.showDestoryConfirm(curMeet.meetId)
            } >
            <
            i className = "icon-destory" > < /i>销毁会议 < /
            Button >
          ) : ( <
            Button className = "meet-end"
            onClick = {
              () => {
                this.showEndMeetConfirm(curMeet.meetId);
              }
            } >
            <
            i className = "icon-meetEnd" > < /i>结束会议 < /
            Button >
          )
      } <
      /div>
    );
  }
}

export default MeetOperate;