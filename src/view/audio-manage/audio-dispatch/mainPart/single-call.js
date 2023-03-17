/*
 * @File: 语音调度-中间单呼功能
 * @Author: liulian
 * @Date: 2020-06-11 11:23:17
 * @version: V0.0.0.1
 * @LastEditTime: 2022-01-06 14:21:22
 */
import React, { Component } from "react";
import { Button, Switch, message } from "antd";
import DailModal from './dail-modal';
import $ from 'jquery'
import { connect } from 'react-redux';
import { apis } from '../../../../util/apis';
import { getBtnEnable, getTelStatus, loadGroupMember, loadOrgMember } from '../../../../util/method'
import { setMeetDetailList } from '../../../../reducer/meet-handle-reduce'
import { changeLoading } from '../../../../reducer/loading-reducer'
import { setCurSeleceMem, setIsMainTalk, setDefaultKey, setIsSubTalk, setSelectedKeys, setExpandedKeys, setShankCall, setIsShowTzly, setIsShowMainZdh, setIsShowSubZdh, setCenterOperTel, setCurSelectCore, setCurSelectGroup } from '../../../../reducer/audio-handle-reducer'
import dispatchManager from "../../../../util/dispatch-manager";
import TransferModal from './transfer-modal'
import { joinMeet } from "../../../../util/meet-method";
import timeUtil from "../../../../util/time-util";
// import QueueAnim from 'rc-queue-anim'

