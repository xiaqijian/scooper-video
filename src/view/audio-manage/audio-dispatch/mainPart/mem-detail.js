/*
 * @File: 语音调度-人员详情弹框
 * @Author: liulian
 * @Date: 2020-06-29 11:08:52
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 14:31:09
 */
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { platUrl, getToken } from '../../../../config/constants'
import { Modal, message, Avatar, Divider } from 'antd';
import { connect } from 'react-redux';
import { setMemList } from '../../../../reducer/audio-handle-reducer';
import { setConfigData } from '../../../../reducer/loading-reducer'
import dispatchManager from "../../../../util/dispatch-manager";
import { hideTel } from "../../../../util/method";
import timeUtil from "../../../../util/time-util";

@withRouter
@connect(
    state => state.audioHandle,
    { setMemList }
)
@connect(
    state => state.loading,
    { setConfigData }
)
class MemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.props.hidePop("memDetailVisible");
    };
    /**
     * 获取成员头像
     */
    getMemPicture = (mem) => {
        let tel = mem.memTel;
        let memInfo = this.props.memTelMapCache[tel];
        if (memInfo && memInfo.memPicture) {
            return platUrl + '/scooper-core-rest/data/contacts/orgMemberManage/getImage?fileName=' + memInfo.memPicture + '&token=' + getToken();
        } else {
            return platUrl + "/dispatch-web/images/img_mem.png";
        }

    }
    //呼叫
    makCall = (tel) => {
        if (tel) {

            let businessId = dispatchManager.accountDetail.operatorId + "_" + timeUtil.getTimeStamp();
            dispatchManager.dispatcher.calls.makeCall(tel, businessId)
        }
    }
    /**
     * 视频呼叫
     */
    makeVideoCall = (tel) => {
        if (tel) {
            let businessId = dispatchManager.accountDetail.operatorId + "_" + timeUtil.getTimeStamp();
            dispatchManager.dispatcher.calls.makeVideoCall(tel, businessId)
        }
    }
    /**
     * 得到跳转传真||短信的号码信息
     */
    getJumpInfo = (type, sendTel) => {
        let { configData } = this.props;
        if (type == 'sms') {
            if (configData.set['disp.set.show.sms'] == "true") {
                if (!sendTel) {
                    message.error("选择成员没有配置可操作的号码");
                } else {
                    this.jumpOk(sendTel, type)
                }
            } else {
                message.info("未配置短信模块");
            }
        }
        if (type == 'fax') {
            if (configData.set['disp.set.show.fax'] == "true") {
                if (!sendTel) {
                    message.error("选择成员没有配置可操作的号码");
                } else {
                    this.jumpOk(sendTel, type)
                }
            } else {
                message.info("未配置传真模块");
                return;
            }
        }
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
    componentDidMount() {

    }
    hideTel = (tel) => {
        let { configData } = this.props;
        if (JSON.stringify(configData) !== '{}' && configData.set["disp.set.hide.mobile"] == "true") {
            tel = tel.substring(0, 3) + "****" + tel.substr(tel.length - 4);
            return tel;
        } else {
            return tel
        }
    }
    render() {
        const { visible, mem, length, mainSymbol, configData } = this.props;
        return (
            <Modal
                className="mem-detail-modal"
                width="19.58%"
                bodyStyle={{ height: '466px' }}
                maskClosable={false}
                visible={visible}
                footer={null}
                onCancel={this.handleCancel}
            >
                <div className="mem-detail-wrap">
                    <div className="mem-info">
                        <div className="mem-basic">
                            <p className="mem-name over-ellipsis">{mem.name}</p>
                            <p className="mem-dept over-ellipsis">{mem.deptName}</p>
                        </div>
                        <Avatar size={74} src={this.getMemPicture(mem)} />
                        <div className="mem-btns">
                            <span className={`mem-normal ${mem.memMobile ? 'btn-phone' : 'btn-phone-dis'}`} onClick={() => { this.makCall(mem.memMobile) }}><span>手机</span></span>
                            <span className={`mem-normal ${mem.memTel2 ? 'btn-telephone' : 'btn-telephone-dis'}`} onClick={() => { this.makCall(mem.memTel2) }}><span>电话</span></span>
                            <span
                                className={`mem-normal ${(mem.memMobile && JSON.stringify(configData) !== '{}' && configData.set['disp.set.show.sms'] == "true") ? 'btn-msg' : 'btn-msg-dis'}`}
                                onClick={() => this.getJumpInfo('sms', mem.memMobile)}>
                                <span>短信</span>
                            </span>
                            <span
                                className={`mem-normal ${(mem.memFax && JSON.stringify(configData) !== '{}' && configData.set['disp.set.show.sms'] == "true") ? 'btn-fax' : 'btn-fax-dis'}`}
                                onClick={() => { this.getJumpInfo('fax', mem.memFax) }}>
                                <span>传真</span>
                            </span>
                        </div>
                    </div>
                    <ul className="mem-num">
                        {mem.memMobile &&
                            <li>
                                <span className="mem-type">手机</span>
                                <span className='mem-number' onClick={() => { this.makCall(mem.memMobile) }}>{this.hideTel(mem.memMobile)}</span>
                                {mainSymbol == 'memMobile' && <span className="mem-main">主号码</span>}
                            </li>
                        }
                        {mem.memTel2 &&
                            <li>
                                <span className="mem-type">电话</span>
                                <span className='mem-number' onClick={() => { this.makCall(mem.memTel2) }}>{hideTel(mem.memTel2)}</span>
                                {mainSymbol == 'memTel2' && <span className="mem-main">主号码</span>}
                            </li>
                        }
                        {mem.memFax &&
                            <li>
                                <span className="mem-type">传真</span>
                                <span className='mem-number'>{mem.memFax}</span>
                                {mainSymbol == 'memFax' && <span className="mem-main">主号码</span>}
                            </li>
                        }
                        {mem.memJkTel &&
                            <li>
                                <span className="mem-type">桌面终端</span>
                                <span className='mem-number' onClick={() => { this.makCall(mem.memJkTel) }}>{mem.memJkTel}</span>
                                {mainSymbol == 'memJkTel' && <span className="mem-main">主号码</span>}
                                <i className="btn-video" onClick={() => { this.makeVideoCall(mem.memJkTel) }}></i>
                            </li>
                        }
                        {/* {mem.memType == 1 && mem.memMsgTel &&
                            <li>
                            <span className="mem-type">移动终端</span>
                            <span className='mem-number'>{mem.memMsgTel}</span>
                            {mainSymbol == 'memMsgTel' && <span className="mem-main">主号码</span>}
                            <i className="btn-video"></i>
                        </li>
                        } */}
                        {/* {(mem.memMsgTel ||(mem.memMsgTel && mem.devCodeJx)) &&
                        
                        } */}
                        {(mem.memMsgTel && mem.devCodeZfy) ?
                            <li>
                                <span className="mem-type">执法记录仪</span>
                                <span className='mem-number' onClick={() => { this.makCall(mem.memMsgTel) }}>{mem.memMsgTel}</span>
                                {mainSymbol == 'memMsgTel' && <span className="mem-main">主号码</span>}
                                <i className="btn-video" onClick={() => { this.makeVideoCall(mem.memMsgTel) }}></i>
                            </li>
                            : mem.memMsgTel &&
                            <li>
                                <span className="mem-type">移动终端</span>
                                <span className='mem-number' onClick={() => { this.makCall(mem.memMsgTel) }}>{mem.memMsgTel}</span>
                                {mainSymbol == 'memMsgTel' && <span className="mem-main">主号码</span>}
                                <i className="btn-video" onClick={() => { this.makeVideoCall(mem.memMsgTel) }}></i>
                            </li>
                        }


                    </ul>
                    {length < 4 &&
                        <div className='gray-unimp'>
                            <Divider />
                            <span className='all-gray'>已经是全部信息了</span>
                            <Divider />
                        </div>
                    }

                </div>
            </Modal>

        );
    }
}

export default MemDetail;