/*
 * @File: 语音调度-右侧呼入队列
 * @Author: liulian
 * @Date: 2020-06-10 10:05:40
 * @version: V0.0.0.1
 * @LastEditTime: 2022-04-06 16:28:51
 */
import React, { Component } from "react";
import { Button } from 'antd'
import { connect } from 'react-redux'
import { setShowTransferModal, setCallINList, setKeepInList, setIsShowAudioModal, setAudioTag, setCallInListTag } from '../../../../reducer/callIn-handle-reduce'
import AudioModal from './audio-modal/audio-modal';
import KeepInPane from './keepin-pane'
import timeUtil from "../../../../util/time-util";
import dispatchManager from "../../../../util/dispatch-manager";
import { getDeptName } from "../../../../util/method";


@connect(
    state => state.callInHandle,
    { setShowTransferModal, setCallINList, setKeepInList, setIsShowAudioModal, setAudioTag, setCallInListTag }
)
class CallIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audioVisible: false,
            videoVisible: false,
            modalData: {},
        }
    }

    /**   1596426188102
     * 点击呼入队列
     */
    itemClick = (item, isMost) => {
        this.props.setIsShowAudioModal(true);
        this.props.setAudioTag(0);
        if (isMost) {
            this.props.setCallInListTag("");
        }

        this.setState({
            modalData: item
        })
    }
    /**
     * 群答
     */
    answerAll = () => {
        dispatchManager.dispatcher.calls.answerAll();
    }

    /**
    * 隐藏弹框
    */
    hidePop = (tag) => {
        this.setState({
            [tag]: false
        })
        if (tag == 'isShowAudioModal') {
            this.props.setIsShowAudioModal(false);
        }
    }

    componentDidMount() {

    }
    componentWillReceiveProps(nextProps) {//componentWillReceiveProps方法中第一个参数代表即将传入的新的Props
        if ((this.props.callINList.length > 0 && nextProps.callINList.length > 0 && this.props.callINList[0].memTel !== nextProps.callINList[0].memTel) ||
            (this.props.callINList.length > 0 && nextProps.callINList.length == 0) ||
            (this.props.callINList.length == 0 && nextProps.callINList.length == 0) ||
            (this.props.callINList.length > 0 && nextProps.callINList.length > 0 && nextProps.audioTag == 2)) {
            this.hidePop('isShowAudioModal')
        }
        if (nextProps.callINList.length > 0 && nextProps.audioTag !== 2) {
            if (nextProps.callInListTag == 'add') {
                this.itemClick(nextProps.callINList[0])
            }
        }
    }

    render() {
        let { modalData, videoVisible } = this.state
        let { keepInList, showTransferModal, callINList, isShowAudioModal } = this.props;

        return (

            <div className='call-in-wrap'>
                <div className="call-header">
                    <i className="icon-callIn"></i>
                    <span className='call-in-span'>呼入队列</span>
                    <Button onClick={this.answerAll} className={`group-answer ${(callINList.length > 0) ? 'group-answer-normal' : 'group-answer-dis'} `}> 群答</Button>
                </div>
                <div className="call-list">
                    {keepInList.length > 0 && <KeepInPane keepInList={keepInList.slice(0, 3)} />}
                    <ul className={`${keepInList.length > 0 ? 'call-ul-none' : 'call-ul'}`}>
                        {
                            callINList && callINList.map((item, index) => {
                                return (
                                    <li className="call-li" key={item.tel} onClick={() => { this.itemClick(item, 'isMost') }}>
                                        <div className='call-list-item'>
                                            <span className='mem-level'>{index + 1}</span>
                                            <div className='mem-info'>
                                                <span className='mem-name over-ellipsis'>{item.name}</span>
                                                <span className='mem-duty over-ellipsis'>{getDeptName(item.deptName, item.dutyName)}</span>
                                            </div>
                                            <span className='call-time'>{item.callTime} &nbsp;&nbsp; 等待 {item.waitTime}</span>
                                            {item.type && item.type == 'audio' && <i className="icon-audio"></i>}
                                            {item.type && item.type == 'video' && <i className="icon-video"></i>}
                                        </div>
                                    </li>
                                )
                            })
                        }
                        {(keepInList.length == 0 && callINList.length == 0) &&
                            <div className='empty-status'>
                                <i className='icon-null'></i>
                                <span className='empty-span'>当前无呼入电话</span>
                            </div>
                        }
                    </ul>

                </div>
                {
                    isShowAudioModal && <AudioModal visible={isShowAudioModal} hidePop={this.hidePop} data={modalData} isBack="show" showTransfer={showTransferModal} />
                }
            </div>
        );
    }
}

export default CallIn;