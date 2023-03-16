/*
 * @File: 头部scooper.dispatch在做一次初始化加载
 * @Author: liulian
 * @Date: 2021-01-26 15:50:52
 * @version: V0.0.0.1
 * @LastEditTime: 2022-03-23 16:18:07
 */
import { getToken, devMode } from '../config/constants';
import { setIsShowTempLeave, setIsShowGoBack, setDutyTelArray } from '../reducer/callIn-handle-reduce';
import EventDispatcher from '../util/event';
import { message, Modal } from 'antd'
import store from '../store/index'
import { apis } from '../util/apis';

const { confirm } = Modal
class DispatchRepeat extends EventDispatcher {
    accountDetail//当前登录人员信息
    dispatcher//scooper.dispatch
    // videoRecordId
    constructor(props) {
        super(props);
        const dispatchListen = new DispatchListens({ dispatchManager: this });
        const relyLib = ['scooper.dispatch'];

        window.requirejs(window.home, relyLib, (dispatch) => {
            if (getToken() == null || !getToken()) return;

            // let { configData } = store.getState().loading;
            // if (JSON.stringify(configData) !== '{}' && configData.shandle["disp.shandle.disphtml.use"] == "true") {

            // }
            let initConf = {
                "useShandle": true,
                // "scAuth":window.auth
            }
            dispatch.setRemoteBaseUrl(`/dispatch-web/`);

            dispatch.initialize('', initConf);

            dispatch.loginByToken(getToken, async data => {
                if (data.code) {
                    devMode && console.log("登陆调度失败");
                } else {
                    this.dispatcher = dispatch;
                    this.accountDetail = data.data.accountPo;   // 设置账号信息
                    this.initVideoRecord();
                    sessionStorage.setItem('dispAccountName', data.data.accountPo.accUsername || '无');
                    sessionStorage.setItem('dispAccountTel', data.data.accountPo.mainTel || data.data.accountPo.viceTel || '')
                    if (this.accountDetail && this.accountDetail.centerId) {
                        // 获取调度中心详情
                        this.getDispCenterDetail(this.accountDetail.centerId)
                    }
                    data.data.accountPo.activeHandler = data.data.activeHandler;
                    dispatchListen.init();
                    this.getStateConfig(data.data.dutyState, dispatchListen);
                }
            })
        })
    }
    /**
     * 获取调度中心详情  
     */
    getDispCenterDetail = async (centerId) => {
        let data = await apis.core.getDispCenterDetail({ id: centerId });
        if (data) {
            let meetRecord = data.meetRecord;
            this.accountDetail.meetRecord = meetRecord
        }
    }
    /**
     *  初始化获取暂离
     */
    getStateConfig = (state, dispatchListen) => {
        if (state && state.state == 'allout') {
            let msg = {
                type: 'client_state',
                value: 'state=allout;' + state.tels
            }
            dispatchListen.confgChange(msg)
        }
    }
    /**
    * 获取登录人账号信息
    */
    getAccount() {
        return this.accountDetail;
    }
    /**
     * 初始化投屏软件，获取录屏设置的视频ID
     */
    initVideoRecord = () => {
        let { configData } = store.getState().loading;
        if (JSON.stringify(configData) !== '{}' && configData.nav["disp.nav.mits"] == 'true') {
            const videoRecordServer = 'ws://127.0.0.1:11000/';

            let ws = new WebSocket(videoRecordServer);
            ws.onopen = function () {
                devMode && console.log("video record websocket connect success");
                //建立连接即向录屏软件获取当前设置视频id
                let param = {
                    op: "query",
                    seq: "1",
                    type: "dev_id"
                }
                ws.send(JSON.stringify(param));
            };
            ws.onmessage = function (evt) {
                var recvMsg = evt.data;
                var recvMsgJson = eval("(" + recvMsg + ")");
                devMode && console.log("recv video record msg: ", recvMsgJson);
                if ("ok" == recvMsgJson.result) {

                    window.videoRecordId = recvMsgJson.dev_id;
                    devMode && console.log("获取录屏设置视频id成功,视频id为" + window.videoRecordId)
                } else {
                    devMode && console.log("获取录屏设置视频id失败");
                }
            }
        }
    }
}

