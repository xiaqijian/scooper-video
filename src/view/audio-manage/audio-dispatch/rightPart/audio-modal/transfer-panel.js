/*
 * @File: 语音调度 -- 呼入转接面板
 * @Author: liulian
 * @Date: 2020-07-15 15:10:59
 * @version: V0.0.0.1
 * @LastEditTime: 2021-09-23 13:41:23
 */

import React, { Component } from "react";
import TransferSearch from './transfer-search';
import { connect } from 'react-redux';
import { apis } from '../../../../../util/apis';
import { setShowTransferModal } from '../../../../../reducer/callIn-handle-reduce';
import { setGroupList, setGroupMemList, setTransferInfo, setIsShowPanel, setIsShowSearchPanel, setIsShowTransferResultPanel } from '../../../../../reducer/audio-handle-reducer';
import { Button, message } from 'antd';
import dispatchManager from "../../../../../util/dispatch-manager";
import { getTelStatus } from "../../../../../util/method";

@connect(
    state => state.audioHandle,
    { setGroupList, setGroupMemList, setTransferInfo, setIsShowPanel, setIsShowSearchPanel, setIsShowTransferResultPanel }
)
@connect(
    state => state.callInHandle,
    { setShowTransferModal }
)
class TransferPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recentList: [],
            transferStatus: '',
            transferSelInfo: {}
        }
        this.outDivClickHandler = this.outDivClickHandler.bind(this)
    }

    componentDidMount() {
        this.loadRecentList();

        document.getElementById('transfer').addEventListener('click', this.outDivClickHandler);
    }
    /**
     * 获取联系人列表
     */
    loadRecentList = async () => {
        let { memTelMapCache } = this.props;
        let data = await apis.disp.getLatestContacts();
        let recentList = [];
        if (data) {
            data.forEach(element => {
                let param = {
                    tel: "",
                    name: ""
                }
                param.tel = element
                param.name = memTelMapCache[element] ? (memTelMapCache[element].name && memTelMapCache[element].name) : element
                recentList.push(param)
            });
        }
        this.setState({
            recentList: recentList
        })
    }

    outDivClickHandler(e) {
        let { isShowPanel, isShowSearchPanel } = this.props;
        if (isShowPanel || isShowSearchPanel) {
            let cur = e.path.find((dom) => {
                if (dom && dom.className && dom.className !== undefined && typeof dom.className !== 'object') {
                    if (dom.className.includes('transfer-search')) {
                        return dom;
                    }

                }
            })
            if (!cur) {
                this.props.setIsShowPanel(false);
                this.props.setIsShowSearchPanel(false);
            }
        }
    }

    setInputVal = (item) => {
        let { data } = this.props;
        item.val = item.name || item.tel;
        if (item.tel) {
            dispatchManager.getCalls().transfer(data.memTel, item.tel);
            this.props.setTransferInfo(item);
            this.props.setIsShowTransferResultPanel(true);
            this.transferEndByClose(item);
        } else {
            message.error("转接信息有误，请重新选择");
        }

    }
    handleCancel = () => {
        this.props.handleCancels();
    }
    goBack = () => {
        this.props.setShowTransferModal(false);
    }
    /**
     * 取消转接
     */
    cancelTransfer = () => {
        let { data } = this.props;
        if (getTelStatus(data.memTel) == 'callst_transfering') {  //转接中 -- 取消转接
            dispatchManager.getCalls().retrieve(data.memTel);
            this.props.handleCancels();
        } else {   //非转接中状态 -- 关闭弹窗
            this.props.handleCancels();
        }
    }
    /**
     * 对端接听 或者 对端未接听  3s钟后关闭弹窗
     */
    transferEndByClose = (toInfo) => {
        let toTel = toInfo.tel || toInfo.memTel;
        let _this = this;
        window.transferFlagTime = setInterval(() => {
            // 对端已接听  或者  对端未接听
            if (getTelStatus(toTel) == 'callst_transfer' || (window.toTel && window.toTel == toTel && getTelStatus(toTel) != "callst_transfer")) {
                setTimeout(() => {
                    _this.props.handleCancels();
                }, 3000)
                clearInterval(window.transferFlagTime)
            }
        }, 500)
    }

    render() {
        let { data, isBack, transferInfo, isShowTransferResultPanel } = this.props;
        let { recentList, } = this.state;
        return (
            <div className='transfer-wrap' id='transfer'>
                {isBack == 'show' && <i className='icon-goback' onClick={this.goBack}></i>}
                {isShowTransferResultPanel ?
                    <div className='transfer-sel-info'>
                        <span className='transfer-title'>把"
                            <span className='title-name'>{data.name}</span>"电话转接给
                            <span className='transfer-sel-name'>"{transferInfo && transferInfo.val}"</span>
                        </span>
                        {transferInfo && transferInfo != undefined && transferInfo.val && getTelStatus(data.memTel) == 'callst_transfering' ?
                            <p className='transfer-status transfer-success'>转接成功，等待对端接听...</p>
                            :
                            transferInfo && transferInfo != undefined && transferInfo.val && getTelStatus(data.memTel) == 'callst_transfer' ?
                                <p className='transfer-status transfer-ok'>对端已接听</p>
                                :
                                transferInfo && transferInfo != undefined && transferInfo.val && <p className='transfer-status transfer-fail'>对端未接听</p>

                        }
                        <Button
                            onClick={this.cancelTransfer}
                            className={`cancel-transfer-btn ${getTelStatus(data.memTel) == 'callst_transfering' ? 'btn-normal' : 'btn-dis'}`}>取消转接</Button>
                    </div>
                    :
                    <div className='transfer-info'>
                        <span className='transfer-title'>把"<span className='title-name'>{data.name}</span>"电话转接给</span>
                        <TransferSearch fromInfo={data} handleCancel={this.handleCancel} transferEndByClose={this.transferEndByClose} />
                        <p className='recent-title'>最近通话</p>
                        <div className='recent-list'>
                            {
                                recentList && recentList.map((item, index) => {
                                    return (
                                        <span className='recent-name over-ellipsis ' key={"recent-" + index} onClick={() => this.setInputVal(item)}>{item.name || item.tel}</span>
                                    )
                                })
                            }
                        </div>
                        {/* <span className='transfer-sel-name'>{transferSelInfo && transferSelInfo.val}</span> */}
                        {/* {transferSelInfo && transferSelInfo !=undefined && transferSelInfo.val && getTelStatus(data.memTel) == 'callst_transfering' ?
                    <span>转接成功，等待对端接听...</span>
                    :
                    transferSelInfo && transferSelInfo !=undefined && transferSelInfo.val && getTelStatus(data.memTel) == 'callst_transfer' ?
                        <span>对端已接听</span>
                    :
                    transferSelInfo && transferSelInfo !=undefined && transferSelInfo.val && <span>对端未接听</span>
                   
                } */}

                        {/* {transferSelInfo && transferSelInfo !=undefined && transferSelInfo.val   ?'': <p className='recent-title'>最近通话</p>} */}
                        {/* {transferSelInfo && transferSelInfo !=undefined && transferSelInfo.val  ? */}
                        {/* <Button className={`cancel-transfer-btn ${getTelStatus(data.memTel) == 'callst_transfering' ? 'btn-normal' : 'btn-dis'}`}>取消转接</Button>
                    : */}

                    </div>

                }

            </div>
        );
    }
}

export default TransferPane;