/*
 * @File: 会议人员超过25人平铺显示
 * @Author: liulian
 * @Date: 2020-09-17 11:36:20
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-09 16:33:17
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { message } from "antd";
import { addMeetMemTitle } from '../../../../config/constants'
import { setMeetDetailList } from '../../../../reducer/meet-handle-reduce';
import MeetOper from "../meet-desk/meet-oper";
import MeetSearch from "./meet-search";
import AddMember from "../../../../component/add-member";
import meetManager from "../../../../util/meet-manager";
import { getMeetDetail } from "../../../../util/meet-method";

@connect(
    state => state.meetHandle,
    { setMeetDetailList }
)
class BigPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowMemDetai: false,
            curMeetMem: {},
            memModalVisible: false, //人员选择器弹框
            searchData: [], //搜索结果
        }
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
     * 向会议中添加人员
     */
    addMeetMem = (index) => {
        this.setState({
            memModalVisible: true
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
                paramMem.push((da.tel || da.memTel));
            })
            memData.map((mem) => {
                paramMem.push(mem.memTel)
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
            memModalVisible: false
        })
        getMeetDetail(curMeet)
    };
    /**
    * 编辑预约会议
    */
    editMeetBypre = (params, resultCallback) => {
        let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        // let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        meetManager.meetsObj.editMeet(params.id, params.subject, resultCallback, params.accessCode, params.conferenceTimeType,
            params.timeBegin, params.timeEnd, params.chairmanPassword, params.guestPassword, meetMembers)

    }
    setSearchResult = (data) => {
        this.setState({
            searchData: data
        })
    }
    componentDidMount() {

    }
    render() {
        let { curMeet, allMeetOpLogs } = this.props;
        const { isShowMemDetai, curMeetMem, memModalVisible, searchData } = this.state;
        let curMeetOpLogs;
        allMeetOpLogs.map((item) => {
            if (item.id == curMeet.id) {
                curMeetOpLogs = item.logs;
            }
        })
        return (
            <div className="desk-detail desk-panel">
                {curMeet.id.indexOf("none") < 0 &&
                    <div className="msg-notify">
                        <i className='icon-msg'></i>
                        {curMeetOpLogs && curMeetOpLogs.length > 0 && <span className='msg-time'>{curMeetOpLogs[0].time}</span>}
                        {curMeetOpLogs && curMeetOpLogs.length > 0 && <span className="msg-content over-ellipsis">{curMeetOpLogs[0].log}</span>}
                    </div>
                }
                <MeetSearch curMeet={curMeet} searchResult={this.setSearchResult} />
                <div className='meet-list-panel'>
                    {searchData.length > 0 && searchData.map((item, index) => {
                        return (<span key={`attendees-${index}`}
                            title={item.name}
                            className={`meet-list ${item.level == 'private' ? 'mem-talk' : ''} ${(item.chair && curMeet.conferenceTimeType != 'EDIT_CONFERENCE') ? 'meet-chairman' : ''} ${item.status == 'calling' ? 'mem-calling' : ''} ${(item.status == 'reject' || item.status == 'unresponse') ? 'mem-reject' : ''} ${item.level == 'audience' ? 'mem-jy' : ''}${item.level == 'handup' ? 'mem-hands' : ''} ${item.status == 'quit' ? 'mem-quit' : ''}`}
                            onClick={() => this.showMemDetail(item)}><span className="mem-name-span over-ellipsis">{item.name}</span></span>)
                    })
                    }
                    {searchData.length == 0 && curMeet.attendees.map((val, index) => {
                        return (<span key={`attendees-${index}`}
                            title={val.name}
                            className={`meet-list ${val.level == 'private' ? 'mem-talk' : ''} ${(val.chair && curMeet.conferenceTimeType != 'EDIT_CONFERENCE') ? 'meet-chairman' : ''} ${val.status == 'calling' ? 'mem-calling' : ''} ${(val.status == 'reject' || val.status == 'unresponse') ? 'mem-reject' : ''} ${val.level == 'audience' ? 'mem-jy' : ''}${val.level == 'handup' ? 'mem-hands' : ''} ${val.status == 'quit' ? 'mem-quit' : ''}`}
                            onClick={() => this.showMemDetail(val)}><span className="mem-name-span over-ellipsis">{val.name}</span></span>)
                    })
                    }
                    <span
                        key={`attendees-${curMeet.attendees.length}`}
                        onClick={() => { this.addMeetMem() }}
                        className='meet-list meet-list-add'></span>
                </div>
                {
                    <AddMember modalVisible={memModalVisible} getMemData={(mems) => this.getMemData(mems)} title={addMeetMemTitle} />
                }
                {isShowMemDetai && curMeetMem &&
                    <MeetOper curMeetMem={curMeetMem} curMeet={curMeet} hideMemDetail={this.hideMemDetail} />
                }
            </div>
        );
    }
}

export default BigPanel; 