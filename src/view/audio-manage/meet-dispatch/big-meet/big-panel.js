/*
 * @File: 会议人员超过25人平铺显示
 * @Author: liulian
 * @Date: 2020-09-17 11:36:20
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-09 16:33:17
 */

import React, {Component} from "react";
import { connect } from "react-redux";
import { message } from "antd";
import { addMeetMemTitle } from '../../../../config/constants'
import {setMeetDetailList } from '../../../../reducer/meet-handle-reduce';
import MeetOper from "../meet-desk/meet-oper";
import MeetSearch from "./meet-search";
import AddMember from "../../../../component/add-member";
import meetManager from "../../../../util/meet-manager";
 
@connect(
    state => state.meetHandle,
    {setMeetDetailList }
)
class BigPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowMemDetai:false,
            curMeetMem:{},
            memModalVisible:false, //人员选择器弹框
            searchData:[], //搜索结果
        }
    }
    /**
     * 人员详情
     */
    showMemDetail = (item) =>{
        this.setState({
            isShowMemDetai:true,
            curMeetMem:item
        })
    }
    hideMemDetail = () => {
        this.setState({
            isShowMemDetai:false,
            curMeetMem:{}
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
        let meetId = curMeet.meetId;
        let joinMembersArray = [];
        memData.map((item)=>{
            joinMembersArray.push(item.memTel)
        })
        if(memData.length>0 && curMeet.meetAttr!='MEET_RESERVE'){
            // 向立即会议中拉人
            window.scooper.meetManager.meetsObj.joinMembers(meetId,joinMembersArray)
        }
        if(memData.length > 0 && curMeet.meetAttr == 'MEET_RESERVE'){
            // 向预约会议中拉人 相当于编辑 预约会议
            let params = {
                meetId:curMeet.meetId,
                meetName:curMeet.meetName,
                meetAccess:curMeet.meetAccess,
                meetAttr:curMeet.meetAttr,
                timeBegin:curMeet.timeBegin,
                timeEnd:curMeet.timeEnd,
                passwdSpeaker:curMeet.passwdSpeaker,
                passwdAudience:curMeet.passwdAudience
            }
            let paramMem = [];
            curMeet.meetMem.map((da)=>{
                paramMem.push((da.tel||da.memTel));
            })   
            memData.map((mem)=>{
                paramMem.push(mem.memTel)
            })
            params.meetMembers = paramMem
            this.editMeetBypre(params,(res)=>{
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
    };
     /**
     * 编辑预约会议
     */
    editMeetBypre = (params,resultCallback) => {
        let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        // let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        meetManager.meetsObj.editMeet(params.meetId,params.meetName,resultCallback,params.meetAccess,params.meetAttr,
            params.timeBegin,params.timeEnd,params.passwdSpeaker,params.passwdAudience,meetMembers)

    }
    setSearchResult = (data) => {
        this.setState({
            searchData:data
        })
    }
    componentDidMount(){

    }
    render() {
        let {curMeet,allMeetOpLogs} = this.props; 
        const {isShowMemDetai,curMeetMem,memModalVisible,searchData} = this.state;
        let curMeetOpLogs;
        allMeetOpLogs.map((item) => {
            if (item.meetId == curMeet.meetId) {
                curMeetOpLogs = item.logs;
            }
        })
        return (
            <div className="desk-detail desk-panel">
                {curMeet.meetId.indexOf("none") < 0 && 
                    <div className="msg-notify">
                        <i className='icon-msg'></i>
                        {curMeetOpLogs && curMeetOpLogs.length > 0 &&<span className='msg-time'>{curMeetOpLogs[0].time}</span>}
                        {curMeetOpLogs && curMeetOpLogs.length > 0 &&<span className="msg-content over-ellipsis">{curMeetOpLogs[0].log}</span>}
                    </div>
                }
                <MeetSearch curMeet={curMeet} searchResult={this.setSearchResult} />
                <div className='meet-list-panel'>
                {searchData.length>0 && searchData.map((item,index)=>{
                     return(<span key={`meetMem-${index}`} 
                     title={item.memName}
                     className={`meet-list ${item.level == 'private' ? 'mem-talk' : ''} ${(item.chair && curMeet.meetAttr != 'MEET_RESERVE') ? 'meet-chairman' : ''} ${item.status == 'calling' ? 'mem-calling' : ''} ${(item.status == 'reject'||item.status == 'unresponse') ? 'mem-reject' : ''} ${item.level == 'audience' ? 'mem-jy' : ''}${item.level == 'handup' ? 'mem-hands' : ''} ${item.status == 'quit' ? 'mem-quit' : ''}`} 
                     onClick={()=>this.showMemDetail(item)}><span className="mem-name-span over-ellipsis">{item.memName}</span></span>)
                })
                }
                {searchData.length==0 && curMeet.meetMem.map((val,index) => {
                    return(<span key={`meetMem-${index}`} 
                    title={val.memName}
                    className={`meet-list ${val.level == 'private' ? 'mem-talk' : ''} ${(val.chair && curMeet.meetAttr != 'MEET_RESERVE') ? 'meet-chairman' : ''} ${val.status == 'calling' ? 'mem-calling' : ''} ${(val.status == 'reject'||val.status == 'unresponse') ? 'mem-reject' : ''} ${val.level == 'audience' ? 'mem-jy' : ''}${val.level == 'handup' ? 'mem-hands' : ''} ${val.status == 'quit' ? 'mem-quit' : ''}`} 
                    onClick={()=>this.showMemDetail(val)}><span className="mem-name-span over-ellipsis">{val.memName}</span></span>)
                    })
                }
                <span 
                    key={`meetMem-${curMeet.meetMem.length}`}
                    onClick={() => { this.addMeetMem() }}
                    className='meet-list meet-list-add'></span> 
                </div>
                {
                    <AddMember modalVisible={memModalVisible} getMemData={(mems) => this.getMemData(mems)} title={addMeetMemTitle} />
                }
                { isShowMemDetai && curMeetMem && 
                <MeetOper curMeetMem={curMeetMem} curMeet={curMeet} hideMemDetail={this.hideMemDetail} />
                }
            </div>
        );
    }
}

export default BigPanel; 