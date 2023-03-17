

import React, { Component } from "react";
import { connect } from "react-redux";
import { setMeetDetailList, setAllMeetOpLogs, setEditRecord, setAddMeetVisible } from '../../../../reducer/meet-handle-reduce';
import { message } from "antd";
import { addMeetMemTitle } from '../../../../config/constants'
import MeetOper from "../meet-desk/meet-oper";
import AddMember from "../../../../component/add-member";
import MeetDetail from "../meet-desk/meet-detail-modal";
import meetManager from "../../../../util/meet-manager";


@connect(
    state => state.meetHandle,
    { setMeetDetailList, setAllMeetOpLogs, setEditRecord, setAddMeetVisible }
)
class BigDesk extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowMemDetai: false,
            curMeetMem: {},
            addModalVisible: false, //是否显示人员选择器弹框
            meetDetailVisible: false, //是否显示会议详情弹框
        }
    }

    //生成空位置函数
    restSpan() {
        let doms = []
        for (let i = 0; i < 26 - this.props.curMeet.attendees.length; i++) {
            if (i == 26 - this.props.curMeet.attendees.length - 1) {
                doms.push(<span key={`empty_seat-${i}`} className="meet-list meet-list-none meet-list-add" onClick={this.showAddMem}></span>)
            } else {
                doms.push(<span key={`empty_seat-${i}`} className="meet-list meet-list-none"></span>)
            }
        }
        return doms
    }
    /**
     * 人员详情
     */
    showMemDetail = (item) => {
        this.setState({
            isShowMemDetai: true,
            curMeetMem: item
        })
    }
    hideMemDetail = () => {
        this.setState({
            isShowMemDetai: false,
            curMeetMem: {}
        })
    }
    /**
     * 显示人员选择器
     */
    showAddMem = () => {
        this.setState({
            addModalVisible: true
        })
    }
    /**
     * 获取人员选择器 人员  返回的人员数据 
     */
    getMemData = (memData) => {
        let { curMeet } = this.props;
        let id = curMeet.id;
        let joinMembersArray = [];
        memData.map((item) => {
            joinMembersArray.push(item.memTel)
        })
        if (memData.length > 0 && curMeet.conferenceTimeType != 'EDIT_CONFERENCE') {
            // 向立即会议中拉人
            window.scooper.meetManager.meetsObj.joinMembers(id, joinMembersArray)
        }
        if (memData.length > 0 && curMeet.conferenceTimeType == 'EDIT_CONFERENCE') {
            // 向预约会议中拉人 相当于编辑 预约会议
            let params = {
                id: curMeet.id,
                subject: curMeet.subject,
                accessCode: curMeet.accessCode,
                conferenceTimeType: curMeet.conferenceTimeType,
                timeBegin: curMeet.timeBegin,
                timeEnd: curMeet.timeEnd,
                chairmanPassword: curMeet.chairmanPassword,
                guestPassword: curMeet.guestPassword
            }
            let paramMem = [];
            curMeet.attendees.map((da) => {
                paramMem.push((da.tel || da.memTel) + ',speak');
            })
            memData.map((mem) => {
                paramMem.push(mem.memTel + ',speak')
            })
            params.meetMembers = paramMem
            this.editMeetBypre(params, (res) => {
                if (res.code != 0 || res.data.result == 'fail') {
                    if (res.message) message.error(res.message)
                } else {
                    message.success('添加成功')
                }
            })
        }
        this.setState({
            addModalVisible: false
        })
    };
    /**
     * 编辑预约会议
     */
    editMeetBypre = (params, resultCallback) => {
        let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        meetManager.meetsObj.editMeet(params.id, params.subject, resultCallback, params.accessCode, params.conferenceTimeType,
            params.timeBegin, params.timeEnd, params.chairmanPassword, params.guestPassword, meetMembers)

    }
    /**
     * 显示会议详情弹框
     */
    showMeetDetail = () => {
        this.setState({
            meetDetailVisible: true
        })
    }
    /**
    * 隐藏弹框
    */
    hidePop = (tag) => {
        this.setState({
            [tag]: false
        })
    }
    /**
     * 显示编辑弹窗
     */
    changeToEdit = () => {
        let { curMeet } = this.props;
        this.props.setEditRecord(curMeet);
        this.props.setAddMeetVisible(true)
    }
    componentDidMount() {

    }

    render() {
        let { curMeet, allMeetOpLogs } = this.props;
        const { isShowMemDetai, curMeetMem, addModalVisible, meetDetailVisible } = this.state;
        let curMeetOpLogs;
        allMeetOpLogs.map((item) => {
            if (item.id == curMeet.id) {
                curMeetOpLogs = item.logs;
            }
        })
        return (
            <div className="desk-detail">
                <div className='msg-wrap'>
                    {curMeetOpLogs && curMeetOpLogs.length > 0 && curMeetOpLogs.map((item, index) => {
                        if (index < 3) {
                            return (
                                <div className="msg-notify" key={`detail-notify-${index}`}>
                                    <i className='icon-msg'></i>
                                    <span className='msg-time'>{item.time}</span>
                                    <span title={item.log} className="msg-content over-ellipsis">{item.log}</span>
                                </div>
                            )
                        }
                    })
                    }
                </div>
                <div className='desk-detail-wrap'>
                    <div className='meet-table'>
                        {curMeet.conferenceTimeType != 'EDIT_CONFERENCE' &&
                            <div className='meet-info'>
                                <span className='meet-info-num'>会议号：{curMeet.accessCode || curMeet.subject || curMeet.id}
                                    <i className='meet-info-icon' onClick={this.showMeetDetail}></i>
                                </span>
                            </div>
                        }
                        {curMeet.conferenceTimeType == 'EDIT_CONFERENCE' &&
                            <div className="meet-info-pre">
                                <div className='pre-wrap'>
                                    <span className='pre-title'>预约会议</span>
                                    <i className='meet-info-icon' onClick={this.showMeetDetail}></i>
                                </div>

                                <span className='meet-prev-time'>预约时间：{curMeet.timeBegin}</span>
                            </div>
                        }
                    </div>
                    <div className='meet-list-wrap'>
                        {curMeet.attendees.map((val, index) => {
                            if (index == 25) {
                                return (
                                    <span key={`attendees-add`}
                                        className={`meet-list meet-list-add`}></span>
                                )
                            }
                            return (
                                <span key={`attendees-${index}`}
                                    title={val.name}
                                    className={`meet-list ${val.level == 'private' ? 'mem-talk' : ''} ${(val.chair == true && curMeet.conferenceTimeType != 'EDIT_CONFERENCE') ? 'meet-chairman' : ''} ${val.status == 'calling' ? 'mem-calling' : ''} ${(val.status == 'reject' || val.status == 'unresponse') ? 'mem-reject' : ''}${val.level == 'handup' ? 'mem-hands' : ''} ${val.level == 'audience' ? 'mem-jy' : ''} ${val.status == 'quit' ? 'mem-quit' : ''}`}
                                    onClick={() => this.showMemDetail(val)}><span className="mem-name-span over-ellipsis">{val.name}</span></span>
                            )
                        })
                        }
                        {
                            this.restSpan().map((val) => {
                                return val
                            })
                        }
                    </div>
                    {
                        isShowMemDetai && curMeetMem &&
                        <MeetOper curMeetMem={curMeetMem} curMeet={curMeet} hideMemDetail={this.hideMemDetail} />
                    }
                    {<AddMember modalVisible={addModalVisible} getMemData={(mems) => this.getMemData(mems)} title={addMeetMemTitle}></AddMember>}
                    <MeetDetail visible={meetDetailVisible} data={curMeet} hidePop={this.hidePop} changeToEdit={this.changeToEdit} />
                </div>
            </div>
        );
    }
}

export default BigDesk;