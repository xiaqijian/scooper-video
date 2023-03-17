/*
 * @File: 定义公共方法
 * @Author: liulian
 * @Date: 2020-07-28 10:46:27
 * @version: V0.0.0.1
 * @LastEditTime: 2022-08-20 14:01:46
 */
import { singalBtnName, stsConst } from '../config/constants';
import { apis } from './apis'
import $ from 'jquery'
import store from '../store';
import { setRealMemListLen, setMemList, setGroupList, setGroupMemAll, setIsCheckAll, setCurSeleceMem, setGroupHasNextPage, setCoreMemAll, setCurSelectGroup, setAudioList, setMemMapCache } from '../reducer/audio-handle-reducer';
import { setRecordListData, setRecordAllData, setCurSelectItem, setCallInMissData, setCallInMissList, setCurSelectMissItem } from '../reducer/callRecord-handle-reduce';
import timeUtil from './time-util'

/**
 * 获取URL参数
 */
export function getUrlRealParam(name, defaultV) {
    var index = document.location.href.indexOf('?');
    var sParam = document.location.href.substring(index);
    var arrParam = sParam.split('&');
    var indexP = -1;
    for (var i = 0; i < arrParam.length; i++) {
        indexP = arrParam[i].indexOf(name + '=');
        if (indexP >= 0) {
            return arrParam[i].substring(indexP + name.length + 1);
        }
    }
    return defaultV;
}
/**
 * 获取当前号码类型，以及号码对应的人员信息
 * @return data={memInfo:{},telType:''}
 */
export function getMemTypeByTel(tel) {
    let { memTelMapCache } = store.getState().audioHandle;
    let result = memTelMapCache[tel];
    let telType;
    if (result) {
        if (result.memMobile == tel) {
            telType = 'memMobile'
        } else if (result.memTel2 == tel) {
            telType = "memTel2";
        } else if (result.memTel3 == tel) {
            telType = "memTel3";
        } else if (result.memTel4 == tel) {
            telType = "memTel4";
        } else if (result.memTel5 == tel) {
            telType = "memTel5";
        } else if (result.memJkTel == tel) {
            telType = "memJkTel";
        } else if (result.memMsgTel == tel) {
            telType = "memMsgTel";
        } else {
            telType = ''
        }
    }
    let data = {
        memInfo: result || '',
        telType: telType
    }
    return data;
}
/**
 * 隐藏手机号码中间4位
 */
export function hideTel(tel) {
    let { configData } = store.getState().loading;
    if (JSON.stringify(configData) !== '{}' && configData.set["disp.set.hide.mobile"] == "true") {
        let data = getMemTypeByTel(tel);
        if (data && data.telType == 'memMobile') {
            tel = tel.substring(0, 3) + "****" + tel.substr(tel.length - 4);
        }
        return tel
    } else {
        return tel
    }
}

/**
 * 获取按钮状态
 * @param {*} name 按钮名
 * @param {*} telStatus 号码状态
 */
