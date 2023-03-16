/*
 * @File: 语音调度-拨号盘
 * @Author: liulian
 * @Date: 2020-07-07 17:18:10
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 14:27:36
 */ 
import React, { Component } from "react";
import { Modal, Button, Input, message } from 'antd'
import dispatchManager from "../../../../util/dispatch-manager";
import { joinMeet } from "../../../../util/meet-method";
import timeUtil from "../../../../util/time-util";


class DailModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVal:''
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.props.hidePop("dailVisible");
    };

    itemClick = (e,val) => {
        e.preventDefault();
        e.stopPropagation();
        let test = this.state.inputVal
        this.setState({
            inputVal:test.toString() + val
        })
    }

    clearAll = () => {
        let {inputVal} = this.state;
        this.setState({
            inputVal:inputVal.substring(0,inputVal.length-1)
        })
    }
    /**
     * 呼叫
     */
    makeCall = () => {
        let {inputVal} = this.state;
        if(inputVal){
            let businessId = dispatchManager.accountDetail.operatorId + '_' + timeUtil.getTimeStamp();
            dispatchManager.dispatcher.calls.makeCall(inputVal,businessId);
            // dispatchManager.getCalls().makeCall(inputVal);
        }else{
            message.error("请先输入号码！");
            return;
        }
    }
    /**
     * 转接
     */
    transfer = () => {
        let {inputVal} = this.state;
        if(inputVal){
            dispatchManager.getCalls().transfer(inputVal);
        }else{
            message.error("请先输入号码！");
            return;
        }
    }
    /**
     * 加入会议
     */
    joinMeet = () => {
        let {inputVal} = this.state;
        if(inputVal){
            joinMeet(inputVal)
        }else{
            message.error("加入会议成员不能为空");
            return;
        }
    }

    componentDidMount() {

    }
    keyPress = (e) => {
        e.persist();
        this.setState({
            inputVal:e.target.value
        })
    }

    render() {
        let { visible } = this.props;
        return (
            
                <Modal
                    title={<span><i className='icon-dail'></i>拨号盘</span>}
                    width={'23.75rem'}
                    height={'31.45rem'}
                    className={`dail-modal ${window.top.style == 'iframe' ? 'dail-iframe-modal':''}`}
                    style={{left: '19vw' }}
                    maskClosable={false}
                    maskStyle={{ backgroundColor: 'rgba(0,0,0,.1)' }}
                    visible={visible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <div className='input-wrap'>
                        <Input value={this.state.inputVal} autoFocus="autofocus" onChange={(e)=>{this.keyPress(e)}} />
                        <i className='icon-clear' onClick={this.clearAll}></i>
                    </div>
                    <div className='key-board'>
                        <li onClick={e=>this.itemClick(e,1)}><span>1</span></li>
                        <li onClick={e=>this.itemClick(e,2)}>
                            <span>2</span>
                            <span className='extra-info'>A</span>
                            <span className='extra-info extra-second'>B</span>
                            <span className='extra-info extra-three'>C</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,3)}>
                            <span>3</span>
                            <span className='extra-info' >D</span>
                            <span className='extra-info extra-second' style={{marginLeft:'0.7rem'}}>E</span>
                            <span className='extra-info extra-three'>F</span>
                            </li>
                        <li onClick={e=>this.itemClick(e,4)}>
                            <span>4</span>
                            <span className='extra-info'>G</span>
                            <span className='extra-info extra-second'>H</span>
                            <span className='extra-info extra-three'>I</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,5)}> 
                            <span>5</span>
                            <span className='extra-info'>J</span>
                            <span className='extra-info extra-second' style={{marginLeft:'0.5rem'}}>K</span>
                            <span className='extra-info extra-three'>L</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,6)}>
                            <span>6</span>
                            <span className='extra-info'>M</span>
                            <span className='extra-info extra-second' style={{marginLeft:'0.825rem'}}>N</span>
                            <span className='extra-info extra-three' style={{marginLeft:'1.5rem'}}>O</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,7)}>
                            <span>7</span>
                            <span className='extra-info' style={{left:'36%'}}>P</span>
                            <span className='extra-info extra-second' style={{marginLeft:'0.25rem'}}>Q</span>
                            <span className='extra-info extra-three' style={{marginLeft:'1rem'}}>R</span>
                            <span className='extra-info' style={{marginLeft:'1.6rem'}}>S</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,8)}>
                            <span>8</span>
                            <span className='extra-info'>T</span>
                            <span className='extra-info extra-second'>U</span>
                            <span className='extra-info extra-three'>V</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,9)}>
                            <span>9</span>
                            <span className='extra-info' style={{left:'36%'}}>W</span>
                            <span className='extra-info extra-second' style={{marginLeft:'0.4rem'}}>X</span>
                            <span className='extra-info extra-three' style={{marginLeft:'0.94rem'}}>Y</span>
                            <span className='extra-info extra-three' style={{marginLeft:'1.5rem'}}>Z</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,'*')}><span className='letter-star'>*</span></li>
                        <li onClick={e=>this.itemClick(e,0)}>
                            <span>0</span>
                            <span className='extra-info' style={{marginLeft:'0.5rem'}}>+</span>
                        </li>
                        <li onClick={e=>this.itemClick(e,'#')}><span style={{marginTop:'0.25rem'}}>#</span></li>
                    </div>
                    <div className='btn-wrap'>
                        {/* <Button className='btn-transfer' onClick={this.transfer}></Button> */}
                        <Button className='btn-call' onClick={this.makeCall}></Button>
                        <Button className='btn-joinMeet' onClick={this.joinMeet}></Button>
                    </div>
                </Modal>
            // </QueueAnim>
        );
    }
}

export default DailModal;