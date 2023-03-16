/*
 * @File: 语音调度  reducer(通讯录、人员信息、组呼通知等)
 * @Author: liulian
 * @Date: 2020-06-10 16:21:48
 * @version: V0.0.0.1
 * @LastEditTime: 2022-01-12 13:45:53
 */
const SHANDVISIBLE = 'SHANDVISIBLE';  //软手柄弹框是否显示
const SHANDINFO = 'SHANDINFo'; //软手柄通知信息

const LOADING = 'loading';
const DEFAULT_KEY = 'DEFAULT_KEY';

const DEPT_TREE = 'DEPT_TREE';
const GROUP_LIST = 'GROUP_LIST';
const GROUPMEM_LIST = 'GROUPMEM_LIST';
const CURSELECTGROUP = 'CURSELECTGROUP';
const CURSELECTCORE = 'CURSELECTCORE';
const EXPANDEDKEYS = 'EXPANDEDKEYS';
const SELECTEDKEYS = 'SELECTEDKEYS';
const GROUPMEMALL = 'GROUPMEMALL';
const COREMEMALL = 'COREMEMALL';
const SEARCHRESULT = 'SEARCHRESULT';
const ISSHOWTZLY = 'ISSHOWTZLY';

const TRANSFER_INFO = 'TRANSFER_INFO';
const ISSHOWPANEL = 'ISSHOWPANEL';
const ISSHOWSEARCHPANEL = 'ISSHOWSEARCHPANEL'
const RESULTMEMLIST = 'RESULTMEMLIST'
const ISSHOWTRANSFERRESULTPANEL = 'ISSHOWTRANSFERRESULTPANEL'

const SHOWRECORD_INFO = 'SHOWRECORD_INFO';
const RECORDITEM_DATA = 'RECORDITEM_DATA';

const REALMEMLISTLEN = 'REALMEMLISTLEN';
const ISSHOW_EDIT = 'ISSHOW_EDIT';
const ISSHOW_CHECK = 'ISSHOW_CHECK';
const ISCHECKALL = 'ISCHECKALL';
const CHECKED_LIST = 'CHECKED_LIST';
const CURSELECTMEM='CURSELECTMEM';
const MEM_LIST = 'MEM_LIST';
const MEMMAP_CACHE = 'MEMMAP_CACHE';
const MEMTELMAP_CACHE = 'MEMTELMAP_CACHE';
const TELSTATUS_LIST = 'TELSTATUS_LIST';

const ISMAINTALK = 'ISMAINTALK';
const ISSUBTALK = 'ISSUBTALK';
const SHANKCALL = 'SHANKCALL';
const ISSHOWMAINZDH = 'ISSHOWMAINZDH';
const ISSHOWSUBZDH = 'ISSHOWSUBZDH';
const CENTEROPERTEL = 'CENTEROPERTEL';

const ISROLLCALL = 'ISROLLCALL';
const ISGROUPTURN = 'ISGROUPTURN';
const ISSELECTCALL = 'ISSELECTCALL';
const ISBOARDCAST = 'ISBOARDCAST';
const MAKETEMP = 'MAKETEMP';

const AUDIOLIST = 'AUDIOLIST';
const CURSELECTAUDIO = 'CURSELECTAUDIO';
const ALLNOTIFYRECORD = 'ALLNOTIFYRECORD';
const NOTIFYRECORD = 'NOTIFYRECORD';
const ISSHOWFOOTER = 'ISSHOWFOOTER';
const RECORDDEFAULTKEY = 'RECORDDEFAULTKEY';
const CURGROUPCALLMEETID = 'CURGROUPCALLMEETID';
const ADDAUDIOVISIBLE = 'ADDAUDIOVISIBLE';

const ISSHOWDISMSG = 'ISSHOWDISMSG';