export function getBtnEnable(name, telStatus) {
    switch (name) {
        case singalBtnName.CALL: {
            if (telStatus != stsConst.IDLE && telStatus != sessionStorage.getItem('defaultTelStatus')) return false;
            break;
        }
        case singalBtnName.HUNGUP: {
            if (telStatus == stsConst.IDLE || telStatus == stsConst.OFFLINE || telStatus == sessionStorage.getItem('defaultTelStatus') || (telStatus.indexOf("monitor") >= 0 && telStatus != stsConst.MONITOR)) return false;
            break;
        }
        case singalBtnName.TRIPLEHUNGUP: {
            if (telStatus == stsConst.BREAKIN || !(telStatus.indexOf('monitor') >= 0) || telStatus == stsConst.CALLTURNING) return false;
            break;
        }
        case singalBtnName.MEET: {
            if (telStatus == stsConst.OFFLINE || telStatus == stsConst.MEET || telStatus == stsConst.CALLTRANSFING
                || telStatus == stsConst.CALLTRANSFER || telStatus == stsConst.CALLTURNING || telStatus.indexOf("monitor") >= 0) return false;
            break;
        }
        case singalBtnName.GROUPTURN: {  //挂断出来的时候 这个要 false 
            if (telStatus == stsConst.CALLTURNING || !(telStatus == stsConst.IDLE || telStatus == stsConst.OFFLINE || telStatus == sessionStorage.getItem('defaultTelStatus') || (telStatus.indexOf("monitor") >= 0 && telStatus != stsConst.MONITOR))) return false;
            break;
        }
        case singalBtnName.RECORD: {
            if (telStatus !== stsConst.DOUBLETALK) return false;
            break;
        }
        case singalBtnName.KEEP: {
            if (telStatus == stsConst.BREAKIN || (telStatus !== stsConst.DOUBLETALK && telStatus !== stsConst.CALLHOLD)) {
                return false
            }
            break;
        }
        case singalBtnName.TRANSFER: {
            if (!needTransfer(telStatus)) return false;
            break;
        }
        case singalBtnName.BREAKIN: {
            if (!(telStatus == stsConst.MONITORANSWER || telStatus == stsConst.MONITOROFFHOOK)) {
                return false;
            }
            break;
        }
        case singalBtnName.MONITOR: {
            if (telStatus !== stsConst.MONITORANSWER && telStatus !== stsConst.MONITOROFFHOOK) return false;
            break;
        }

    }
    return true;
}
function needTransfer(telSts) {
    if (!telSts) return false;
    if (telSts.indexOf("monitor") >= 0) return false;    //直接通话不能转接
    if (telSts == stsConst.BREAKIN) return false; //强插状态不能转接
    return telSts != stsConst.IDLE
        && telSts != stsConst.OFFLINE
        && telSts != sessionStorage.getItem('defaultTelStatus')
        && telSts != stsConst.CALLHOLD
        && telSts != stsConst.CALLTRANSFER
        // && telSts != stsConst.CALLTRANSFING
        && telSts != stsConst.MEET
        && telSts != stsConst.CALLRING
        && telSts != stsConst.WAITRING
        && telSts != stsConst.CALLANSWER
        && telSts != stsConst.CALLINWAITANSWER
        && telSts != stsConst.CALLTURNING
}

/**
 * 获取号码状态
 */
export function getTelStatus(tel) {
    let telStatusList = store.getState().audioHandle.telStatusList;
    if (JSON.stringify(telStatusList) != '{}' && tel) {
        return (telStatusList[tel] && telStatusList[tel].status) || sessionStorage.getItem('defaultTelStatus')
    } else {
        return sessionStorage.getItem('defaultTelStatus')
    }
}
/**
 * 更新memList
 * @param {*} memMapCache 人员数据缓存
 * @param {*} type  更新的类型
 */
export function setCurMemList(memMapCache, type) {
    let memList = store.getState().audioHandle.memList;
    memList.map((item) => {
        if (item.id.toString().indexOf('none') >= 0) return;
        if (type == 'name') {
            if (item.sourceType && item.sourceType == 'group') {
                // 群组数据
                item.name = (memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].name)) ? memMapCache[item.orgMemId].name : (item.name || '')
            } else {
                // 通讯录数据
                item.name = (memMapCache[item.id] && isNotNull(memMapCache[item.id].name)) ? memMapCache[item.id].name : (item.name || '')
            }
        } else if (type == 'deptName') {
            if (item.sourceType && item.sourceType == 'group') {
                // 群组数据
                let deptName = (memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].deptName)) ? memMapCache[item.orgMemId].deptName : '';
                item.deptName = getDeptName(deptName, item.dutyName);

                item.devCodeZfy = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeZfy)) ? memMapCache[item.orgMemId].devCodeZfy : '');
                item.devCodeJx = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeJx)) ? memMapCache[item.orgMemId].devCodeJx : '');
                item.devCodeJk = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeJk)) ? memMapCache[item.orgMemId].devCodeJk : '');
            } else {
                // 通讯录数据
                let deptName = (memMapCache[item.id] && isNotNull(memMapCache[item.id].deptName)) ? memMapCache[item.id].deptName : '';
                item.deptName = getDeptName(deptName, item.dutyName);
            }
        }
    })
}
/**
 * 填充memList
 */