class DispatchListens {
    listenObj//调度监听对象  
    unlistenObj//取消监听对象
    dispatcher
    constructor(opts) {
        this.dispatchManager = opts.dispatchManager
    }

    init() {
        if (!this.listenObj) {
            let dispatchManager = this.dispatchManager
            let dispatcher = dispatchManager.dispatcher;   //scooper.dispatch
            if (!dispatcher || !dispatcher.listen) {
                throw new Error('scooper.dispatch.listen is undefined!')
            }
            this.listenObj = dispatcher.listen
            this.unlistenObj = dispatcher.unlisten
            this.dispatcher = dispatcher
        }
        this.registerChangeCfg();  //CHANGE_CFG
        this.registerShandleCall();   //软手柄通知派发
    }
    /**
     * 软手柄通知派发
     */
    registerShandleCall() {
        this.listenObj(this.dispatcher.event_const.SHANDLE_REGISTER_NOTIFY, (evt) => {
            devMode && console.log("头部软手柄注册通知", evt.msg)
            this.shandleRegisterMsg(evt.msg)
        })
    }
    /**
     * 软手柄注册/抢注册逻辑
     * @param {*} notify 
     */
    shandleRegisterMsg = (notify) => {
        let _this = this;
        if (notify && notify.type) {
            if (notify.type == "register_succ") {         //软手柄注册成功
                message.success(notify.msg);
            } else if (notify.type == "register_fail") {     //软手柄注册失败
                message.error(notify.msg);
            } else if (notify.type == "registered") {      //软手柄已注册 - 提示已注册，是否要抢注册(询问框)
                confirm({
                    title: '手柄已注册，是否要抢注册?',
                    onOk() {
                        _this.dispatcher.calls.shandlePreemptRegister();
                    },
                    onCancel() {
                        console.log("不去抢注册");
                    },
                })
            }
            else if (notify.type == "preempt_register") {   //软手柄被抢注册,当前页注销
                message.info(notify.msg);
            } else if (notify.type == "preempt_register_fail") {    //手柄抢注册失败 - 可能是号码非软手柄注册，无法触发强制注销
                message.error(notify.msg)
            } else if (notify.type == "deregister") {   //软手柄注销,注册状态中断
                message.error(notify.msg)
            }
        }
    }
    /**
     * CHANGE_CFG (手柄鉴权 & 暂离状态)
     */
    registerChangeCfg() {
        this.listenObj(this.dispatcher.event_const.CHANGE_CFG, (evt) => {
            this.confgChange(evt.msg)
        })
    }
    /**
     * 配置改变
     */
    confgChange = (msg) => {
        console.log(msg)
        if (msg) {
            let dutystate = msg.value.split(";")[0];    //state=allout / state=allin
            let tels = msg.value.split(";")[1]   //tels=111|222|33
            let telsString = tels && tels.split("=")[1];  //111|222|333
            let telsArray = telsString && telsString.split("|");   //[111,222,333]
            let stateType = dutystate.split("=")[1];   //allout / allin
            // 暂离  {type:"client_state",value:{state=allout;tels=887}}
            if (msg.type == 'client_state' && stateType == 'allout') {
                // 暂离
                store.dispatch(setDutyTelArray(telsArray))
                store.dispatch(setIsShowGoBack(true));
                store.dispatch(setIsShowTempLeave(false));
            } else if (msg.type == 'client_state' && stateType == 'allin') {
                store.dispatch(setDutyTelArray([]))  //设置值班号码
                store.dispatch(setIsShowGoBack(false));
                store.dispatch(setIsShowTempLeave(false));
            }
        }
    }
}

const dispatchRepeat = window.scooper.dispatchRepeat = new DispatchRepeat();

export default dispatchRepeat;