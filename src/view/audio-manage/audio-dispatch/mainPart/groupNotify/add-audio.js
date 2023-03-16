/*
 * @File: 语音调度-中间群组功能-组呼通知模板
 * @Author: liulian
 * @Date: 2020-07-05 16:08:46
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 11:32:55
 */ 
import React, { Component } from "react";
import { Button, Modal, Tabs, Input, message } from "antd";
import {connect} from 'react-redux';
import {setShowRecordInfo,setAudioList,setAddAudioVisible} from '../../../../../reducer/audio-handle-reducer';
import { apis } from "../../../../../util/apis";
import timeUtil from "../../../../../util/time-util";
import dispatchManager from "../../../../../util/dispatch-manager";


let timeIndex
@connect(
    state => state.audioHandle,
    {setShowRecordInfo,setAudioList,setAddAudioVisible}
)
class AddAudio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audioName:"",
            title:"",
            recordTag:false,   //是否开始录制
            isStartRecord:true,  //是否开始录制 
            audioTime:''
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.setState({
            title:''
        })
        this.props.setAddAudioVisible(false)
        // this.props.hidePop("addAudioVisible");
    };
    /**
     * 确定录制
     */
    modalOk = () =>{
        let {audioName} = this.state;
        let {audioList} = this.props;
        if(!audioName){
            message.error("请输入文件名");
            return;
        }
        let find = false;
        let tel = dispatchManager.accountDetail.activeHandler
        this.setState({
            title:audioName,
        })
        audioList && audioList.map((item)=>{
            if(item.recFile == audioName){
                find = true;
                return false;
            }
        })
        if(find){
            message.error("录音名称已存在，请重新设置！");
            this.setState({
                title:''
            })
        }else{
            this.setState({
                recordTag:true,
                isStartRecord:false,
            })
            dispatchManager.dispatcher.calls.notifyRecordOP(tel,audioName,'record');
            let time = 0;
            timeIndex = setInterval(()=>{
                time++;
                this.setState({
                    audioTime:timeUtil.calTimelength(time)
                })
            },1000)
        }
    }
    /**
     * 录音文件名称改变
     */
    inputChange = (e) => {
        this.setState({
            audioName:e.target.value
        })
    }
    /**
     * 结束录制
     */
    recordEnd = () => {
        let {audioName} = this.state;
        let tel = dispatchManager.accountDetail.activeHandler;
        dispatchManager.dispatcher.calls.notifyRecordOP(tel,audioName,'finish');
        // 结束录制后会变成保持状态，直接挂断
        dispatchManager.dispatcher.calls.hungUp(tel);
        this.setState({
            recordTag:false,
            isStartRecord:false,
            audioTime:''
        })
        clearInterval(timeIndex);
        this.loadAudioList();
    }
    /**
     * 重新录制
     */
    reStart = () =>{
        this.setState({
            isStartRecord:true,
            recordTag:false,
            title:''
        })
    }
    /**
     * 播放
     */
    playAudio = () => {
        let {audioName} = this.state;
        let tel = dispatchManager.accountDetail.activeHandler;
        dispatchManager.dispatcher.calls.notifyRecordOP(tel,audioName,'play',audioName);
    }
     /**
     * 加载录音文件
     */
    loadAudioList = async () => {
        let data = await apis.disp. listSerRecordNotify();
    
        data.list.forEach(element => {
            if(element.callLength){
                element.callLength = timeUtil.calTimelength(element.callLength);
            }else{
                element.callLength = ""
            }
        });
        this.props.setAudioList(data.list);

    }
    
    componentDidMount() {

    }

    render() {
        let {visible} = this.props;
        let {title,recordTag,isStartRecord,audioTime} = this.state;
        return (
            <Modal
                title={`${title ? title : '新建录音文件'}`}
                width={'250px'}
                height={'160px'} 
                style={{left: '18.3vw',top:'10vh' }}
                className="add-audio"
                maskClosable={false}
                visible={visible}
                footer={null}
                onCancel={this.handleCancel}
            >
                
                { isStartRecord == true && recordTag == false &&  
                <div>
                    <Input onChange={(e)=>{this.inputChange(e)}}></Input>
                    <Button onClick={this.modalOk}>录制</Button>
                </div>
                }
                {isStartRecord == false && recordTag == true &&  
                <div>
                    <span>正在录制 {audioTime}</span>  
                    <Button onClick={this.recordEnd}>结束</Button>
                </div>
                }
                { isStartRecord == false && recordTag == false &&
                <div>
                    <Button onClick={this.reStart}>继续录制</Button>
                    <Button onClick={this.playAudio}>播放</Button>
                </div>
                }
                
            </Modal>
        );
    }
}

export default AddAudio;