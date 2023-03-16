/*
 * @File: 语音调度-右侧更多记录
 * @Author: liulian
 * @Date: 2020-07-07 10:41:21
 * @version: V0.0.0.1
 * @LastEditTime: 2020-09-02 15:51:38
 */ 
import React, { Component } from "react";
import { Modal, Tabs, Input, DatePicker, Divider } from "antd";
import {connect} from 'react-redux';
import {setShowContent,setGroupRecordList} from '../../../../../reducer/callRecord-handle-reduce';
import {setMemTelMapCache} from '../../../../../reducer/audio-handle-reducer'
import GroupRecord from './group-record';
import BoardRecord from './board-record';
import PresentRecord from './present-record';
import PollRecord from './poll-record';
import { apis } from "../../../../../util/apis";
import { formatGroupRecord } from "../../../../../util/method";

const {TabPane} = Tabs;

@connect(
    state=>state.audioHandle,
    {setMemTelMapCache}
)
@connect(
    state=> state.callRecordHandle,
    {setShowContent,setGroupRecordList}
)
class CallRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: 'tab-group',
        }
    }

     /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.props.hidePop("moreModalVisible");
    };

    changeTabs = (activeKey) => {
        if(activeKey == 'tab-record'){
            this.setState({
                isShowFooter:true
            })
        }else{
            this.setState({
                isShowFooter:false
            })
        }
        this.setState({
            activeKey: activeKey
        });
    }
    /**
     * 加载组呼选呼记录
     */
    loadGroupRecordList = async (param) => {
        let data = await apis.disp.pageGroupRecord(param);
        let {memTelMapCache} = this.props;
        let list = formatGroupRecord(data,memTelMapCache);
        this.props.setGroupRecordList(list)
    }

    componentDidMount() {
        let param = {
            groupType:1
        }
        this.loadGroupRecordList(param);
    }


    render() {
        const {activeKey} = this.state;
        const { visible,groupRecordList,boardRecordList,presentRecordList,pollRecordList} = this.props;
        const recordTabComponents = [
            { key: 'tab-group', tab: '组呼选呼', component: <GroupRecord activeKey={this.state.activeKey} /> },
            { key: 'tab-board', tab: '广播记录', component: <BoardRecord activeKey={this.state.activeKey} /> },
            { key: 'tab-present', tab: '点名记录', component: <PresentRecord activeKey={this.state.activeKey} /> },
            { key: 'tab-poll', tab: '轮询记录', component: <PollRecord activeKey={this.state.activeKey} /> },
        ]
        return (
            <Modal
                className="more-modal"
                title="更多记录"
                width="48rem"
                maskClosable={false}
                visible={visible}
                footer={null}
                onCancel={this.handleCancel}
            >
              <Tabs activeKey={activeKey} onChange={this.changeTabs}>
                {
                    recordTabComponents.map(item => (
                        <TabPane tab={item.tab} key={item.key} >
                            {activeKey === item.key && item.component}
                        </TabPane>
                    ))
                }
                </Tabs>
                
            </Modal>
        );
    }
}

export default CallRecord;