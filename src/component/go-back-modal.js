/*
 * @File: 暂离弹框
 * @Author: liulian
 * @Date: 2020-08-31 19:13:10
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-07 10:56:14
 */

import React, { Component } from "react";
import { Modal, Form, Input, message, Button } from "antd";
import { connect } from "react-redux";
import {
  setIsShowTempLeave,
  setIsShowGoBack,
  setDutyTelArray,
} from "../reducer/callIn-handle-reduce";

@connect((state) => state.callInHandle, {
  setIsShowTempLeave,
  setIsShowGoBack,
  setDutyTelArray,
})
class GoBackModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dutyNumA: 11360921522,
      dutyNumB: 13609219504,
      dutyNumC: 13258749632,
    };
  }

  /**
   * 关闭弹框
   */
  handleCancel = () => {
    this.props.hidePop("isShowGoBack");
  };
  /**
   * 回到岗位
   */
  goBack = () => {
    let type = "client_state";
    let value = "state=allin";
    this.props.setIsShowGoBack(false);
    window.scooper.dispatchManager.getCalls().sendChangeCfg(type, value);
  };

  componentDidMount() {}

  render() {
    let { visible, dutyTelArray } = this.props;
    return (
      <Modal
        title=""
        className="temp-goback-modal"
        maskClosable={false}
        visible={visible}
        width="718px"
        height="504px"
        footer={null}
        onCancel={this.handleCancel}
      >
        <div className="goback-wrap">
          <div className="back-head">
            <div className="leave-info">
              <i className="icon-leaving"></i>
              <span>暂时离开</span>
            </div>
            <p>您可拨打以下电话进行联系</p>
          </div>
          <div className="duty-wrap">
            <p>值班号码1: {dutyTelArray[0]}</p>
            <p>值班号码2: {dutyTelArray[1] || ""}</p>
            <p>值班号码3: {dutyTelArray[2] || ""}</p>
          </div>
          <Button className="btn-goBack" onClick={this.goBack}>
            回到岗位
          </Button>
        </div>
      </Modal>
    );
  }
}

export default GoBackModal;
