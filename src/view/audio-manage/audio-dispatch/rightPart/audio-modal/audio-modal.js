/*
 * @File: 语音调度-呼入面板
 * @Author: liulian
 * @Date: 2020-06-29 16:54:47
 * @version: V0.0.0.1
 * @LastEditTime: 2022-04-06 16:28:27
 */
import React, { Component } from "react";
import { Modal, Button, } from 'antd';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { setShowTransferModal, setAudioTag } from '../../../../../reducer/callIn-handle-reduce';
import { setTransferInfo, setIsShowSearchPanel, setIsShowPanel } from '../../../../../reducer/audio-handle-reducer'
import TransferPane from './transfer-panel'
import dispatchManager from "../../../../../util/dispatch-manager";
import { getDeptName } from "../../../../../util/method";

@connect(
    state => state.callInHandle,
    { setShowTransferModal, setAudioTag }
)
@connect(
    state => state.audioHandle,
    { setTransferInfo, setIsShowSearchPanel, setIsShowPanel }
)
class AudioModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transferModal: false
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        if (document.getElementById('transfer-input')) {
            document.getElementById('transfer-input').blur();
        }
        this.props.setTransferInfo({});
        this.props.hidePop("isShowAudioModal");
        this.props.setAudioTag(2)
        this.props.setShowTransferModal(false);
        this.props.setIsShowSearchPanel(false);
        this.props.setIsShowPanel(false);
        if (window.transferFlagTime) {
            clearInterval(window.transferFlagTime)
        }
        window.toTel = '';
    };
    /**
     * 挂断 
     */
    hungUp = data => {
        dispatchManager.dispatcher.calls.hungUp(data.tel);
        this.props.setTransferInfo({});
        this.props.hidePop("isShowAudioModal");
    }
    /**
     * 接听
     */
    answer = data => {
        dispatchManager.dispatcher.calls.answer(data.tel);
        this.props.setTransferInfo({});
        this.props.hidePop("audioVisible");
    }

    /**
     * 转接
     */
    transfer = (data) => {
        this.props.setShowTransferModal(true)
    }
    /**
     * 返回通话面板
     */
    backAudioModal = (data) => {
        this.props.setShowTransferModal(false)
    }

    componentDidMount() {

    }


    render() {
        const { visible, data, showTransferModal, isBack } = this.props;
        let { transferModal } = this.state;
        return (
            <Modal
                className="audio-modal"
                width="50%"
                maskClosable={false}
                maskStyle={{ backgroundColor: 'rgba(0,0,0,.1)' }}
                zIndex={998}
                visible={visible}
                footer={null}
                onCancel={this.handleCancel}
            >
                {
                    showTransferModal == false ?
                        <div>
                            {data.type == 'audio' ?
                                <div className='call-audio-wrap'>
                                    <i className='icon-callaudio'></i>
                                    <span className="audio-name over-ellipsis">{data.name}</span>
                                    <span className="audio-dept over-ellipsis">{getDeptName(data.deptName, data.dutyName)}</span>
                                    <p>邀请您进行语音通话...</p>
                                </div>
                                :
                                <div className='call-video-wrap'>
                                    <i className='icon-callvideo'></i>
                                    <span className="video-name over-ellipsis">{data.name}</span>
                                    <span className="video-dept over-ellipsis">{getDeptName(data.deptName, data.dutyName)}</span>
                                    <p className="video-p">邀请您进行视频通话...</p>
                                </div>
                            }
                            <div className='call-btns none-transfer'>
                                <Button className="btns icon-hungup" onClick={() => { this.hungUp(data) }}></Button>
                                <Button className="btns icon-answer" onClick={() => { this.answer(data) }}></Button>
                                {/* <Button className="btns icon-transfer" onClick={()=>this.transfer(data)}></Button> */}
                            </div>
                        </div>
                        :
                        <TransferPane data={data} backAudioModal={this.backAudioModal} isBack={isBack} handleCancels={this.handleCancel} />
                    // :<div className="tansfer-modal" onClick={()=>this.backAudioModal()}>fanhui转接面板</div>
                }

            </Modal>

        );
    }
}

export default AudioModal;