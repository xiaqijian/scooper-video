/*
 * @File: 暂离弹框
 * @Author: liulian
 * @Date: 2020-08-31 19:13:10
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-07 10:56:33
 */

import React, { Component } from "react";
import { Modal, Form, Input, message, Button } from "antd";
import { connect } from "react-redux";
import {
  setIsShowTempLeave,
  setIsShowGoBack,
} from "../reducer/callIn-handle-reduce";

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@connect((state) => state.callInHandle, { setIsShowTempLeave, setIsShowGoBack })
class TempLeaveModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transferModal: false,
    };
  }

  /**
   * 关闭弹框
   */
  handleCancel = () => {
    this.props.hidePop("isShowTempLeave");
  };

  handleSubmit = () => {
    let _this = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let tels = "";
        if (values.dutyTelA || values.dutyTelB || values.dutyTelC) {
          if (values.dutyTelA) {
            tels = tels + values.dutyTelA + "|";
          }
          if (values.dutyTelB) {
            tels = tels + values.dutyTelB + "|";
          }
          if (values.dutyTelC) {
            tels = tels + values.dutyTelC;
          }
          if (tels.substring(tels.length - 1, tels.length) == "|") {
            tels = tels.substring(0, tels.length - 1);
          }
          let type = "client_state";
          let value = "state=allout;tels=" + tels;
          window.scooper.dispatchManager.getCalls().sendChangeCfg(type, value);
          _this.handleCancel();
        } else {
          message.error("请至少填写一个值班号码");
          return;
        }
      }
    });
  };

  componentDidMount() {}

  render() {
    let { visible } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title=""
        className="temp-leave-modal"
        maskClosable={false}
        visible={visible}
        width="718px"
        height="504px"
        footer={null}
        onCancel={this.handleCancel}
      >
        <div className="leave-wrap">
          <p className="leave-title">值班号码设置</p>
          <Form {...layout}>
            <Form.Item label="值班号码1">
              {getFieldDecorator("dutyTelA", { initialValue: "" })(
                <Input
                  placeholder="请输入值班号码1"
                  allowClear
                  style={{ width: "300px" }}
                />
              )}
            </Form.Item>
            <Form.Item label="值班号码2">
              {getFieldDecorator("dutyTelB", { initialValue: "" })(
                <Input
                  placeholder="请输入值班号码2"
                  allowClear
                  style={{ width: "300px" }}
                />
              )}
            </Form.Item>
            <Form.Item label="值班号码3">
              {getFieldDecorator("dutyTelC", { initialValue: "" })(
                <Input
                  placeholder="请输入值班号码3"
                  allowClear
                  style={{ width: "300px" }}
                />
              )}
            </Form.Item>
            <Form.Item className="btn-wrap">
              <Button className="modal-cancel" onClick={this.handleCancel}>
                取消
              </Button>
              <Button className="modal-ok" onClick={this.handleSubmit}>
                确认
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
}

export default Form.create()(TempLeaveModal);
