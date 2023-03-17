/*
 * @File: 语音调度
 * @Author: liulian
 * @Date: 2020-06-09 15:11:05
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-08 19:49:39
 */
import React, { Component } from "react";
import LeftCore from "./leftPart/index";
import MainPart from "./mainPart/index";
import RightPart from "./rightPart/index";
import { Spin } from "antd";
import {
  setLoading,
  setMemMapCache,
  setShandVisible,
} from "../../../reducer/audio-handle-reducer";
import { connect } from "react-redux";
import VideoPart from "./rightPart/video-part";
import ShandModal from "./shand-modal";
import { withRouter } from "react-router-dom";
// import videoManager from "../../../util/video-manager";
import VideoManager from "../../../util/video-manager";
// import dispatchManager from "../../../util/dispatch-manager";

@connect((state) => state.audioHandle, {
  setLoading,
  setMemMapCache,
  setShandVisible,
})
@withRouter
class AudioDispatch extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}
  /**
   * 隐藏弹框
   */
  hidePop = () => {
    this.props.setShandVisible(false);
  };
  render() {
    let { loading, shandVisible, configData } = this.props;

    return (
      <div style={{ height: "100%" }}>
        <Spin size="large" tip="加载中" spinning={false}>
          <div
            className={`audio-wrap ${
              window.top.style == "iframe" ? "" : "audio-not-iframe"
            } ${
              window.frames.length != window.parent.frames.length &&
              configData &&
              configData.set["disp.set.module.loadTogether"] == 1
                ? "none-head"
                : ""
            }`}
          >
            <LeftCore />
            <MainPart />
            {/* <VideoPart /> */}
            {shandVisible && (
              <ShandModal visible={shandVisible} hidePop={this.hidePop} />
            )}
            <VideoManager />
          </div>
        </Spin>
      </div>
    );
  }
}

export default AudioDispatch;