export function fillMem() {
    let memList = store.getState().audioHandle.memList;
    if (memList.length < 20) {
        for (var i = memList.length; i < 20; i++) {
            memList.push({ isDel: false, isCheck: false, id: 'none-' + i, centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
        }
    }
    store.dispatch(setMemList([...memList]));
    let count = 0;
    memList && memList.map((item) => {
        if (item.id.toString().indexOf('none') < 0 || item.id.toString() == 'mem-add') {
            count++;
        }
    })
    store.dispatch(setRealMemListLen(count))
}
/**
 * 加载快捷组数据
 */
export const loadGroupList = async (groupId) => {
    let data = await apis.dispatch.listDispGroup();
    if (groupId) {
        let curGroup = data.filter(item => item.id == groupId);
        if (curGroup.length > 0) {
            store.dispatch(setCurSelectGroup(curGroup[0]))
        }
    }
    store.dispatch(setGroupList(data));
}
/**
 * 加载群组成员(快捷组成员)
 */
export const loadGroupMember = async (id, currentPage, temp, orgMemId) => {
    let { isCheckAll, memMapCache, isShowEdit, curSelectMem, memList, isShowCheck, checkedList } = store.getState().audioHandle;
    let { configData } = store.getState().loading;
    if (id.toString().indexOf('temp') > -1 || id.toString().indexOf('none') > -1) {
        return;
    }
    let params = {
        groupId: id,
        currentPage,
        pageSize: 20
    }
    if (temp) {
        // 临时组
        let tempMemList = JSON.parse(sessionStorage.getItem('tempMemList'));
        let tempItem = JSON.parse(sessionStorage.getItem('tempItem'));
        tempMemList.map((temps) => {
            temps.isCheck = false;
            temps.onSel = false;
            if (orgMemId) {
                if (temps.orgMemId == orgMemId) {
                    temps.onSel = true;
                }
            } else {
                if (temps.orgMemId == curSelectMem.orgMemId) {
                    temps.onSel = true
                }
            }
            if (temps.onSel) {
                store.dispatch(setCurSeleceMem(temps))
            }
        })
        checkedList.map((check) => {
            let findList = tempMemList.filter(item => item.orgMemId == check.orgMemId);
            tempMemList.map((temps) => {
                if (findList.length > 0) {
                    if (temps.orgMemId == findList[0].orgMemId) {
                        temps.isCheck = true
                    }
                }
            })
        })
        if (tempMemList.length < 20) {
            for (var i = tempMemList.length; i < 20; i++) {
                tempMemList.push({ isDel: false, isCheck: false, id: 'none-' + i, centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
            }
        }
        store.dispatch(setCurSelectGroup(tempItem))
        store.dispatch(setMemList(tempMemList));
    } else {
        let data = await apis.dispatch.queryDispMember(params);
        store.dispatch(setGroupMemAll(data));   //设置完整快捷组信息
        data.list.map((item, index) => {
            item.onsel = false;
            item.isDel = false;
            item.isCheck = false;
            let deptName = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].deptName)) ? memMapCache[item.orgMemId].deptName : '');
            item.deptName = getDeptName(deptName, item.dutyName);
            item.sourceType = 'group';
            item.devCodeZfy = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeZfy)) ? memMapCache[item.orgMemId].devCodeZfy : '');
            item.devCodeJx = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeJx)) ? memMapCache[item.orgMemId].devCodeJx : '');
            item.devCodeJk = ((memMapCache[item.orgMemId] && isNotNull(memMapCache[item.orgMemId].devCodeJk)) ? memMapCache[item.orgMemId].devCodeJk : '');

            if (orgMemId) {
                if (item.orgMemId == orgMemId) {
                    item.onSel = true;
                }
            } else {
                if (item.orgMemId == curSelectMem.orgMemId) {
                    item.onSel = true
                }
            }

            if (isCheckAll && checkedList.length < configData.set["disp.set.multSelect.max"]) {
                // 全选
                item.isCheck = true;
            }
            if (item.onSel) {
                store.dispatch(setCurSeleceMem(item))
            }
        })
        if (currentPage == 1) {
            // 第一页
            if (isShowEdit) {
                data.list.unshift({ isDel: false, isCheck: false, id: 'mem-add', centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
                store.dispatch(setMemList([...data.list]));
                fillMem()
            } else if (isShowCheck) {
                let checkedList = store.getState().audioHandle.checkedList;
                if (data.list.length > 0) {
                    data.list.map((item, index) => {
                        let arr = checkedList.filter(items => items.orgMemId == item.orgMemId);
                        if (arr.length > 0) {
                            item.isCheck = arr[0].isCheck;
                        }
                    })
                }
                store.dispatch(setMemList([...data.list]));
                fillMem()
            } else {
                store.dispatch(setMemList([...data.list]));
                fillMem();
            }
        } else {
            let fillLength = 5 - (data.size % 5)
            if (fillLength == 5) {
                // return;
            } else {
                // 填充fillLength个
                for (var i = 0; i < fillLength; i++) {
                    data.list.push({ isDel: false, isCheck: false, id: 'none-' + i, centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
                }
            }
            let list = [...memList, ...data.list];
            if (isShowEdit) {
                // 先点击编辑 再滚动加载
                list.map((item, i) => {
                    if (item.id == 'mem-add') {
                        list.splice(i, 1);
                    }
                })
                list.unshift({ isDel: false, isCheck: false, id: 'mem-add', centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
                if (list[list.length - 1].id.toString().indexOf('none') > -1) {
                    list.splice(list.length - 1, 1);
                }
            }
            let checkedList = store.getState().audioHandle.checkedList;
            if (list.length > 0) {
                list.map((item, index) => {
                    let arr = checkedList.filter(items => items.orgMemId == item.orgMemId);
                    if (arr.length > 0) {
                        item.isCheck = arr[0].isCheck;
                    }
                })
            }
            store.dispatch(setRealMemListLen(list.length - fillLength))
            store.dispatch(setMemList(list));
        }
    }
}
/**
 * 加载通讯录人员
 */
export const loadOrgMember = async (deptId, orgMemId, currentPage) => {
    if (!deptId) return false;
    let { isShowCheck, checkedList, curSelectMem, memList, isCheckAll } = store.getState().audioHandle;
    let { configData } = store.getState().loading;
    let params = {
        deptId: deptId,
        currentPage,
        pageSize: 20
    }
    let data = await apis.core.queryOrgMember(params);
    store.dispatch(setCoreMemAll(data));   //设置完整通讯录信息
    if (data.list.length > 0) {
        data.list.map((item) => {
            item.orgMemId = item.id;
            // let dutyName = (item.dutyName ? '-' + item.dutyName : '');
            // item.deptName = item.deptName + dutyName;

            item.deptName = getDeptName(item.deptName, item.dutyName)

            if (orgMemId) {
                if (item.orgMemId == orgMemId) {
                    item.onSel = true;
                }
            } else {
                if (item.orgMemId == curSelectMem.orgMemId) {
                    item.onSel = true
                }
            }
            if (isCheckAll && checkedList.length < configData.set["disp.set.multSelect.max"]) {
                // 全选
                item.isCheck = true;
            }
        })
    }
    if (currentPage == 1) {
        if (isShowCheck) {
            if (data.list.length > 0) {
                data.list.map((item, index) => {
                    // let checkedList = store.getState().audioHandle.checkedList;
                    // let arr = checkedList.filter(items => items.orgMemId == item.orgMemId);
                    // if (arr.length > 0) {
                    //     item.isCheck = arr[0].isCheck;
                    // }
                    if (item.onSel) {
                        store.dispatch(setCurSeleceMem(item))
                    }
                })
            }
            let list = [...data.list]
            if (list.length > 0) {
                list.map((item, index) => {
                    let checkedList = store.getState().audioHandle.checkedList;
                    let arr = checkedList.filter(items => items.orgMemId == item.orgMemId);
                    if (arr.length > 0) {
                        item.isCheck = arr[0].isCheck;
                    }
                })
            }
            store.dispatch(setMemList(list));
            store.dispatch(setIsCheckAll(false));
            fillMem()
        } else {
            if (data.list.length > 0) {
                data.list.map((item, index) => {
                    if (item.onSel) {
                        store.dispatch(setCurSeleceMem(item))
                    }
                })
            }
            let list = [...data.list]

            if (list.length > 0) {
                list.map((item, index) => {
                    let checkedList = store.getState().audioHandle.checkedList;
                    let arr = checkedList.filter(items => items.orgMemId == item.orgMemId);
                    if (arr.length > 0) {
                        item.isCheck = arr[0].isCheck;
                    }
                })
            }
            store.dispatch(setMemList(list));
            store.dispatch(setIsCheckAll(false));
            fillMem();
        }
    } else {
        let fillLength = 5 - (data.size % 5)
        if (fillLength == 5) {
            // return;
        } else {
            // 填充fillLength个
            for (var i = 0; i < fillLength; i++) {
                data.list.push({ isDel: false, isCheck: false, id: 'none-' + i, centerId: '', onSel: false, groupId: '', orgMemId: '', memLevel: '', centerTel: '', groupName: '', name: "", deptName: '', memTel: '', memType: '', memMobile: '', })
            }
            if (data.list.length > 0) {
                data.list.map((item, index) => {
                    if (item.onSel) {
                        store.dispatch(setCurSeleceMem(item))
                    }
                })
            }
        }
        let realList = [...memList, ...data.list];

        if (realList.length > 0) {
            realList.map((item, index) => {
                let checkedList = store.getState().audioHandle.checkedList;
                let arr = checkedList.filter(items => items.orgMemId == item.id);
                if (arr.length > 0) {
                    item.isCheck = arr[0].isCheck;
                }
            })
        }
        store.dispatch(setMemList([...memList, ...data.list]));
        let count = 0;
        realList && realList.map((item) => {
            if (item.id.toString().indexOf('none') < 0 || item.id.toString() == 'mem-add') {
                count++;
            }
        })
        store.dispatch(setRealMemListLen(count))
    }
}

/**
 * 加载通话记录
 */
export const loadCallRecord = async (params, update) => {
    let { recordListData } = store.getState().callRecordHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    let data = await apis.disp.queryCallRecord(params);
    data && data.list.map((item) => {
        if (JSON.stringify(memTelMapCache) != '{}') {
            item.name = memTelMapCache[item.tel] && memTelMapCache[item.tel].name;
        }
        if (item.isCallInMiss !== 1 && item.tmAnswerT) {
            // 不是呼入未接&接了，计算通话时长
            if (item.tmHangupT) {
                // 挂断了
                item.callLen = timeUtil.calTimeBetween(new Date(item.tmHangupT).getTime(), new Date(item.tmCallT).getTime())
            } else {
                item.callLen = timeUtil.calTimeStamp(new Date(item.tmCallT).getTime())
            }
        }
    })
    let realList;
    if (update) {
        realList = [...recordListData, ...data.list];
        if (realList.length > 0) {
            store.dispatch(setCurSelectItem(realList[0]))
        }
        store.dispatch(setRecordListData(realList));
    } else {
        realList = data.list;
        if (realList.length > 0) {
            let c = JSON.parse(JSON.stringify(realList[0]));
            store.dispatch(setCurSelectItem(c))
        }
        store.dispatch(setRecordListData(realList));
    }
    store.dispatch(setRecordAllData(data));
}

/**
 * 加载呼入未接记录
 */
export const loadCallInMiss = async (param, update) => {
    let { callInMissList } = store.getState().callRecordHandle;
    let { memTelMapCache } = store.getState().audioHandle;
    let data = await apis.disp.queryCallInMiss(param);
    data && data.list.map((item) => {
        if (JSON.stringify(memTelMapCache) != '{}') {
            item.name = memTelMapCache[item.tel] && memTelMapCache[item.tel].name;
        }
    })
    if (callInMissList.length > 0) {
        store.dispatch(setCurSelectMissItem(callInMissList[0]))
    } else {

        (data.list.length > 0) && store.dispatch(setCurSelectMissItem(data.list[0]))
    }
    if (update) {
        store.dispatch(setCallInMissList([...callInMissList, ...data.list]));
    } else {
        store.dispatch(setCallInMissList(data.list));
    }
    store.dispatch(setCallInMissData(data));
}

export const loadAudioList = async () => {
    let data = await apis.disp.listSerRecordNotify();
    data.list.forEach(element => {
        if (element.callLength) {
            element.callLength = timeUtil.calTimelength(element.callLength);
        } else {
            element.callLength = ""
        }
    });
    store.dispatch(setAudioList(data.list))
}

/**
 * 生成业务businessId 生成规则：操作员ID_时间戳
 */
export const getBusinessId = () => {
    let accountDetail = window.scooper.dispatchManager.accountDetail;
    let businessId = accountDetail.operatorId + "_" + timeUtil.getTimeStamp();
    return businessId
}

/**
 * 格式化组呼记录返回得数据格式
 */
export const formatGroupRecord = (data, memTelMapCache) => {
    data.list.map((item) => {
        item.key = item.businessid;
        item.pageNum = data.pageNum
        item.hasNextPage = data.hasNextPage
        item.memNames = ""
        item.succNum = 0;
        item.failNum = 0;
        item.tmNotifys = item.tmNotify.substring(0, 4) + "/" + item.tmNotify.substring(4, 6) + "/" + item.tmNotify.substring(6, 8) + " " + item.tmNotify.substring(8, 10) + ":" + item.tmNotify.substring(10, 12)
        if (item.calleds.length > 0) {
            item.calleds.forEach((cal) => {
                if (memTelMapCache[cal] && memTelMapCache[cal].name != undefined) {
                    item.memNames += memTelMapCache[cal].name + "、"
                } else {
                    item.memNames = cal + "、"
                }
            })
        }
        item.memNames = item.memNames.substring(0, item.memNames.length - 1) + " 共(" + item.calleds.length + ")人"
        if (item.groupRecords.length > 0) {
            item.groupRecords.forEach((notify) => {
                if (memTelMapCache[notify.called]) {
                    notify.name = memTelMapCache[notify.called].name
                } else {
                    notify.name = notify.called
                }
                if (notify.notifyResult == 200) {
                    item.succNum = item.succNum + 1;
                } else {
                    item.failNum = item.failNum + 1;
                }
            })
        }
    })
    return data.list;
}

/**
 * 形成临时组
 */
export const makeTempGroup = (groupRecords) => {
    let { memTelMapCache, curSelectGroup } = store.getState().audioHandle;
    let groupName = [];
    let tempMemList = [];
    groupRecords.map((item) => {
        groupName.push(item.name || item.called);
        tempMemList.push(memTelMapCache[item.called]);
    })
    let tempItem = {
        id: 'temp-' + timeUtil.getTimeStamp(),
        centerId: window.scooper.dispatchManager.accountDetail.centerId,
        corpId: window.scooper.dispatchManager.accountDetail.corpId,
        groupName: groupName.join("、"),
        maxMemNum: groupRecords.length,
        groupType: 0,
        sortIndex: 0
    }

    sessionStorage.setItem("tempItem", JSON.stringify(tempItem));
    sessionStorage.setItem("tempMemList", JSON.stringify(tempMemList));
    if (curSelectGroup.id.toString().indexOf("temp") >= 0) {
        loadGroupMember('', '', "temp");
    }
}
/**
 * 数组去重
 */
export const uniqueArr = (arr) => {
    let len = arr.length;
    let tempJson = {};
    let res = [];
    for (let i = 0; i < len; i++) {        //取出每一个对象  
        tempJson[JSON.stringify(arr[i])] = true;
    }
    let keyItems = Object.keys(tempJson);
    for (let j = 0; j < keyItems.length; j++) {
        res.push(JSON.parse(keyItems[j]));
    }
    return res;
}
/**
 * 判断不为空且不等于 undefined
 */
export const isNotNull = (data) => {
    if (data && data != undefined && data != '' && data != null) {
        return true
    } else {
        return false
    }
}
/**
 * 组合最终显示的部门名称
 * 1. 如果没有deptName属性 不要 - 没有
 * 
 */
export const getDeptName = (deptName, dutyName) => {
    let opts = '';
    let realDeptName = '';
    if (deptName && dutyName) {
        opts = '-';
    }
    realDeptName = deptName + opts + dutyName;
    return realDeptName
    // return dutyName
}
