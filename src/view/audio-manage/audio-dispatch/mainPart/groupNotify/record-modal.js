/*
 * @File: 语音调度-组呼通知Tab-通知记录-详情弹框
 * @Author: liulian
 * @Date: 2020-07-06 15:15:41
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-29 20:24:59
 */

import React, { Component } from "react";
import { Button, Row, Col, Form, Input,message } from "antd";
import { connect } from 'react-redux';
import { setShowRecordInfo, setRecordItemData,setRecordDefaultKey,setCurSelectAudio,setIsShowFooter } from '../../../../../reducer/audio-handle-reducer'
import dispatchManager from "../../../../../util/dispatch-manager";


const { TextArea } = Input;
const textItemLayout = {
    labelCol: {
        span: 0,
    },
    wrapperCol: {
        span: 24,
    },
}


@connect(
    state => state.audioHandle,
    { setShowRecordInfo, setRecordItemData,setRecordDefaultKey,setCurSelectAudio ,setIsShowFooter}
)
class RecordModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultType: 'all'
        }
    }

    goBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.setShowRecordInfo(true)
    }

    /**
     * 所有结果
     */
    getAllResult = () => {
        this.setState({
            resultType: 'all'
        })
    }
    /**
     * 失败结果
     */
    getFailResult = () => {
        this.setState({
            resultType: 'fail'
        })
    }
    /**
     * 重新发送
     */
    reSend = () => {
        let { recordItemData } = this.props;
        let telArr = [];
        let notifyRecordList = recordItemData.notifyRecordList;
        notifyRecordList.length>0 && notifyRecordList.forEach((item)=>{
            if(item.notifyResult != 200){
                telArr.push(item.called)
            }
        })
        // let telArr = recordItemData.calleds;
        let files = recordItemData.notifyRecordList[0].notifyFile;
        let type = '';
        if(recordItemData.notifyRecordList[0].type == 2 ){
            type = 'text';
        }else{
            type = 'notify';
        }
        let times = recordItemData.notifyRecordList[0].loopTimes;
        let notifyId = recordItemData.notifyRecordList[0].notifyId;
        if (!files) {
            message.error("通知内容不能为空");
            return false;
        }
        if (!times) {
            message.error("循环次数不能为空");
            return false;
        }
        if (telArr.length == 0) {
            message.error("接收人不能为空");
            return false;
        }
        dispatchManager.dispatcher.calls.selectNotify(telArr, files, type, times, notifyId);
    }
    /**
     * 播放
     */
    playAudio = (fileName) => {
        let tel = dispatchManager.accountDetail.activeHandler
        dispatchManager.dispatcher.calls.notifyRecordOP(tel, fileName, 'play', fileName);
    }
    /**
     * 转发
     */
    forwardRecord = (item) =>{
        let {memTelMapCache} = this.props;
        this.props.setShowRecordInfo(true);
        this.props.setIsShowFooter(false);
        let curItem = item;
        let _this = this;
        if(item.notifyRecordList[0].notifyType == 2){
            // 去文字转语音
            // this.props.setRecordDefaultKey("tab-trans")
            let recMem = [];
            item.calleds.map((cal,i)=>{
                memTelMapCache[cal] && recMem.push(memTelMapCache[cal])
            });
            item.recMem = recMem
            _this.props.changeTabs("tab-trans",'update',item)
            _this.props.setShowRecordInfo(true)
            
        }else{
            // 去语音文件
            // this.props.setRecordDefaultKey("tab-audio");
            let recMem = [];
            if(curItem.calleds.length > 0 ){
                let calledArr = curItem.calleds;
                calledArr.forEach((item)=>{
                    if(memTelMapCache[item]){
                        recMem.push(memTelMapCache[item])
                    }
                })
                item.recMem = recMem
                _this.props.changeTabs("tab-audio",'update',item)
                _this.props.setShowRecordInfo(true)
                
                let {audioList} = _this.props;
                audioList && audioList.map((items) => {
                    if (items.recFile == item.notifyRecordList[0].notifyFile) {
                        _this.props.setCurSelectAudio(items);
                    }
                })
            }

            // item.calleds.map((cal,i)=>{
            //     memTelMapCache[cal] && recMem.push(memTelMapCache[cal])
            // });
            
           
        }
    }
    componentDidMount() {

    }

    render() {
        let { recordItemData } = this.props;
        let { resultType } = this.state
        const { getFieldDecorator } = this.props.form;
        return (
            <div className='record-info'>
                <span className='record-back' onClick={(e) => this.goBack(e)}><i className="icon-goback"></i>通知记录</span>
                <Form >
                    <Row className="span-row">
                        <Col span={12}>
                            <span className='span-title'>通知内容</span>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <span className='span-forward' onClick={()=>{this.forwardRecord(recordItemData)}}><i className='icon-forward'></i>转发</span>
                        </Col>
                    </Row>
                    <Row>
                        {recordItemData.notifyRecordList[0].notifyType == 2 ?
                            <Form.Item {...textItemLayout}>
                                {getFieldDecorator('notifyContent', { initialValue: recordItemData.notifyRecordList[0].notifyFile })(
                                    <TextArea placeholder="请输入通知内容（300字以内）" rows={8} />
                                )}
                            </Form.Item>
                            :
                            <div className='audio-file-wrap'>
                                <i className='icon-audioMusic'></i>
                                <span>{recordItemData.notifyRecordList[0].notifyFile}</span>
                                <i className='icon-play' onClick={()=>{this.playAudio(recordItemData.notifyRecordList[0].notifyFile)}} ></i>
                            </div>
                        }

                    </Row>
                    <Row>
                        <Col span={12}>
                            <span className='span-title'>接收状态</span>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Button className={`all-result ${resultType == 'all' ? 'onsel' : ''}`} onClick={() => { this.getAllResult() }} > 全部</Button>
                            <Button className={`fail-result ${resultType == 'fail' ? 'onsel' : ''}`}  onClick={() => { this.getFailResult() }}> 失败</Button>
                        </Col>
                    </Row>
                    <Row className={`rec-wrap ${recordItemData.notifyRecordList[0].notifyType == "2" ? '' : 'audio-rec-wrap'}`}>
                        {resultType == 'all' &&
                            recordItemData.notifyRecordList && recordItemData.notifyRecordList.map((item, index) => {

                                return (
                                    <div className="rec-mem-wrap" key={index}>
                                        <span key={item.id} className={`rec-mem ${item.notifyResult == 200 ? '' : 'rec-mem-fail'}`}>{item.calledName}</span>
                                    </div>

                                )
                            })
                        }
                        {resultType == 'fail' &&
                            recordItemData.notifyRecordList && recordItemData.notifyRecordList.map((item, index) => {

                                return (
                                    item.notifyResult != 200 && <div className="rec-mem-wrap" key={"fail" + index}>
                                        <span className={`rec-mem ${item.notifyResult == 200 ? '' : 'rec-mem-fail'}`}>{item.calledName}</span>
                                    </div>
                                )
                            })
                        }
                    </Row>
                    <Row className='btns-bottom'>
                        <Button className='cancel-send' onClick={this.goBack}>取消</Button>
                        <Button className='refoward-btn' type="primary" onClick={this.reSend}>一键重发</Button>
                    </Row>
                </Form>
            </div>


        );
    }
}

export default Form.create()(RecordModal);