const initState = {
    shandVisible:false,
    shandInfo:{},  //软手柄通知信息

    loading:true,    //加载
    defaultKey:"1",  //当前选中 1：群组 2：通讯录

    deptTree: [],   //通讯录树
    groupList: [],     //群组列表
    groupMemList:[],   //群组成员列表
    curSelectGroup:{}, //当前选中的快捷组
    curSelectCore:{},  //当前选中的通讯录组
    expandedKeys:[],   //通讯录树当前展开的节点
    selectedKeys:[],   //通讯录树当前选中的节点
    groupMemAll:{}, //快捷组选中所有信息
    coreMemAll:{},  //通讯录选中所有组信息
    searchResult:{},
    isShowTzly:false,  //是否显示停止录音按钮
    // 转接相关
    transferInfo:{},  //转接给某个人的信息
    isShowPanel:false,   //是否显示转接搜索下拉板
    isShowSearchPanel:false,   //是否显示转接搜索面板
    resultMemList:[],    //搜索结果（转接）
    isShowTransferResultPanel:false,  //是否显示转接结果的面板（新增的）

    showRecordInfo: true,   //是否显示通知记录弹框
    recordItemData: {},   //某一条通知

    realMemListLen:0,    //真正的memList长度
    isShowEdit: false,    //是否为编辑状态（人员列表的编辑按钮）
    isShowCheck:false,    //是否多选
    isCheckAll:false,    //是否全选
    checkedList:[],      //多选选择的人员数据
    curSelectMem:{},    //当前选中的人员 
    memList: [], //人员信息
    memMapCache:{},  //完整通讯录人员清单  id和人员数据的MAP对象
    memTelMapCache:{},  //完整通讯录人员清单  号码和人员数据的MAP对象
    telStatusList:{},   //号码状态列表 

    // 通话面板相关
    isMainTalk:false,    //是否主手柄在通话
    isSubTalk:false,   //是否副手柄在通话
    shankCall:{},    //手柄呼叫记录
    isShowMainZdh:false,  //是否显示z主手柄最大化按钮
    isShowSubZdh:false, //是否显示扶手并最大化按钮
    centerOperTel:false,   //手柄鉴权 false:主手柄（左） true：副手柄（右）

    // 按钮区域
    isRollCall:false,  //是否轮询
    isGroupTurn:false,  //是否轮询
    isSelectCall:1,  //是否选呼 1：正常（蓝） 2：结束选呼（黄） 3：不可点击（灰）
    isBoardCast:1,  //是否广播 1：正常（蓝）  2结束广播（黄）  3.不可点击（灰）
    makeTemp:'group',  //形成临时组

    // 组呼通知区域
    audioList:[],  //录音文件
    curSelectAudio:{}, //当前选中的录音文件
    AllNotifyRecord:{}, //通知记录
    notifyRecord:[], //通知记录列表
    isShowFooter:false,
    recordDefaultKey:'tab-trans', //组呼通知弹框 当前选中 1：文字转语音 2：语音文件 3：通知记录
    curGroupCallMeetId:'',   //当前组呼/选呼/广播时进入的会议ID
    addAudioVisible:false,   //新建录音弹框是否显示
   
};

export function audioHandleReducer(state = initState, action) {
    switch (action.type) {
        case SHANDVISIBLE:return{...state,shandVisible:action.data};
        case SHANDINFO:return{...state,shandInfo:action.data};

        case LOADING:return {...state,loading:action.data};
        case DEFAULT_KEY:return {...state,defaultKey:action.data};

        case DEPT_TREE: return { ...state, deptTree: action.data };
        case GROUP_LIST: return { ...state, groupList: action.data };
        case GROUPMEM_LIST: return {...state,groupMemList:action.data};
        case CURSELECTGROUP: return {...state,curSelectGroup:action.data};
        case CURSELECTCORE: return {...state,curSelectCore:action.data};
        case EXPANDEDKEYS: return {...state,expandedKeys:action.data};
        case SELECTEDKEYS: return {...state,selectedKeys:action.data};
        case GROUPMEMALL: return {...state,groupMemAll:action.data};
        case COREMEMALL:return {...state,coreMemAll:action.data};
        case SEARCHRESULT:return {...state,searchResult:action.data}
        case ISSHOWTZLY: return {...state,isShowTzly:action.data}

        case TRANSFER_INFO: return {...state,transferInfo:action.data};
        case ISSHOWPANEL: return {...state,isShowPanel:action.data};
        case ISSHOWSEARCHPANEL:return {...state,isShowSearchPanel:action.data};
        case RESULTMEMLIST:return{...state,resultMemList:action.data};
        case ISSHOWTRANSFERRESULTPANEL:return{...state,isShowTransferResultPanel:action.data}
    
        case SHOWRECORD_INFO: return { ...state, showRecordInfo: action.data };
        case RECORDITEM_DATA: return { ...state, recordItemData: action.data };

        case REALMEMLISTLEN: return {...state,realMemListLen:action.data};
        case ISSHOW_EDIT: return { ...state, isShowEdit: action.data };
        case ISSHOW_CHECK: return {...state,isShowCheck:action.data};
        case ISCHECKALL: return {...state,isCheckAll:action.data};
        case CHECKED_LIST:return {...state,checkedList:action.data};
        case CURSELECTMEM:return {...state,curSelectMem:action.data};
        case MEM_LIST:return {...state,memList:action.data};
        case MEMMAP_CACHE:return {...state,memMapCache:action.data};
        case MEMTELMAP_CACHE:return {...state,memTelMapCache:action.data};
        case TELSTATUS_LIST:return {...state,telStatusList:action.data};

        case ISMAINTALK: return {...state,isMainTalk:action.data};
        case ISSUBTALK: return {...state,isSubTalk:action.data};
        case SHANKCALL: return {...state,shankCall:action.data};
        case ISSHOWMAINZDH:return {...state,isShowMainZdh:action.data};
        case ISSHOWSUBZDH:return{...state,isShowSubZdh:action.data};
        case CENTEROPERTEL:return {...state,centerOperTel:action.data};

        case ISROLLCALL: return {...state,isRollCall:action.data};
        case ISGROUPTURN:return {...state,isGroupTurn:action.data};
        case ISSELECTCALL:return {...state,isSelectCall:action.data};
        case ISBOARDCAST:return {...state,isBoardCast:action.data};
        case MAKETEMP:return {...state,makeTemp:action.data};

        case AUDIOLIST:return{...state,audioList:action.data};
        case CURSELECTAUDIO:return {...state,curSelectAudio:action.data};
        case ALLNOTIFYRECORD:return {...state,AllNotifyRecord:action.data};
        case NOTIFYRECORD:return {...state,notifyRecord:action.data};
        case ISSHOWFOOTER:return{...state,isShowFooter:action.data};
        case RECORDDEFAULTKEY: return{...state,recordDefaultKey:action.data};
        case CURGROUPCALLMEETID:return{...state,curGroupCallMeetId:action.data};
        case ADDAUDIOVISIBLE:return {...state,addAudioVisible:action.data};

        default: return state;
    }
}
/**
 * 设置软手柄呼叫弹框是否显示
 */
