/*
 * @File: 语音调度-中间群组功能-组呼通知模板
 * @Author: liulian
 * @Date: 2020-07-05 16:08:46
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 11:55:51
 */ 
import React, { Component } from "react";
import { Modal, notification, Tabs } from "antd";
import {connect} from 'react-redux';
import {setShowRecordInfo,setAudioList,setRecordDefaultKey,setIsShowFooter,setAddAudioVisible} from '../../../../../reducer/audio-handle-reducer';
import TransToAudio from './trans-audio';
import AudioFile from './audio-file';
import NotifyRecord from './notify-record';
import RecordModal from './record-modal'
import { apis } from "../../../../../util/apis";
import timeUtil from "../../../../../util/time-util";

const { TabPane } = Tabs;

@connect(
    state => state.audioHandle,
    {setShowRecordInfo,setAudioList,setRecordDefaultKey,setIsShowFooter,setAddAudioVisible}
)
class GroupModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: 'tab-trans',
            // isShowFooter:false,   //是否显示页脚
            recMems:[],
            loopTime:'',
            content:'',
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.props.hidePop("groupVisible");
        notification.close('updateAudio')
        // this.props.setAddAudioVisible(false)
    };
    /**
     * 点击发起通知安妮
     */
    modalOk = () => {
        if(this.props.recordDefaultKey == 'tab-trans'){
            this.child.handleSubmit();
        }
        if(this.props.recordDefaultKey == 'tab-audio'){
            this.child.handleSubmits();
        }
    }

    changeTabs = (activeKey,updata,item) => {
        if(activeKey == 'tab-record'){
            this.props.setIsShowFooter(true)
        }else{
            this.props.setIsShowFooter(false)
        }
        this.props.setRecordDefaultKey(activeKey)
        if(updata){
            // 从【转发】跳转过来得
            this.setState({
                recMems:item.recMem,
                content:item.notifyRecordList[0].notifyFile,
                loopTime:item.notifyRecordList[0].loopTimes.toString()
            })
        }
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
    setRecMems = (data) => {
        this.setState({
            recMems:data
        })
    }

    componentDidMount() {
        this.setState({
            recMems: JSON.parse(JSON.stringify(this.props.recMems)),
        })
        this.loadAudioList();   //加载录音文件
    }

    render() {
        const { isShowFooter,visible, showRecordInfo,audioList,recordDefaultKey } = this.props;
        const {  recordList,recMems,loopTime,content } = this.state;
        const groupTabComponents = [
            { key: 'tab-trans', tab: '文字转语音', component: <TransToAudio onRef={child=>{this.child = child}} recMems={recMems} content={content} loopTime={loopTime} setRecMems={this.setRecMems} activeKey={this.state.activeKey} /> },
            { key: 'tab-audio', tab: '语音文件', component: <AudioFile onRef={childs=>{this.child = childs}} recMems={recMems} loopTime={loopTime} setRecMems={this.setRecMems} audioList={audioList} loadAudioList={this.loadAudioList} activeKey={this.state.activeKey}  /> },
            { key: 'tab-record', tab: '通知记录', component: <NotifyRecord activeKey={this.state.activeKey} /> },
        ]

        return (
            <Modal
                title="组呼通知"
                width={'740px'}
                height={'665px'} 
                className={`group-modal ${isShowFooter?'none-footer':''} ${showRecordInfo?'':'none-footer'}` }
                maskClosable={false}
                visible={visible}
                okText="发起通知"
                onOk = {this.modalOk}
                onCancel={this.handleCancel}
            >
                {showRecordInfo ?
                <Tabs activeKey={recordDefaultKey } onChange={this.changeTabs}>
                {
                    groupTabComponents.map(item => (
                        <TabPane tab={item.tab} key={item.key} >
                            {recordDefaultKey === item.key && item.component}
                        </TabPane>
                    ))
                }
                </Tabs>
                :
                
                <RecordModal changeTabs={this.changeTabs}/>
                }

            </Modal>
        );
    }
}

export default GroupModal;