/*
 * @File: 语音调度-中间入口文件
 * @Author: liulian
 * @Date: 2020-06-10 10:32:48
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-08 19:49:30
 */
import React, { Component } from "react";
import { Divider } from "antd";
import MemberList from "./member-list";
import SingleCall from "./single-call";
import GroupDispatch from "./group-dispatch";
import MeetDesk from "../../meet-dispatch/meet-desk/index";
import { setDefaultKey } from "../../../../reducer/audio-handle-reducer";
import { connect } from "react-redux";

@connect((state) => state.audioHandle, { setDefaultKey })
class MainPart extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    let { defaultKey } = this.props;
    return (
      <div className="main-wrap">
        <MeetDesk />
      </div>
    );
  }
}

export default MainPart;