export function setShandVisible(data){
    return {type:SHANDVISIBLE,data:data}
}
/**
 * 设置软手柄通知信息
 */
export function setShandInfo(data){
    return {type:SHANDINFO,data:data}
}
/**
 * loading状态
 */
export function setLoading(data){
    return {type:LOADING,data:data}
}
/**
 * 当前选中的 群组/通讯录
 */
export function setDefaultKey(data){
    return {type: DEFAULT_KEY ,data:data}
}

/**
 * 通讯录数据
 */
export function setDeptTree(data) {
    return { type: DEPT_TREE, data: data };
}
/**
 * 群组数据
 */
export function setGroupList(data) {
    return { type: GROUP_LIST, data: data };
}
/**
 * 群组成员数据
 */
export function setGroupMemList(data) {
    return {type: GROUPMEM_LIST,data:data}
}
/**
 * 设置当前选中的快捷组
 */
export function setCurSelectGroup(data){
    return {type:CURSELECTGROUP,data:data}
}
/**
 * 设置当前选中的通讯录部门
 */
export function setCurSelectCore(data){
    return {type:CURSELECTCORE,data:data}
}
/**
 * 设置通讯录树当前展开的节点
 */
export function setExpandedKeys(data){
    return {type:EXPANDEDKEYS,data:data}
}
/**
 * 设置通讯录当前选中的节点 
 */
export function setSelectedKeys(data){
    return {type:SELECTEDKEYS,data:data}
}
/**
 * 设置当前快捷组所有信息
 */
export function setGroupMemAll(data){
    return {type:GROUPMEMALL,data:data}
}
/**
 * 设置当前通讯录所有信息
 */
export function setCoreMemAll(data){
    return {type:COREMEMALL,data:data}
}
export function setSearchResult(data){
    return {type:SEARCHRESULT,data:data}
}
/**
 * 设置是否显示停止录音按钮
 */
export function setIsShowTzly(data){
    return {type:ISSHOWTZLY,data:data}
}

/**
 * 设置转接人信息
 */
export function setTransferInfo(data){
    return {type:TRANSFER_INFO,data:data}
}
/**
 * 设置转接搜索下拉面板是否展开(通讯录/群组)
 */
export function setIsShowPanel(data){
    return {type:ISSHOWPANEL,data:data}
}
/**
 * 设置转接搜索下拉面板是否展开(搜索)
 */
export function setIsShowSearchPanel(data){
    return {type:ISSHOWSEARCHPANEL,data:data}
}
/**
 * 设置搜索结果
 */
export function setResultMemList(data){
    return {type:RESULTMEMLIST,data:data}
}
/**
 * 设置是否显示转接结果的转接面板信息
 */