@connect(
    state => state.audioHandle,
    { setCurSeleceMem, setIsMainTalk, setDefaultKey, setExpandedKeys, setSelectedKeys, setIsSubTalk, setShankCall, setIsShowTzly, setIsShowMainZdh, setIsShowSubZdh, setCenterOperTel, setCurSelectCore, setCurSelectGroup }
)
@connect(
    state => state.meetHandle,
    { setMeetDetailList }
)
@connect(
    state => state.loading,
    { changeLoading }
)
class SingleCall extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dailVisible: false,
            isDailClick: false,
            showTransferPanel: false,
            transferData: {},   //转接面板需要的数据
            // isShowOneTalk: true,   //是否显示一号通按钮
            // onTalkTelsArr:[], //一号通号码数组
            // recordStatus:true,   //通话录音开关开启(到时候从配置项加载)
        }
    }
    /**
     * 主副手柄切换
     */
    onChange = (checked) => {
        let tel = checked ? dispatchManager.accountDetail.viceTel : dispatchManager.accountDetail.mainTel
        if (!tel) {
            message.error("手柄号未配置，无法进行鉴权操作");
            return;
        } else {
            dispatchManager.dispatcher.setOperTel(tel);
            // this.props.setCenterOperTel(checked)
        }
    }
    /**
     * 显示拨号盘
     */
    showDailOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            dailVisible: true,
            isDailClick: true,
        })
    }
    /**
    * 隐藏弹框
    */
    hidePop = (tag) => {
        this.setState({
            [tag]: false,
            isDailClick: false
        })
    }
    /**
     * 关闭弹框
     */
    handleCancel = () => {
        if (document.getElementById('transfer-input')) {
            document.getElementById('transfer-input').blur();
        }

        this.props.setTransferInfo({});

        this.props.setShowTransferModal(false);
        this.props.setIsShowSearchPanel(false);
        this.props.setIsShowPanel(false)
    };
    // 呼叫
    makeCall = (e, tel) => {
        e.preventDefault();
        e.stopPropagation();
        if (tel) {
            let businessId = dispatchManager.accountDetail.operatorId + "_" + timeUtil.getTimeStamp();
            dispatchManager.dispatcher.calls.makeCall(tel, businessId);
        }
    }
    // 挂断
    hungUp = (e, tel) => {
        if (tel) {
            if (window.scooper.videoManagers && window.scooper.videoManagers.videoController && window.scooper.videoManagers.videoController.isPlaying(tel) > -1) {
                window.scooper.videoManagers.videoController.close(window.scooper.videoManagers.videoController.isPlaying(tel))
            }
            dispatchManager.dispatcher.calls.hungUp(tel);
        }
    }
    // 加入会议
    joinMeet = (e, tel) => {
        if (tel && getBtnEnable('meet', getTelStatus(tel))) {
            joinMeet(tel)
        }

    }
    // 一号通
    groupTurn = (e, selMem) => {
        if (selMem.memTel && getBtnEnable('groupturn', getTelStatus(selMem.memTel))) {
            let tels = [];
            let telMap = {};
            selMem.memTel && tels.push(selMem.memTel) && (telMap[selMem.memTel] = 1);
            selMem.memMobile && !telMap[selMem.memMobile] && tels.push(selMem.memMobile) && (telMap[selMem.memMobile] = 1);
            selMem.memTel2 && !telMap[selMem.memTel2] && tels.push(selMem.memTel2) && (telMap[selMem.memTel2] = 1);
            selMem.memJkTel && !telMap[selMem.memJkTel] && tels.push(selMem.memJkTel) && (telMap[selMem.memJkTel] = 1);
            selMem.memMsgTel && !telMap[selMem.memMsgTel] && tels.push(selMem.memMsgTel) && (telMap[selMem.memMsgTel] = 1);
            dispatchManager.dispatcher.calls.groupTurn(tels, true);
        }
    }
    // 开始录音
    callRecord = (e, tel) => {
        if (tel) {
            dispatchManager.dispatcher.calls.callRecord(tel);
        }
    }
    // 停止录音
    callRecordEnd = (e, tel) => {
        if (tel) {
            dispatchManager.dispatcher.calls.callRecordEnd(tel);
        }
    }
    // 监听
    tripleMonitor = (e, tel) => {
        if (tel && getBtnEnable('monitor', getTelStatus(tel))) {
            dispatchManager.dispatcher.calls.tripleMonitor(tel);
        }
    }
    // 强拆
    tripleHungup = (e, tel) => {
        if (tel) {
            dispatchManager.dispatcher.calls.tripleHungup(tel);
        }
    }
    // 保持
    hold = (e, tel) => {
        if (tel && getBtnEnable('keep', getTelStatus(tel))) {
            dispatchManager.dispatcher.calls.hold(tel);
        }

    }
    // 取回
    unhold = (e, tel) => {
        if (tel) {
            dispatchManager.dispatcher.calls.unhold(tel);
        }
    }
    // 墙插
    tripleBreakin = (e, tel) => {
        if (tel && getBtnEnable('breakin', getTelStatus(tel))) {
            dispatchManager.dispatcher.calls.tripleBreakin(tel);
        }

    }
    // 显示转接面板
    showTransfer = (item) => {
        if (item.memTel && (getTelStatus(item.memTel) == 'callst_transfering')) {
            dispatchManager.dispatcher.calls.retrieve(item.memTel)
        } else if (item.memTel && getBtnEnable('transfer', getTelStatus(item.memTel))) {
            this.setState({
                showTransferPanel: true,
                transferData: item
            })
        }
    }
    // 显示主视频弹框
    showVideo = (e, shankCall) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.setIsShowMainZdh(false);
        this.props.setIsShowSubZdh(true);
        if (window.scooper.videoManagers && window.scooper.videoManagers.videoController.isPlaying(shankCall.mainTel) > -1) {
            // 正在播放 显示出来
            $(".web-rtc-video").removeClass('hide');
        } else {
            // 未播放 进行播放操作
            window.scooper.videoManagers && window.scooper.videoManagers.videoController.playByOrderExpandWindow(shankCall.mainTel, shankCall.mainTel)
        }
    }
    // 显示副视频弹框
    showSubVideo = (e, shankCall) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.setIsShowSubZdh(false);
        this.props.setIsShowMainZdh(true);
        if (window.scooper.videoManagers && window.scooper.videoManagers.videoController.isPlaying(shankCall.subTel) > -1) {
            // 正在播放 显示出来
            $(".web-rtc-video").removeClass('hide');
        } else {
            // 未播放 进行播放操作
            window.scooper.videoManagers && window.scooper.videoManagers.videoController.playByOrderExpandWindow(shankCall.subTel, shankCall.subTel)
        }
    }
    /**
     * 主手柄点击 选中当前通话的成员
     */
    operClick = () => {
        let { shankCall, curSelectMem } = this.props;
        this.props.changeLoading(true);
        this.updateExpands(shankCall.mainDeptId, shankCall.mainMemId);
    }
    /**
     * 副手柄点击 选中当前通话的成员
     */
    subClick = () => {
        let { shankCall, curSelectMem } = this.props;
        if (curSelectMem.orgMemId == shankCall.subMemId) {
            return;
        }

        this.props.changeLoading(true);
        this.updateExpands(shankCall.subDeptId, shankCall.subMemId);
    }
    /**
     * 更新展开通讯录树节点
     * @param deptId  部门ID
     * @param orgMemId 人员ID
     */
    async updateExpands(deptId, orgMemId, isMember) {
        let { defaultKey, memList, curSelectGroup } = this.props;
        console.log(this.props)
        //当前在群组的tab页面，且 群组选中的组里边有当前人员
        if (defaultKey == 1) {
            if (curSelectGroup && curSelectGroup.id && curSelectGroup.id.toString().indexOf('temp-') > -1) {   //当前选中的是临时组
                this.searchGroup('temp', orgMemId, deptId)
            } else {
                this.searchGroup('', orgMemId, deptId);    //普通群组
            }
        } else {
            this.searchCore(deptId, orgMemId)   //通讯录模块
        }

    }
    /**
     * 在群组模块搜索
     */
    searchGroup = (temp, orgMemId, deptId) => {
        let { memList } = this.props;
        let realMemList = [];
        memList.map((item) => {
            if (item.id.toString().indexOf('none-') == -1) {  //没有 none 说明真的是有人的
                realMemList.push(item);
            }
        })
        let findItem = realMemList.find((list => list.orgMemId == orgMemId));
        if (findItem && findItem.groupId) {
            if (temp) {
                loadGroupMember('', '', 'temp', orgMemId);
            } else {
                loadGroupMember(findItem.groupId, 1, '', orgMemId);
            }
            let ids = "mem-" + orgMemId
            let a = document.getElementById(ids);
            if (a && orgMemId) {
                a.scrollIntoView(false);
            }
            this.props.changeLoading(false);
        } else {
            this.searchCore(deptId, orgMemId)
        }
    }
    /**
     * 在通讯录模块搜索
     * @param {*} deptId  部门id
     * @param {*} orgMemId 人员Id
     */
    searchCore = async (deptId, orgMemId) => {
        let { expandedKeys } = this.props;
        let datas = await apis.core.findDepartmentPath({ id: deptId });
        if (datas.code == 0) {
            this.props.setDefaultKey("2");
            let data = datas.data;
            data && data.map((item) => {
                let deptIds = "dept-" + item.id;
                let arr = expandedKeys.filter(items => items == deptIds);
                if (arr.length == 0) {
                    deptIds && expandedKeys.push(deptIds);
                }
            })
            this.props.setExpandedKeys([...expandedKeys]);
            let selectKey = ["dept-" + deptId]
            this.props.setSelectedKeys(selectKey);  //设置选中通讯录树节点
            let lastData = data[data.length - 1];  //最后一层的数据信息
            let curCore = {
                checked: false,
                data: lastData.orgCode,
                dataType: 'orgDept',
                deptType: lastData.deptType,
                isParent: true,
                id: lastData.id,
                name: lastData.deptName,
                pid: lastData.parentId,

            }
            this.props.setCurSelectCore(curCore);
            loadOrgMember(deptId, orgMemId, 1);  //加载该部门的人员数据
            this.props.changeLoading(false);
        } else {
            message.error("非通讯录人员，无法跳转！");
            this.props.changeLoading(false);
        }
    }
    componentWillReceiveProps(nextProps) {//componentWillReceiveProps方法中第一个参数代表即将传入的新的Props
        if (this.props.coreMemAll !== nextProps.coreMemAll) {
            this.updateView(nextProps.coreMemAll)
        }
    }
    updateView = (coreMemAll) => {
        let { shankCall } = this.props;
        setTimeout(() => {
            if (JSON.stringify(coreMemAll) != '{}' && shankCall.mainDeptId) {
                this.updateScroll(shankCall.mainDeptId, shankCall.mainMemId, coreMemAll);
            } else if (JSON.stringify(coreMemAll) != '{}' && shankCall.subDeptId) {
                this.updateScroll(shankCall.subDeptId, shankCall.subMemId, coreMemAll);
            }
        }, 100)
    }
    /**
     * 跳转至选中的节点
     */
    updateScroll = (deptId, orgMemId, coreMemAll) => {
        let ids = "mem-" + orgMemId
        let a = document.getElementById(ids);
        setTimeout(() => {
            if (a && orgMemId) {
                a.scrollIntoView(false);
                this.props.changeLoading(false);
            } else {
                if (coreMemAll.hasNextPage) {
                    loadOrgMember(deptId, orgMemId, coreMemAll.pageNum + 1);
                }
            }
        }, 100)
    }
    render() {
        let { dailVisible, isDailClick, showTransferPanel, transferData } = this.state;
        let { curSelectMem, isMainTalk, isSubTalk, shankCall, isShowTzly, isShowMainZdh, isShowSubZdh, centerOperTel } = this.props;
        let recordStatus = window.scooper.dispatchManager.accountDetail ? window.scooper.dispatchManager.accountDetail.callRecord : ''
        let accountDetail = window.scooper.dispatchManager.accountDetail
        return (
            <div className='signal-wrap'>
                <p className="signal-name">单呼功能</p>
                <div className='operate-wrap'>
                    {isMainTalk ?
                        <div className='main-operate main-talk' onClick={this.operClick}>
                            {shankCall.mainCallType == 'audio' && <i className='calling-audio'></i>}
                            {shankCall.mainCallType == 'video' && <i className='calling-video'></i>}
                            <span className='talk-name over-ellipsis'>{shankCall.mainMemName}</span>
                            <span className='talk-dutyName over-ellipsis'>{shankCall.mainDutyName}</span>
                            {isShowMainZdh && shankCall.mainCallType == 'video' && <i className='icon-zdh' onClick={(e) => { this.showVideo(e, shankCall) }}></i>}
                            <span className='talk-time'>{shankCall.mainLong}</span>
                        </div>
                        :
                        <div className='main-operate'>
                            <i className='icon-mainOp'></i>
                            <p className='operate-info'>当前无通话</p>
                        </div>
                    }

                    <Switch checkedChildren="主" unCheckedChildren="副" checked={centerOperTel} onChange={this.onChange} />
                    {isSubTalk ?
                        <div className='sub-operate sub-talk' onClick={this.subClick}>
                            <Button className={`dial-box ${isDailClick ? 'dial-box-sel' : ''}`} onClick={(e) => this.showDailOpen(e)}></Button>
                            <span className='talk-name over-ellipsis'>{shankCall.subMemName}</span>
                            <span className='talk-dutyName over-ellipsis'>{shankCall.subDutyName}</span>
                            {isShowSubZdh && shankCall.subCallType == 'video' && <i className='icon-zdh' onClick={(e) => { this.showSubVideo(e, shankCall) }}></i>}
                            <span className='talk-time'>{shankCall.subLong}</span>
                            {shankCall.subCallType == 'audio' && <i className='calling-audio'></i>}
                            {shankCall.subCallType == 'video' && <i className='calling-video'></i>}
                        </div>
                        :
                        <div className='sub-operate'>
                            <Button className={`dial-box ${isDailClick ? 'dial-box-sel' : ''}`} onClick={(e) => this.showDailOpen(e)}></Button>
                            <i className='icon-subOp'></i>
                            <p className='operate-info'>当前无通话</p>
                        </div>
                    }
                </div>
                <div className='signal-btns'>
                    {
                        curSelectMem.memTel && getBtnEnable('call', getTelStatus(curSelectMem.memTel)) &&
                        <Button
                            onClick={(e) => { this.makeCall(e, curSelectMem.memTel) }}
                            className="singal-call btn-normal" ><i className="icon-call"></i>呼叫
                        </Button>
                    }
                    {
                        curSelectMem.memTel && getBtnEnable('tripleHungup', getTelStatus(curSelectMem.memTel)) ?
                            <Button onClick={(e) => { this.tripleHungup(e, curSelectMem.memTel) }} className="triple-hungup"><i className="icon-call"></i>强拆</Button> :
                            curSelectMem.memTel && getBtnEnable('hungup', getTelStatus(curSelectMem.memTel)) &&
                            <Button className="singal-hungUp" onClick={(e) => { this.hungUp(e, curSelectMem.memTel) }}><i className="icon-hungup"></i>挂断</Button>
                    }
                    {((JSON.stringify(curSelectMem) == "{}") || ((!getBtnEnable('tripleHungup', getTelStatus(curSelectMem.memTel))) && (!getBtnEnable('call', getTelStatus(curSelectMem.memTel))) && (!getBtnEnable('hungup', getTelStatus(curSelectMem.memTel))))) &&
                        <Button className="singal-call btn-dis"><i className="icon-call-dis"></i>呼叫</Button>
                    }
                    <Button
                        onClick={(e) => { this.joinMeet(e, curSelectMem.memTel) }}
                        className={`join-meet ${(curSelectMem.memTel && getBtnEnable('meet', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'}`}>
                        <i className={`${(curSelectMem.memTel && getBtnEnable('meet', getTelStatus(curSelectMem.memTel))) ? 'icon-meet' : 'icon-meet-dis'}`}></i>加入会议
                    </Button>

                    <Button
                        onClick={(e) => { this.groupTurn(e, curSelectMem) }}
                        className={`one-talk ${(curSelectMem.memTel && getBtnEnable('groupturn', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'} `}>
                        <i className={`${(curSelectMem.memTel && getBtnEnable('groupturn', getTelStatus(curSelectMem.memTel))) ? 'icon-one' : 'icon-one-dis'}`}></i>一号通
                    </Button>

                    {recordStatus == 1 ?
                        // 大开关开启
                        <Button
                            className={`btn-record ${(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? 'btn-normal-on' : 'btn-dis'}`}>
                            <i className={`${(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? 'icon-record-on' : 'icon-record-dis'}`}></i>
                            {(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? '正在录音' : '录音'}
                        </Button>
                        :
                        // 大开关关着
                        isShowTzly == false ?
                            <Button
                                onClick={(e) => { this.callRecord(e, curSelectMem.memTel) }}
                                className={`btn-record ${(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'}`}>
                                <i className={`${(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? 'icon-record' : 'icon-record-dis'}`}></i>录音
                            </Button>
                            :
                            <Button
                                onClick={(e) => { this.callRecordEnd(e, curSelectMem.memTel) }}
                                className={`btn-record ${(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? 'btn-normal-tzly' : 'btn-dis'}`}>
                                <i className={`${(curSelectMem.memTel && getBtnEnable('record', getTelStatus(curSelectMem.memTel))) ? 'icon-record' : 'icon-record-dis'}`}></i>停止录音
                            </Button>
                    }

                    {(curSelectMem.memTel && getTelStatus(curSelectMem.memTel) == 'callst_hold') ?
                        <Button
                            className="btn-keep-take"
                            disabled={((accountDetail.mainTel && curSelectMem.memTel == accountDetail.mainTel) || (accountDetail.viceTel && curSelectMem.memTel == accountDetail.viceTel)) ? true : false}
                            onClick={(e) => { this.unhold(e, curSelectMem.memTel) }}>
                            <i className='icon-keep'></i>取回
                        </Button>
                        :
                        <Button onClick={(e) => { this.hold(e, curSelectMem.memTel) }} className={`btn-keep ${(curSelectMem.memTel && getBtnEnable('keep', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'}`}>
                            <i className={`${(curSelectMem.memTel && getBtnEnable('keep', getTelStatus(curSelectMem.memTel))) ? 'icon-keep' : 'icon-keep-dis'}`}></i>保持
                        </Button>
                    }
                    <Button
                        onClick={() => { this.showTransfer(curSelectMem) }}
                        className={`btn-transfer ${(curSelectMem.memTel && getBtnEnable('transfer', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'}`}>
                        <i className={`${(curSelectMem.memTel && getBtnEnable('transfer', getTelStatus(curSelectMem.memTel))) ? 'icon-transfer' : 'icon-transfer-dis'}`}></i>
                        {(curSelectMem.memTel && (getTelStatus(curSelectMem.memTel) == 'callst_transfering')) ? '取消转接' : '转接'}
                    </Button>
                    <Button
                        onClick={(e) => { this.tripleBreakin(e, curSelectMem.memTel) }}
                        className={`btn-breakin ${(curSelectMem.memTel && getBtnEnable('breakin', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'} `}>
                        <i className={`${(curSelectMem.memTel && getBtnEnable('breakin', getTelStatus(curSelectMem.memTel))) ? 'icon-breakin' : 'icon-breakin-dis'}`}></i>强插
                    </Button>
                    <Button
                        onClick={(e) => { this.tripleMonitor(e, curSelectMem.memTel) }}
                        className={`btn-monitor ${(curSelectMem.memTel && getBtnEnable('monitor', getTelStatus(curSelectMem.memTel))) ? 'btn-normal' : 'btn-dis'}`}>
                        <i className={`${(curSelectMem.memTel && getBtnEnable('monitor', getTelStatus(curSelectMem.memTel))) ? 'icon-monitor' : 'icon-monitor-dis'}`}></i>监听
                    </Button>
                </div>
                {dailVisible && <DailModal visible={dailVisible} hidePop={this.hidePop} />}
                {showTransferPanel && <TransferModal visible={showTransferPanel} data={transferData} isBack="hide" hidePop={this.hidePop} />}
            </div>
        );
    }
}

export default SingleCall;