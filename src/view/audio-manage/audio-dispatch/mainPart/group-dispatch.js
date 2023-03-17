/*
 * @File: 语音调度-中间群组功能
 * @Author: liulian
 * @Date: 2020-06-11 11:25:29
 * @version: V0.0.0.1
 * @LastEditTime: 2021-08-31 15:37:10
 */
import React, { Component } from "react";
import { Button, Modal, message } from "antd";
import GroupModal from './groupNotify/group-modal'
import { connect } from 'react-redux';
import { setConfigData, setNavArr } from '../../../../reducer/loading-reducer'
import { setIsShowCheck, setCurSeleceMem, setCurGroupCallMeetId, setCheckedList, setMakeTemp, setIsRollCall, setCurSelectAudio, setIsGroupTurn, setIsSelectCall, setBoardCast } from '../../../../reducer/audio-handle-reducer'
import dispatchManager from "../../../../util/dispatch-manager";
import timeUtil from "../../../../util/time-util";
import { loadGroupMember } from "../../../../util/method";
import { withRouter } from "react-router-dom";

const { confirm } = Modal

@withRouter
@connect(
    state => state.loading,
    { setConfigData, setNavArr, }
)
@connect(
    state => state.audioHandle,
    { setIsShowCheck, setCurSeleceMem, setCurGroupCallMeetId, setCheckedList, setMakeTemp, setIsRollCall, setCurSelectAudio, setIsGroupTurn, setIsSelectCall, setBoardCast }
)
class GroupDispatch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupVisible: false,
            mems: [],
        }
    }

    /**
     * 打开组呼通知弹框
     */
    openGroupModal = () => {
        let { checkedList, memList, isShowCheck, configData } = this.props;
        let mems = [];
        if (checkedList.length > 0 || isShowCheck) {
            mems = checkedList;
        } else {
            let maxSelcetLength = configData.set["disp.set.multSelect.max"];
            let realMemList = [];
            if (memList.length > 0) {
                memList.forEach((item) => {
                    if (item.id.toString().indexOf('none-') < 0) {
                        realMemList.push(item)
                    }
                })
            }
            if (realMemList.length > maxSelcetLength) {
                message.error("超出可复选最大人数【" + maxSelcetLength + "】，自动去除多余成员");
                realMemList.splice(maxSelcetLength, realMemList.length - maxSelcetLength)
            }
            realMemList.map((mem) => {
                if (mem.memTel) {
                    mems.push(mem)
                }
            })
        }
        this.setState({
            mems: mems,
            // recMems:JSON.parse(JSON.stringify(checkedList)),
            groupVisible: true,
        })
        this.props.setCurSelectAudio({})
    }
    /**
     * 组呼/选呼
     */
    selectCall = (tag) => {
        let { checkedList, curSelectGroup, curSelectCore, defaultKey } = this.props;
        let name = '';
        let title = '';
        let tagTitle = '';
        if (tag == 'selectCall' && checkedList.length == 0) {
            tagTitle = '组呼'
        }
        if (tag == 'selectCall' && checkedList.length > 0) {
            tagTitle = '选呼'
        }
        if (tag == 'boardCast') {
            tagTitle = '广播'
        }
        if (tag == 'groupTurn') {
            tagTitle = '轮询'
        }
        if (defaultKey == 1) {
            name = curSelectGroup.groupName || ''
        } else if (defaultKey == 2 && curSelectCore.name) {
            name = curSelectCore.name || ''
        } else {
            name = curSelectGroup.groupName || ''
        }
        if (checkedList.length == 0) {
            if (name) {
                title = '是否对<' + name + '>发起' + tagTitle + '?';
                this.showConfirm(title, tag, true);
            } else {
                message.error("请选择人员或群组发起" + tagTitle);
            }

        } else {
            title = '是否对 ' + checkedList[0].name + ' 等' + checkedList.length + '成员发起' + tagTitle + '?';
            this.showConfirm(title, tag, false);
        }


    }
    /**
     * 组呼/选呼二次弹框确认
     * @param {*} title 弹框名称
     * @param {*} tag 组呼/轮询/广播
     * @param {*} isGroupCall 是否发起组呼
     */
    showConfirm = (title, tag, isGroupCall) => {
        let _this = this;
        confirm({
            title: title,
            content: '',
            onOk() {
                if (tag == 'selectCall') {
                    _this.selectCallOk(isGroupCall);
                } else if (tag == 'boardCast') {
                    _this.boradCast(isGroupCall);
                } else if (tag == 'groupTurn') {
                    _this.groupTurn(isGroupCall);
                }

            },
            onCancel() {
                _this.selectCallCancel(tag);
            }
        })
    }
    /**
     * 判断是否超出最大选择人数 若超过自动去除多余人员
     */
    isMoreThanMaxSelect = () => {
        let { configData, memList } = this.props;
        let maxSelcetLength = configData.set["disp.set.multSelect.max"];
        let realMemList = [];
        let [...list] = memList
        if (list.length > 0) {
            list.forEach((item) => {
                if (item.id.toString().indexOf('none-') < 0) {
                    realMemList.push(item)
                }
            })
        }
        let [...newList] = realMemList;
        if (newList.length > maxSelcetLength) {
            message.error("超出可复选最大人数【" + maxSelcetLength + "】，自动去除多余成员");
            newList.splice(maxSelcetLength, newList.length - maxSelcetLength)
        }
        return newList
    }
    /**
     * 确定组呼/选呼 
     */
    selectCallOk = (isGroupCall) => {
        let { checkedList } = this.props;
        let newMemList = [];
        let tels = [];
        if (checkedList.length > 0) {
            checkedList.map((item) => {
                tels.push(item.memTel);
            })
        } else {
            newMemList = this.isMoreThanMaxSelect();
            newMemList.map((mem) => {
                if (mem.memTel) {
                    if (mem.id.toString().indexOf('none-') < 0) {
                        tels.push(mem.memTel)
                    }
                }
            })
        }
        if (tels.length > 0) {
            dispatchManager.dispatcher.calls.selectCall(tels, '', '', '', (data) => {
                if (data.code == 0) {
                    let desc = data.data && data.data.description;
                    this.props.setCurGroupCallMeetId(desc.id || '')
                }
            });
            this.props.setIsSelectCall("2");  // 2 黄色
            this.props.setBoardCast("3");   //3 不可点击
            if (checkedList.length > 0 && !isGroupCall) {
                this.makeTempGroup(checkedList);
            } else if (newMemList.length > 0 && !isGroupCall) {
                this.makeTempGroup(newMemList);
            }
        } else {
            message.error("人员不能为空");
            return;
        }
    }

    /**
     * 结束 选呼/组呼/广播
     */
    stopSelectCall = () => {
        dispatchManager.dispatcher.calls.selectCancel(this.props.curGroupCallMeetId || '');
        this.props.setIsSelectCall("1");
        this.props.setBoardCast("1");
    }
    /**
     * 取消组呼/选呼
     */
    selectCallCancel = (tag) => {
        console.log(tag + " :取消");
    }
    /**
     * 形成临时组
     */
    makeTempGroup = (checkedList) => {
        let { curSelectGroup, defaultKey } = this.props;
        let groupName = [];
        checkedList.map((item, index) => {
            if (item.id.toString().indexOf('none-') < 0) {
                groupName.push(item.name || item.memTel)
            } else {
                checkedList.splice(index, 1)
            }
        })
        let tempItem = {
            id: 'temp-' + timeUtil.getTimeStamp(),
            centerId: dispatchManager.accountDetail.centerId,
            corpId: dispatchManager.accountDetail.corpId,
            groupName: groupName.join("、"),
            maxMemNum: groupName.length,
            groupType: 0,
            sortIndex: 0
        }
        sessionStorage.setItem("tempItem", JSON.stringify(tempItem));
        sessionStorage.setItem("tempMemList", JSON.stringify(checkedList));
        if (defaultKey == 1 && curSelectGroup.id.toString().indexOf("temp") >= 0) {
            loadGroupMember('', '', "temp");
        }
    }
    /**
    * 隐藏弹框
    */
    hidePop = (tag) => {
        this.setState({
            [tag]: false
        })
    }
    // 广播
    boradCast = (isGroupCall) => {
        let { checkedList, memList } = this.props;
        let newMemList = [];
        let tels = [];
        if (checkedList.length > 0) {
            checkedList.map((item) => {
                tels.push(item.memTel);
            })
        } else {
            newMemList = this.isMoreThanMaxSelect();
            newMemList.map((mem) => {
                if (mem.id.toString().indexOf('none-') < 0) {
                    tels.push(mem.memTel)
                }
            })
        }
        if (tels.length > 0) {
            if (checkedList.length > 0 && !isGroupCall) {
                this.makeTempGroup(checkedList);
            } else if (newMemList.length > 0 && !isGroupCall) {
                this.makeTempGroup(newMemList);
            }
            this.props.setIsSelectCall("3");  // 2 黄色
            this.props.setBoardCast("2");   //3 不可点击
            // let id = getMainMeetId();
            dispatchManager.dispatcher.calls.selectCall(tels, '', false, true, (data) => {
                if (data.code == 0) {
                    let desc = data.data && data.data.description;
                    this.props.setCurGroupCallMeetId(desc.id || '')
                }
            })
        } else {
            message.error("人员不能为空");
            return;
        }

    }
    // 点名确认框
    rollcallConfirm = () => {
        let { checkedList, curSelectGroup, curSelectCore, defaultKey } = this.props;
        let name = '';
        let title = '';
        if (defaultKey == 1) {
            name = curSelectGroup.groupName || '';
        } else if (defaultKey == 2) {
            name = curSelectCore.name || '';
        }
        if (checkedList.length == 0) {
            if (name) {
                title = '是否对<' + name + '>发起点名?';
                this.rollcall(title, true);
            } else {
                message.error("请选择人员或群组发起点名")
            }

        } else {
            title = '是否对 ' + checkedList[0].name + ' 等' + checkedList.length + '成员发起点名?';
            this.rollcall(title, false);
        }

    }
    // 点名
    rollcall = (title, isGroupCall) => {
        let _this = this;
        confirm({
            title: title,
            content: '',
            onOk() {
                _this.rollCallOk(isGroupCall);
            },
            onCancel() {
                _this.rollCallCancel(isGroupCall);
            }
        })
    }
    rollCallOk = (isGroupCall) => {
        let { checkedList } = this.props;
        let newMemList = [];
        let tels = [];
        if (checkedList.length > 0) {
            checkedList.map((item) => {
                tels.push(item.memTel);
            })
        } else {
            newMemList = this.isMoreThanMaxSelect();
            newMemList.map((mem) => {
                if (mem.id.toString().indexOf('none') < 0) {
                    tels.push(mem.memTel)
                }
            })
        }
        if (tels.length > 0) {
            if (checkedList.length > 0 && !isGroupCall) {
                this.makeTempGroup(checkedList);
            } else if (newMemList.length > 0 && !isGroupCall) {
                this.makeTempGroup(newMemList);
            }
            dispatchManager.dispatcher.calls.rollCall(tels);
            this.props.setIsRollCall(true);
        } else {
            message.error("人员不能为空");
            return;
        }

    }
    rollCallCancel = (isGroupCall) => {
        console.log("取消点名");
    }
    /**
     * 结束点名
     */
    stopRollCall = () => {
        dispatchManager.dispatcher.calls.stopRollCall();
        this.props.setIsRollCall(false)
    }
    // 轮询
    groupTurn = (isGroupCall) => {
        let { checkedList, memList } = this.props;
        let newMemList = [];
        let tels = [];
        if (checkedList.length > 0) {
            checkedList.map((item) => {
                tels.push(item.memTel);
            })

        } else {
            newMemList = this.isMoreThanMaxSelect();
            newMemList.map((mem) => {
                if (mem.id.toString().indexOf('none') < 0) {
                    tels.push(mem.memTel)
                }
            })
        }
        if (tels.length > 0) {
            if (checkedList.length > 0 && !isGroupCall) {
                this.makeTempGroup(checkedList);
            } else if (newMemList.length > 0 && !isGroupCall) {
                this.makeTempGroup(newMemList);
            }
            dispatchManager.dispatcher.calls.groupTurn(tels, false);
            this.props.setIsGroupTurn(true)
        } else {
            message.error("人员不能为空");
            return;
        }

    }
    /**
     * 结束轮询
     */
    stopGroupTurn = () => {
        dispatchManager.dispatcher.calls.stopGroupTurn();
        this.props.setIsGroupTurn(false)
    }
    setRecMems = (data) => {
        this.setState({
            recMems: data
        })
    }
    /**
     * 得到跳转传真||短信的号码信息
     */
    getJumpInfo = (type) => {
        let { navArr, checkedList, configData } = this.props;
        let sendTel = ""
        let notSendMemNameArr = [];
        if (checkedList.length == 0) {
            message.error("请先选择人员");
            return;
        } else {
            let telArr = [];
            checkedList.forEach((item) => {
                let origLength = telArr.length;
                type == "fax" && item.memFax && telArr.push(item.memFax);
                type == 'sms' && item.memMobile && telArr.push(item.memMobile);
                if (origLength == telArr.length) {
                    notSendMemNameArr.push(item.name)
                }
            })
            sendTel = telArr.join(",")
        }
        if (!sendTel) {
            message.error("选择成员没有配置可操作的号码");
        } else if (notSendMemNameArr.length) {
            let title = "选中成员【" + notSendMemNameArr.join(", ") + "】未配置可操作号码，是否继续？"

            this.showJumpConfirm(title, sendTel, type);

        } else {
            this.jumpOk(sendTel, type)
        }
    }

    /**
     * 跳转确认框
     */
    showJumpConfirm = (title, sendTel, type) => {
        let _this = this;

        confirm({
            title: title,
            content: '',
            onOk() {
                _this.jumpOk(sendTel, type);

            },
            onCancel() {

            }
        })
    }
    /**
     * 确定跳转
     */
    jumpOk = (sendTel, type) => {
        let { navArr, configData } = this.props;
        let param = "&opType=send&tels=" + sendTel;;
        const items = navArr.find(item => item.key == type);
        if (configData.set['disp.set.module.loadTogether'] == 1) {
            // 1":"各模块初次切换加载，后续切换显隐"
            if (items.key) {
                window.top.$(".iframe-" + items.key).attr("src", items.url + param);
                window.top.$(".content-fream").hide();
                window.top.$(".iframe-" + items.key).show();
                navArr.forEach(element => {
                    if (window.top.$("#nav-" + element.key).hasClass("checked-style")) {
                        window.top.$("#nav-" + element.key).removeClass("checked-style")
                    }
                });
                window.top.$("#nav-" + items.key).addClass("checked-style");
            }
        } else {
            // 3 :初次单加载，切换重新加载(路由)
            if (type == 'fax') {
                this.props.history.push({ pathname: '/main/fax', state: { faxsrc: items.url + param } });
            } else if (type == 'sms') {
                this.props.history.push({ pathname: '/main/sms', state: { smssrc: items.url + param } });
            }
        }
    }

    render() {
        let { modalData, groupVisible, mems } = this.state;
        let { checkedList, isRollCall, isGroupTurn, isSelectCall, isBoardCast, memList, configData } = this.props;
        return (
            <div className='group-wrap'>
                <p className="group-name">群组功能</p>
                <div className='btn-group'>
                    <Button className="group-notify" onClick={() => { this.openGroupModal() }}><i className="icon-group-notify"></i>组呼通知</Button>
                    {isSelectCall == 1 &&
                        <Button className="group-call" onClick={() => this.selectCall('selectCall')}><i className="icon-group"></i>{checkedList.length > 0 ? '选呼' : '组呼'}</Button>
                    }
                    {isSelectCall == 2 &&
                        <Button className="group-call-sel" onClick={() => this.stopSelectCall('')}><i className="icon-gr oup"></i>{checkedList.length > 0 ? '结束选呼' : '结束组呼'}</Button>
                    }
                    {isSelectCall == 3 &&
                        <Button className="group-call-dis"><i className="icon-group-dis"></i>{checkedList.length > 0 ? '选呼' : '组呼'}</Button>
                    }
                    {isBoardCast == 1 &&
                        <Button className="group-borad" onClick={() => this.selectCall('boardCast')}><i className="icon-board"></i>广播</Button>
                    }
                    {isBoardCast == 2 &&
                        <Button className="group-borad-sel" onClick={() => { this.stopSelectCall('') }}><i className="icon-board"></i>结束广播</Button>
                    }
                    {isBoardCast == 3 &&
                        <Button className="group-borad-dis" ><i className="icon-board-dis"></i>广播</Button>
                    }
                    {isRollCall ?
                        <Button className="group-dianming-sel" onClick={() => { this.stopRollCall() }}><i className="icon-dianming"></i>结束点名</Button>
                        :
                        <Button className="group-dianming" onClick={() => { this.rollcallConfirm() }}><i className="icon-dianming"></i>点名</Button>
                    }
                    {isGroupTurn ?
                        <Button className="group-lx-sel" onClick={() => { this.stopGroupTurn() }}><i className="icon-lx"></i>结束轮询</Button>
                        :
                        <Button className="group-lx" onClick={() => this.selectCall('groupTurn')}><i className="icon-lx"></i>轮询</Button>
                    }
                    {(JSON.stringify(configData) !== '{}' && configData.set['disp.set.show.sms'] == "true") ?
                        <Button className="group-msg" onClick={() => { this.getJumpInfo('sms') }}><i className="icon-msg"></i>短信</Button>
                        :
                        <Button className="group-msg-dis"><i className="icon-msg-dis"></i>短信</Button>
                    }
                    {(JSON.stringify(configData) !== '{}' && configData.set['disp.set.show.fax'] == "true") ?
                        <Button className="group-fax" onClick={() => { this.getJumpInfo('fax') }}><i className="icon-fax"></i>传真</Button>
                        :
                        <Button className="group-fax-dis"><i className="icon-fax-dis"></i>传真</Button>
                    }
                </div>

                {groupVisible && <GroupModal visible={groupVisible} hidePop={this.hidePop} recMems={mems} />}
            </div>
        );
    }
}

export default GroupDispatch;