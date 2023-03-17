/*
 * @File: 语音调度-中间人员列表
 * @Author: liulian
 * @Date: 2020-06-11 11:20:49
 * @version: V0.0.0.1
 * @LastEditTime: 2022-04-06 16:28:53
 */
import React, { Component } from "react";
import MemDetail from './mem-detail';
import { Checkbox, Alert, message } from 'antd';
import $ from 'jquery'
import Member from './mem';
import AddMember from '../../../../component/add-member';
import InfiniteScroll from 'react-infinite-scroller'
import { isEmpty } from 'lodash';
import { TEL_STATUS_VAL, addMemTitle } from '../../../../config/constants';
import { setCurMemList, getTelStatus, fillMem, loadGroupMember, loadGroupList, loadOrgMember, hideTel, isNotNull, getDeptName, } from '../../../../util/method'
import { connect } from 'react-redux';
import { setConfigData } from '../../../../reducer/loading-reducer'
import { setShowEdit, setMemList, setCurSeleceMem, setCheckedList, setMemMapCache, setRealMemListLen, setIsShowCheck, setIsCheckAll, setCurSelectCore } from '../../../../reducer/audio-handle-reducer'
import { apis } from "../../../../util/apis";
import dispatchManager from "../../../../util/dispatch-manager";
import timeUtil from "../../../../util/time-util";

let memCount = 0;