export function setIsShowTransferResultPanel(data){
    return {type:ISSHOWTRANSFERRESULTPANEL,data:data}
}



/**
 * 设置是否显示通知记录弹框
 */
export function setShowRecordInfo(data) {
    return { type: SHOWRECORD_INFO, data: data };
}
/**
 * 某一条通知
 */
export function setRecordItemData(data) {
    return { type: RECORDITEM_DATA, data: data }   
}

/**
 * 
 */
export function setRealMemListLen(data){
    return {type:REALMEMLISTLEN,data:data}
}
/**
 * 设置是否为编辑状态
 */
export function setShowEdit(data) {
    return { type: ISSHOW_EDIT, data: data }
}
/**
 * 设置是否为多选
 */
export function setIsShowCheck(data){ 
    return {type:ISSHOW_CHECK,data:data}
}
/**
 * 设置是否全选
 */
export function setIsCheckAll(data){
    return {type:ISCHECKALL,data:data}
}
/**
 * 设置多选的选择人员数据
 */
export function setCheckedList(data){
    return {type:CHECKED_LIST,data:data}
}
/**
 * 获取人员信息列表
 */
export function setMemList(data){
    return {type:MEM_LIST,data:data}
}
/**
 * 设置当前选中的人员信息
 */
export function setCurSeleceMem(data){
    return {type:CURSELECTMEM,data:data}
}
/**
 * 设置完整通讯录缓存数据   id和人员数据的MAP对象
 */
export function setMemMapCache(data){
    return {type:MEMMAP_CACHE,data:data}
}
/**
 * 设置完整通讯录缓存数据  tel和人员数据的MAP对象
 */
export function setMemTelMapCache(data){
    return {type:MEMTELMAP_CACHE,data:data}
}
/**
 * 设置号码状态列表
 */
export function setTelStausList(data){
    return {type:TELSTATUS_LIST,data:data}
}

/**
 * 设置是否显示主手柄通话面板
 */
export function setIsMainTalk(data){
    return {type:ISMAINTALK,data:data}
}
/**
 * 设置是否显示副手柄通话面板
 */
export function setIsSubTalk(data){
    return {type:ISSUBTALK,data:data}
}
/**
 * 设置手柄呼叫记录
 */
export function setShankCall(data){
    return {type:SHANKCALL,data:data}
}
/**
 * 设置是否显示主手柄最大化按钮
 */
export function setIsShowMainZdh(data){
    return {type:ISSHOWMAINZDH,data:data}
}
/**
 * 设置是否显示副手柄最大化按钮
 */
export function setIsShowSubZdh(data){
    return {type:ISSHOWSUBZDH,data:data}
}
/**
 * 主副手柄设置
 */
export function setCenterOperTel(data){
    return {type:CENTEROPERTEL,data:data}
}

/**
 * 设置是否结束点名
 */
export function setIsRollCall(data){
    return {type:ISROLLCALL,data:data}
}
/**
 * 设置是否结束轮询
 */
export function setIsGroupTurn(data){
    return {type:ISGROUPTURN,data:data}
}
/**
 * 设置选呼/组呼状态
 */
export function setIsSelectCall(data){
    return {type:ISSELECTCALL,data:data}
}
/**
 * 设置广播状态
 */
export function setBoardCast(data){
    return {type:ISBOARDCAST,data:data}
}
/**
 * 设置是否形成临时组
 */
export function setMakeTemp(data){
    return {type:MAKETEMP,data:data}
}

/**
 * 设置录音文件列表
 */
export function setAudioList(data){
    return {type:AUDIOLIST,data:data}
}
/**
 * 设置当前选中的录音文件列表
 */
export function setCurSelectAudio(data){
    return {type:CURSELECTAUDIO,data:data}
}
/**
 * 设置是否显示新建录音的弹框
 */
export function setAddAudioVisible(data){
    return {type:ADDAUDIOVISIBLE,data:data}
}
/**
 * 设置通知记录
 */
export function setAllNotifyRecord(data){
    return {type:ALLNOTIFYRECORD,data:data}
}
/**
 * 设置通知记录列表
 */
export function setNotifyRecord(data){
    return {type:NOTIFYRECORD,data:data}
}
export function setIsShowFooter(data){
    return {type:ISSHOWFOOTER,data:data}
}
/**
 * 设置组呼通知当前选中得tab
 */
export function setRecordDefaultKey(data){
    return {type:RECORDDEFAULTKEY,data:data}
}
/**
 * 设置当前入会的meetId
 */
 export function setCurGroupCallMeetId(data){
    return {type:CURGROUPCALLMEETID,data:data}
}

