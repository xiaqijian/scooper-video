/*
 * @File: 语音调度-呼入面板
 * @Author: liulian
 * @Date: 2020-06-29 16:54:47
 * @version: V0.0.0.1
 * @LastEditTime: 2022-01-06 15:07:17
 */ 
import React, { Component } from "react";
import { Modal, Button, } from 'antd';
import { isEmpty } from 'lodash';
import {connect} from 'react-redux';
import {setShowTransferModal} from '../../../../reducer/callIn-handle-reduce';
import {setTransferInfo,setIsShowSearchPanel,setIsShowPanel,setIsShowTransferResultPanel} from '../../../../reducer/audio-handle-reducer'
import TransferPane from '../rightPart/audio-modal/transfer-panel'
// import dispatchManager from "../../../../../util/dispatch-manager";

@connect(
    state => state.callInHandle,
    { setShowTransferModal }
)
@connect(
    state => state.audioHandle,
    {setTransferInfo,setIsShowSearchPanel,setIsShowPanel,setIsShowTransferResultPanel}
)
class TransferModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transferModal:false
        }

    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        if(document.getElementById('transfer-input')){
            document.getElementById('transfer-input').blur();
        }
        
        this.props.setTransferInfo({});
        this.props.hidePop("showTransferPanel");
        this.props.setShowTransferModal(false);
        this.props.setIsShowSearchPanel(false);
        this.props.setIsShowPanel(false);
        this.props.setIsShowTransferResultPanel(false);
        if(window.transferFlagTime){
            clearInterval(window.transferFlagTime)
        }
        window.toTel = '';

    };
    
    componentDidMount() {

    }


    render() {
        const { visible, data,showTransferModal,isBack } = this.props;
        let {transferModal} = this.state;
        return (
            <Modal
                className="audio-modal"
                width="50%"
                maskClosable={false}
                maskStyle={{ backgroundColor: 'rgba(0,0,0,.1)' }}
                visible={visible}
                footer={null}
                onCancel={this.handleCancel}
            >                
                <TransferPane data={data} isBack={isBack}  handleCancels={this.handleCancel}/>
            </Modal>
        );
    }
}

export default TransferModal;