@connect(
    state => state.loading,
    { setConfigData }
)
@connect(
    state => state.audioHandle,
    { setShowEdit, setMemList, setCurSeleceMem, setCheckedList, setMemMapCache, setRealMemListLen, setIsShowCheck, setIsCheckAll, setCurSelectCore }
)
class MemberList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memModalVisible: false,    //人员选择器弹框
            // curSelectMem:{}, //当前选中的人员
            // isShowCheck: false,   //是否多选
            // isCheckAll:false, //是否全选
            memDetailVisible: false,  //人员详情框
            memItem: {}, //人员详情信息
            // checkedList:[], //选择的人员数据
            showAll: false,  //显示全部
            checkListEdit: false,  //已选择列表是否编辑
            liLength: 0,
            mainSymbol: '',   //主号码标识
            hasMore: true, //列表分页 是否还有更多
        }
        this.moveCard = this.moveCard.bind(this)
        this.findCard = this.findCard.bind(this)
    }


    findCard(id) {
        let { memList } = this.props;
        const mem = memList.find(mem => mem.orgMemId === id)
        return {
            mem,
            index: mem.sortIndex
        }
    }
    async moveCard(id, atIndex) {
        let { curSelectGroup } = this.props;
        const { index } = this.findCard(id);
        // console.log("atIndex:", atIndex);   //要放的 sortIndex
        // console.log("index:", index);       //原来的 sortIndex
        // console.log(id);   //人员id
        // console.log(curSelectGroup);  //curselect.id:当前组id
        // console.log(curSelectCore);  //curselectCore.id : 当前部门id
        let params = {
            memId: id,
            groupId: curSelectGroup.id,
            newIndex: atIndex
        }
        let data = await apis.disp.resetSort(params);
        if (data.code == 0) {
            message.success("移动成功")
            loadGroupMember(curSelectGroup.id, 1)
        }
    }
    componentDidMount() {
        fillMem();
    }

    componentWillReceiveProps(nextProps) {//componentWillReceiveProps方法中第一个参数代表即将传入的新的Props
        if (this.props.memMapCache !== nextProps.memMapCache) {
            setCurMemList(nextProps.memMapCache, 'name');
            fillMem();
        }
    }

    // 点击人员
    memClick = (item) => {
        let { configData } = this.props;
        let _this = this;
        if (Object.keys(configData).length !== 0 && configData.set["disp.set.doubleClickCall"] == 'true') {
            memCount += 1;
            setTimeout(() => {
                if (memCount == 1) {
                    // 单击
                    _this.memOnlyClick(item);
                } else if (memCount == 2) {
                    // 双击
                    _this.memDoubleClick(item);
                }
                memCount = 0;
            }, 300)
        } else {
            _this.memOnlyClick(item)
        }
    }
    /**
     * 单击人员
     */
    memOnlyClick = (item) => {
        let { isShowCheck } = this.props;
        let { checkedList, isShowEdit, configData } = this.props;
        let { memList, curSelectMem } = this.props;
        let maxSelcetLength = configData.set["disp.set.multSelect.max"]
        if (item.id.toString().indexOf('none-') == -1) {
            if (isShowCheck) {
                // 多选时点击人员列表
                memList && memList.forEach((mem) => {
                    if (mem.orgMemId == item.orgMemId && mem.id != 'mem-add') {
                        mem.isCheck = !mem.isCheck;
                        if (mem.isCheck == true) {
                            if (checkedList.length >= maxSelcetLength) {
                                message.error("复选人数不能超过" + maxSelcetLength + "人");
                                mem.isCheck = false
                                return;
                            }
                            let Arr = checkedList.filter(item => item.orgMemId == mem.orgMemId);
                            if (Arr.length == 0) {
                                checkedList.push(mem)
                            }
                        }
                        if (mem.isCheck == false) {
                            checkedList.forEach((checkMem, i) => {
                                if (checkMem.orgMemId == mem.orgMemId) {
                                    checkedList.splice(i, 1);
                                }
                            })
                        }
                    }
                })
                this.props.setMemList([...memList]);
                this.props.setCheckedList([...checkedList])
            } else {
                // 普通单选
                memList && memList.forEach((mem) => {
                    if (mem.id == item.id && mem.id != 'mem-add') {
                        mem.onSel = !mem.onSel;
                        if (mem.onSel) {
                            curSelectMem = mem
                        } else {
                            curSelectMem = {}
                        }

                    } else {
                        mem.onSel = false
                    }
                })
                this.props.setMemList(memList);
                this.props.setCurSeleceMem(curSelectMem)
            }
        }
        // 点击的是编辑状态下的 那个 人员 加号
        if (item.id == 'mem-add' && isShowEdit) {
            // 新增人员
            this.addMem();
        }
    }
    /**
     * 双击人员
     */
    memDoubleClick = (item) => {
        if (item.memTel) {
            let businessId = dispatchManager.accountDetail.operatorId + "_" + timeUtil.getTimeStamp();
            dispatchManager.dispatcher.calls.makeCall(item.memTel, businessId);
        }
    }
    /**
     * 新增人员
     */
    addMem = () => {
        this.setState({
            memModalVisible: true
        })
    }
    /**
     * 获取人员选择器 人员  返回的人员数据
     */
    getMemData = (memData) => {
        let { curSelectGroup } = this.props;
        if (memData.length == 0) {
            this.setState({
                memModalVisible: false,
            })
            return;
        }
        let idsArr = [];
        let groupId = curSelectGroup.id;
        let centerId = dispatchManager.accountDetail.centerId;
        (memData.length > 0) && memData.map((item) => {
            idsArr.push(item.id);
        })
        let ids = idsArr.join(",");
        let params = {
            memIds: ids,
            groupId,
            centerId
        }
        this.saveMultiDispMember(params);
    };
    /**
     * 批量新增快捷组成员
     */
    saveMultiDispMember = async (params) => {
        let data = await apis.dispatch.saveMultiDispMember(params);
        // 接口改动适配  
        if (data || data.obj == 0) {
            message.success("添加成功");
            loadGroupList(params.groupId);
            loadGroupMember(params.groupId, 1);
            this.setState({
                memModalVisible: false,
            })
        }
    }
    /**
     * 人员删除
     */
    memDelete = async (e, mem) => {
        e.stopPropagation();
        let { curSelectGroup } = this.props;
        if (curSelectGroup.id.toString().indexOf("temp") > -1) {
            message.error("临时组不允许编辑")
            return;
        }
        let ids = mem.id;
        let data = await apis.dispatch.deleteDispMember({ ids: ids });
        if (data.obj == 0) {
            loadGroupList(curSelectGroup.id);
            loadGroupMember(curSelectGroup.id, 1);
            message.success("删除成功");
        }
    }
    /**
     * 人员详情
     */
    memDetail = (e, mem) => {
        e.stopPropagation()
        let length = 0;
        if (mem.memMobile) {
            length = length + 1
        }
        if (mem.memTel2) {
            length = length + 1
        }
        if (mem.memFax) {
            length = length + 1
        }
        if (mem.memJkTel) {
            length = length + 1
        }
        if ((mem.memMsgTel && mem.devCodeZfy) || mem.memMsgTel) {
            length = length + 1
        }
        this.getMainTel(mem);
        this.setState({
            memItem: mem,
            memDetailVisible: true,
            liLength: length,
        })
    }
    /**
     * 主号码标识
     */
    getMainTel = (mem) => {
        let mainSymbol = '';
        if (mem.memTel == mem.memMobile) {
            mainSymbol = 'memMobile'
        } else if (mem.memTel == mem.memTel2) {
            mainSymbol = 'memTel2'
        } else if (mem.memTel == mem.memFax) {
            mainSymbol = 'memFax'
        } else if (mem.memTel == mem.memJkTel) {
            mainSymbol = 'memJkTel'
        } else if (mem.memTel == mem.memMsgTel) {
            mainSymbol = 'memMsgTel'
        } else {
            mainSymbol = ''
        }
        this.setState({
            mainSymbol
        })
    }

    /**
    * 隐藏弹框
    * */
    hidePop = (tag) => {
        this.setState({
            [tag]: false
        })
    };
    /**
     * 多选按钮点击
     */
    moreCheck = () => {
        let { isShowCheck, isShowEdit } = this.props;
        if (isShowEdit) {
            // 编辑模式下不允许复选
            message.info("编辑模式下不允许多选");
            return;
        }
        let { memList } = this.props;
        memList && memList.forEach((mem) => {
            mem.onSel = false
        })
        this.props.setIsShowCheck(!isShowCheck);
        this.props.setMemList(memList);
        this.props.setCurSeleceMem({})
    }
    /**
     * 全选
     */
    checkAll = async () => {
        let { memList, checkedList, isCheckAll, curSelectGroup, curSelectCore, defaultKey, curSelectMem, memMapCache, configData } = this.props;
        let maxSelctLength = configData.set["disp.set.multSelect.max"];
        let allDispData;
        let allCoreData;
        let tempList;
        isCheckAll = !isCheckAll;
        if (defaultKey == 1) {
            if (sessionStorage.getItem('tempItem') && curSelectGroup.id.toString().indexOf('temp') > -1) {
                if (isCheckAll) {
                    // 全选临时组
                    tempList = JSON.parse(sessionStorage.getItem('tempMemList'));
                    tempList.map((temp, index) => {
                        temp.onsel = false;
                        temp.isDel = false;
                        temp.isCheck = true;
                    })
                } else {
                    // 全不选临时组
                    tempList = JSON.parse(sessionStorage.getItem('tempMemList'));
                    tempList.map((temp, index) => {
                        temp.onsel = false;
                        temp.isDel = false;
                        temp.isCheck = false;
                    })
                }

                sessionStorage.setItem('tempMemList', JSON.stringify(tempList))
            } else {
                //群组
                allDispData = await apis.dispatch.listOrgMember({ groupId: curSelectGroup.id });
                allDispData.map((item, index) => {
                    item.onsel = false;
                    item.isDel = false;
                    item.isCheck = true;
                    let deptName = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].deptName)) ? memMapCache[item.orgMemId].deptName : '');
                    item.deptName = getDeptName(deptName, item.dutyName);
                    item.sourceType = 'group';
                    item.devCodeZfy = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeZfy)) ? memMapCache[item.orgMemId].devCodeZfy : '');
                    item.devCodeJx = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeJx)) ? memMapCache[item.orgMemId].devCodeJx : '');
                    item.devCodeJk = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeJk)) ? memMapCache[item.orgMemId].devCodeJk : '');

                    if (item.orgMemId == curSelectMem.orgMemId) {
                        item.onSel = true
                    }
                })
            }

        } else if (defaultKey == 2 && JSON.stringify(curSelectCore) != '{}') {
            // 通讯录
            allCoreData = await apis.core.listOrgMember({ deptId: curSelectCore.id });
            allCoreData.map((item) => {
                item.orgMemId = item.id;
                item.deptName = getDeptName(item.deptName, item.dutyName);
                if (item.orgMemId == curSelectMem.orgMemId) {
                    item.onSel = true
                }
            })
        }
        if (isCheckAll) {
            // 全选
            memList && memList.forEach((mem) => {
                if (mem.id.toString().indexOf('none') < 0 && checkedList.length < maxSelctLength) {
                    mem.isCheck = true;
                    let Arr = checkedList.filter(item => item.orgMemId == mem.orgMemId);
                    if (Arr.length == 0) {
                        checkedList.push(mem)
                    }
                }
            })
            // 临时组全选
            tempList && tempList.map((tem) => {
                let findList = checkedList.filter(item => item.orgMemId == tem.orgMemId);
                if (findList.length == 0) {
                    checkedList.push(tem);
                }
            })

            // 群组全选
            allDispData && allDispData.map((disp, index) => {
                let findList = checkedList.filter(item => item.orgMemId == disp.orgMemId);
                if (findList.length == 0) {
                    checkedList.push(disp);
                }
            })
            // 通讯录全选
            allCoreData && allCoreData.map((core, index) => {
                let findList = checkedList.filter(item => item.orgMemId == core.orgMemId);
                if (findList.length == 0) {
                    checkedList.push(core);
                }
            })
        } else {
            // 取消全选
            memList && memList.forEach((mem, i) => {
                mem.isCheck = false;
                mem.isDel = false;
                if (mem.isCheck == false) {
                    checkedList.forEach((item, index) => {
                        if (item.orgMemId == mem.orgMemId) {
                            checkedList.splice(index, 1);
                        }
                    })
                }
            })

            // 临时组取消全选
            tempList && tempList.map((tem) => {
                let findList = checkedList.filter(item => item.orgMemId == tem.orgMemId);
                if (findList.length > 0) {
                    checkedList.map((item, i) => {
                        if (item.orgMemId == findList[0].orgMemId) {
                            checkedList.splice(i, 1);
                        }
                    })
                }
            })
            // 群组取消全选   
            allDispData && allDispData.map((disp, index) => {
                let findList = checkedList.filter(item => item.orgMemId == disp.orgMemId);
                if (findList.length > 0) {
                    checkedList.map((item, i) => {
                        if (item.orgMemId == findList[0].orgMemId) {
                            checkedList.splice(i, 1);
                        }
                    })
                }
            })
            // 通讯录取消全选
            allCoreData && allCoreData.map((core, index) => {
                let findList = checkedList.filter(item => item.orgMemId == core.orgMemId);
                if (findList.length > 0) {
                    checkedList.map((item, i) => {
                        if (item.orgMemId == findList[0].orgMemId) {
                            checkedList.splice(i, 1);
                        }
                    })
                }
            })
            this.setState({
                showAll: false,
                checkListEdit: false
            })
        }
        let finalcheckList = [...checkedList];

        // tempList && tempList.map((temp)=>{
        //     let findLists = finalcheckList.filter(item => item.orgMemId == temp.orgMemId);
        //     if(findLists.length>0){
        //         tempList.map((it)=>{
        //             if(it.orgMemId == findLists[0].orgMemId){
        //                 it.isCheck = true;
        //             }
        //         })
        //     }
        // })
        // sessionStorage.setItem('tempMemList',JSON.stringify(tempList))


        if (finalcheckList.length > maxSelctLength) {
            message.error("复选人员不能超过" + maxSelctLength + "人");
            finalcheckList.length = maxSelctLength;
            this.props.setCheckedList(finalcheckList)
        } else {
            this.props.setCheckedList(finalcheckList)
        }
        this.props.setIsCheckAll(isCheckAll);
        this.props.setMemList([...memList]);
    }
    /**
     * 取消多选
     */
    cancleCheckMore = () => {
        let { isShowCheck } = this.props;
        let { memList } = this.props;
        memList && memList.forEach((mem) => {
            mem.isCheck = false
        })
        this.setState({
            showAll: false,
        })
        this.props.setIsCheckAll(false);
        this.props.setIsShowCheck(!isShowCheck)
        this.props.setCheckedList([])
        this.props.setMemList([...memList]);
    }
    /**
     * 显示所有选中列表
     */
    showAllCheckList = () => {
        let { showAll } = this.state;
        this.setState({
            showAll: !showAll
        })
    }

    /**
     * 点击编辑
     */
    memEdit = () => {
        let { memList, realMemListLen, defaultKey, isShowCheck, curSelectGroup } = this.props;
        if (isShowCheck) {
            // 多选模式下不允许编辑
            message.info("多选模式下不允许编辑");
            return;
        }
        if (defaultKey == 2) {
            message.info("不支持通讯录编辑");
        }
        if (defaultKey == 1 && curSelectGroup.id && curSelectGroup.id.toString().indexOf("temp") >= 0) {
            message.info("临时组不允许编辑");
            return;
        }
        if (defaultKey == 1) {
            this.props.setShowEdit(true);

            memList && memList.forEach((mem) => {
                mem.isDel = true;
                mem.onSel = false
            });
            memList.unshift({ isDel: false, isCheck: false, id: 'mem-add', centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
            if (realMemListLen < 20) {
                memList.splice(memList.length - 1, 1)
            }

            this.props.setMemList([...memList]);
        }
    }
    /**
     * 编辑完成
     */
    editComplete = () => {
        let { memList } = this.props;
        let count = 0;
        this.props.setShowEdit(false)
        memList && memList.forEach((mem, index) => {
            mem.isDel = false;
            if (mem.id.toString() != 'mem-add' && mem.id.toString().indexOf('none') <= -1) {
                count++
            }
            if (mem.id.toString() == 'mem-add') {
                memList.splice(index, 1)
            }
        })
        this.props.setRealMemListLen(count);
        if (memList.length < 20) {
            for (var i = memList.length; i < 20; i++) {
                memList.push({ isDel: false, isCheck: false, id: 'none-' + i, centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
            }
        } else {
            let fillLength = 5 - (memList.length % 5)
            if (fillLength == 5) {
                return;
            } else {
                // 填充fillLength个
                for (var i = 0; i < fillLength; i++) {
                    memList.push({ isDel: false, isCheck: false, id: 'none-' + i, centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
                }
                if (memList.length > 0) {
                    memList.map((item, index) => {
                        if (item.onSel) {
                            this.props.setCurSeleceMem(item);
                        }
                    })
                }
            }
        }
        this.props.setMemList([...memList]);
    }

    /**
     * 已选择人员编辑
     */
    checkListEdit = () => {
        let { checkListEdit, showAll } = this.state;
        this.setState({
            checkListEdit: !checkListEdit,
            // showAll:!showAll
        })
    }
    /**
     * 已选择人员编辑完成
     */
    checkListComplete = () => {
        let { checkListEdit } = this.state;
        this.setState({
            checkListEdit: !checkListEdit,
        })
    }
    /**
     * 更新快捷组名称
     */
    updateGroupName = async (e) => {
        let curGroupName = $("#origin-group-name").text();
        let id = this.props.curSelectGroup.id;
        let params = { groupName: curGroupName, id };
        let data = await apis.dispatch.updateDispGroup(params);
        if (data.obj == 0) {
            message.success("更新快捷组名称成功");
            loadGroupList();
        }
    }
    /**
     * 删除选中列表中的人
     */
    deleteChecked = (item) => {
        let { checkedList, memList } = this.props;
        checkedList.map((ck, index) => {
            if (ck.orgMemId == item.orgMemId) {
                checkedList.splice(index, 1);
            }
        })
        memList.map((mem) => {
            if (mem.orgMemId == item.orgMemId) {
                mem.isCheck = false;
            }
        })
        this.props.setMemList([...memList]);
        this.props.setCheckedList([...checkedList])
    }
    fetchMemData = () => {
        let { groupMemAll, curSelectGroup, defaultKey, coreMemAll, selectedKeys } = this.props;
        if (defaultKey == 1) {
            // 群组
            if (groupMemAll.hasNextPage) {
                loadGroupMember(curSelectGroup.id, groupMemAll.pageNum + 1)
            }
        } else {
            // 通讯录
            if (coreMemAll.hasNextPage) {
                let deptId = selectedKeys[0].split("-")[1]
                loadOrgMember(deptId, "", coreMemAll.pageNum + 1)
            }
        }
    }
    render() {
        let { isCheckAll, isShowEdit, memList, curSelectMem, makeTemp, checkedList, curSelectGroup, defaultKey, isShowCheck, curSelectCore, realMemListLen, configData } = this.props;
        let { memModalVisible, memDetailVisible, showAll, checkListEdit, mainSymbol, hasMore } = this.state;
        return (
            <div className='mem-list-wrap'>
                <div className="list-header">
                    {isShowEdit ? <span className="list-title" id="origin-group-name" suppressContentEditableWarning contentEditable="true" onBlur={(e) => { this.updateGroupName(e) }}>{curSelectGroup.groupName}</span>
                        : (defaultKey == 2 && JSON.stringify(curSelectCore) != '{}') ? <span className="list-title" title={curSelectCore.name}>{curSelectCore.name}</span> :
                            <span className="list-title" title={curSelectGroup.groupName} >{curSelectGroup.groupName}</span>
                    }
                    {(defaultKey == 2 && JSON.stringify(curSelectCore) != '{}')
                        ? <span className="list-num" >{`${realMemListLen ? '(' + realMemListLen + '人)' : ''}`}</span>
                        : <span className="list-num" >{`${curSelectGroup.maxMemNum ? '(' + curSelectGroup.maxMemNum + '人)' : ''}`}</span>
                    }
                    <div className="list-operate">
                        {!isShowCheck && <span className="check-span" onClick={() => { this.moreCheck() }}><i className="icon-check"></i>多选</span>}
                        {isShowCheck &&
                            <div className="check-more">
                                <Alert className="alert-info" message="请点击人员卡片进行选择" type="info" showIcon closable />
                                <span className="check-all" onClick={() => { this.checkAll() }}><i className={`icon-checkAll ${isCheckAll ? 'icon-checkAllSel' : ''}`}></i>全选</span>
                                <span className="cancel-check" onClick={() => { this.cancleCheckMore() }}><i className="icon-check"></i>取消多选</span>
                            </div>
                        }
                        {!isShowEdit && <span className="edit-span" onClick={() => { this.memEdit() }}><i className="icon-edit"></i>编辑</span>}
                        {isShowEdit &&
                            <div className="edit-more">
                                <Alert className="alert-info" message="请拖动人员或群组进行位置排序" type="info" showIcon closable />
                                <span className='edit-complete' onClick={() => this.editComplete()}><i className="icon-edit-sel"></i>完成</span>
                            </div>
                        }
                    </div>
                </div>
                <div className='mem-list' >
                    <InfiniteScroll
                        pageStart={0}
                        initialLoad={false}
                        loadMore={() => { this.fetchMemData() }}
                        hasMore={hasMore}
                        style={{ height: "100%" }}
                        useWindow={false}>
                        {
                            memList && memList.map((item, index) => {
                                return (
                                    <Member
                                        key={"mem-" + index}
                                        findCard={this.findCard}
                                        moveCard={this.moveCard}
                                        isShowEdit={isShowEdit}
                                        item={item}
                                        orgMemId={item.orgMemId}
                                        memClick={this.memClick}
                                        memDetail={this.memDetail}
                                        configData={configData}
                                        memDelete={this.memDelete} />
                                )
                            })
                        }
                    </InfiniteScroll>
                </div>
                {
                    !isEmpty(curSelectMem) &&
                    <div className={`cur-select ${window.top.style == 'iframe' ? 'cur-iframe-list' : ''}`}>
                        <i className="icon-cur-select"></i>
                        <span className="select-name" title={curSelectMem.name}>{curSelectMem.name}</span>
                        <span className="select-deptName over-ellipsis" title={curSelectMem.deptName}>{curSelectMem.deptName}</span>
                        <span className="select-status">【{TEL_STATUS_VAL[getTelStatus(curSelectMem.memTel)] || sessionStorage.getItem('defaultTelStatusDesc')}】</span>
                        <span className="select-tel">电话：{hideTel(curSelectMem.memTel)}</span>
                    </div>
                }
                {
                    checkedList.length > 0 &&
                    <div className={`check-list ${window.top.style == 'iframe' ? 'check-iframe-list' : ''}`}>
                        <span className="check-length">已选择({checkedList.length})：</span>

                        <div className="check-list-item">

                            {!showAll && checkedList.slice(0, 10).map((item, index) => {
                                return (
                                    <div className='check-wrap' key={`check-${index}`}>
                                        <span className="check-memname over-ellipsis" title={item.name}>{item.name}</span>
                                        {checkListEdit && <i className="checklist-del" onClick={() => { this.deleteChecked(item) }}></i>}
                                    </div>
                                )
                            })}
                            {showAll && checkedList.map((item, index) => {
                                return (
                                    <div className='check-wrap' key={`chec-all-${index}`}>
                                        <span className="check-memname over-ellipsis" title={item.name}>{item.name}</span>
                                        {checkListEdit && <i className="checklist-del" onClick={() => { this.deleteChecked(item) }}></i>}
                                    </div>
                                )
                            })}
                        </div>

                        {checkedList.length > 10 && !showAll &&
                            <div className="more-info">
                                <span>...</span>
                                <span className="show-all" onClick={() => { this.showAllCheckList() }}>展开</span>
                            </div>}
                        {showAll &&
                            <div className="more-info-edit">
                                <span className="show-all" onClick={() => { this.showAllCheckList() }}>收起</span>
                            </div>}
                        {
                            checkListEdit ? <span className='edit-check-complete' onClick={() => this.checkListComplete()}>完成</span>
                                : <span className='edit-check' onClick={() => this.checkListEdit()}>编辑</span>
                        }
                    </div>
                }
                {
                    memDetailVisible && <MemDetail visible={memDetailVisible} hidePop={this.hidePop} mem={this.state.memItem} length={this.state.liLength} mainSymbol={mainSymbol} />
                }
                {
                    <AddMember modalVisible={memModalVisible} getMemData={(mems) => this.getMemData(mems)} title={addMemTitle} />
                }
            </div>
        );
    }
}
export default MemberList;