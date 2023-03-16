/*
 * @File: 会议详情界面
 * @Author: liulian
 * @Date: 2020-09-27 14:00:20
 * @version: V0.0.0.1
 * @LastEditTime: 2021-09-15 13:57:18
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { setAddMeetVisible,setEditRecord } from '../../../../reducer/meet-handle-reduce';
import { Modal } from "antd";

@connect(
    state => state.meetHandle,
    { setAddMeetVisible,setEditRecord }
)
class MeetDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        let none = {}
        this.props.setEditRecord({...none});
        this.props.hidePop("meetDetailVisible");
    };
    /**
     * 弹框确定
     */
    modalOk = () => {
        this.props.hidePop("meetDetailVisible");
        this.props.changeToEdit();
    }

    componentWillMount() {
    }

    componentDidMount() {

    }

    render() {
        let { data,visible }= this.props;
        return (
            <Modal
                title= "会议详情"
                className="meet-detail-modal"
                style={{ width: '22rem' }}
                visible={visible}
                onCancel={this.handleCancel}
                okText="编辑"
                onOk={this.modalOk}
            >
                <div className='meet-detail'>
                    <div className='meet-name'>
                        <span className='meet-name-label'>会议名称：</span>
                        <span className='meet-name-info'>{data.meetName || data.name || data.meetId}</span>
                    </div>
                    {data.meetAccess && 
                    <div className='meet-access'>
                        <span className='meet-access-label'>会场号：</span>
                        <span className='meet-access-info'>{data.meetAccess}</span>
                    </div>

                    }
                    
                    <div className='meet-passwdSpeaker'>
                        <span className='meet-passwdSpeaker-label'>成员密码：</span>
                        <span className='meet-passwdSpeaker-info'>{data.passwdSpeaker}</span>
                    </div>
                    <div className='meet-passwdAudience'>
                        <span className='meet-passwdAudience-label'>听众密码：</span>
                        <span className='meet-passwdAudience-info'>{data.passwdAudience}</span>
                    </div>
                    <div className='meet-type'>
                        <span className='meet-type-label'>会议类型：</span>
                        <span className='meet-type-info'>{data.meetAttr == 'MEET_RESERVE' ? '预约会议':'立即会议'}</span>
                    </div>
                    {data.meetAttr == 'MEET_RESERVE' && <div className='meet-type'>
                        <span className='meet-time-label'>预约时间：</span>
                        <span className='meet-time-info'>{data.timeBegin}</span>
                    </div>}
                    {data.meetMem && data.meetMem.length>0 && <div className='meet-mem'>
                        <span className='meet-mem-label'>参会人员：</span>
                        <div className='meet-mem-info over-ellipsis' title={data.meetMem.map((item)=>{return item.memName || item.memTel || item.tel })}>
                        {data.meetMem.map((item,index)=>{
                            return (
                            <span key={`detail-${index}`}>{item.memName || item.memTel || item.tel || ''}{index== data.meetMem.length-1 ? '' :'、'}</span>
                            )
                        })}
                        </div>
                    </div>
                    }
                </div>
            </Modal>
        );
    }
}

export default MeetDetail;