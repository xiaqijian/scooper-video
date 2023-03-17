/*
 * @File: 软手柄显示框
 * @Author: liulian
 * @Date: 2020-10-16 17:35:24
 * @version: V0.0.0.1
 * @LastEditTime: 2020-10-16 19:39:08
 */
import React, { Component } from "react";
import { connect } from 'react-redux';
import { Modal, Button, } from 'antd';
import { setShandVisible, setShandInfo, setMemTelMapCache } from '../../../reducer/audio-handle-reducer'


@connect(
    state => state.audioHandle,
    { setShandVisible, setShandVisible, setMemTelMapCache }
)
class ShandModal extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {

    }
    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.hungUp();
    }
    /**
     * 挂断 
     */
    hungUp = () => {
        window.scooper.dispatchManager.dispatcher.calls.shandleHungUp();
        this.props.hidePop();
    }
    /**
     * 接听
     */
    answer = () => {
        window.scooper.dispatchManager.dispatcher.calls.shandleAnswer();
        this.props.hidePop();
    }

    render() {
        let { shandInfo, visible } = this.props;
        return (
            <Modal
                className="audio-modal shand-modal"
                width="50%"
                maskClosable={false}
                maskStyle={{ backgroundColor: 'rgba(0,0,0,.1)' }}
                visible={visible}
                footer={null}
                onCancel={this.handleCancel}
            >
                <div>
                    {shandInfo.type == 'audio' ?
                        <div className='call-audio-wrap'>
                            <i className='icon-callaudio'></i>
                            <span className="audio-name over-ellipsis">{shandInfo.name}</span>
                            <span className="audio-dept over-ellipsis">{shandInfo.deptName}</span>
                            <p>邀请您进行语音通话...</p>
                        </div>
                        :
                        <div className='call-video-wrap'>
                            <i className='icon-callvideo'></i>
                            <span className="video-name over-ellipsis">{shandInfo.name}</span>
                            <span className="video-dept over-ellipsis">{shandInfo.deptName}</span>
                            <p className="video-p">邀请您进行视频通话...</p>
                        </div>
                    }
                    <div className='call-btns'>
                        <Button className="btns icon-hungup" onClick={() => { this.hungUp(shandInfo) }}></Button>
                        <Button className="btns icon-answer" onClick={() => { this.answer(shandInfo) }}></Button>
                    </div>
                </div>

            </Modal>
        );
    }
}

export default ShandModal;