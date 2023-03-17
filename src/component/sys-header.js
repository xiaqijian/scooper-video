
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter, NavLink } from 'react-router-dom';
import { Modal, Dropdown, Menu, Button, message } from 'antd';
import { ROUTER_CFG, commonData } from "../config/config";
import $ from 'jquery'
import qs from "qs";
import moment from 'moment'
import { setIsShowTempLeave, setIsShowGoBack } from '../reducer/callIn-handle-reduce';
import { setConfigData, setNavArr, setIsShowMits, setIsShowPwdModal, setIsShowDisMsg } from '../reducer/loading-reducer'
import { setIsShowMainZdh, setIsShowSubZdh } from '../reducer/audio-handle-reducer'
import TempLeaveModal from "./temp-leave-modal";
import GoBackModal from './go-back-modal'
import dispatchRepeat from "./dispatch-repeat";
import { apis } from "../util/apis";
import PasswordModal from "./password-modal";
import { isMidStatus } from "../config/constants";


const { confirm } = Modal;
let account;

@withRouter
@connect(
    state => state.loading,
    { setConfigData, setNavArr, setIsShowMits, setIsShowPwdModal, setIsShowDisMsg }
)
@connect(
    state => state.callInHandle,
    { setIsShowTempLeave, setIsShowGoBack }
)
@connect(
    state => state.audioHandle,
    { setIsShowMainZdh, setIsShowSubZdh }
)
class SysHeader extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            /* 现在时间 */
            time: "",
            date: '',
            week: "",
        };
    }

    componentDidMount() {
        this.getNowTime();

        this.timer = setInterval(() => {
            this.getNowTime();
        }, 1000);
    }

    /* 得到现在时间 */
    getNowTime = () => {
        let nowTime = moment();
        let date = nowTime.format("YYYY/MM/DD");
        let time = nowTime.format("HH:mm:ss");
        let week = nowTime.format('dddd').replace(/星期/g, "周");
        this.setState({
            time: time,
            date: date,
            week: week
        });
    };

    /**
     * 退出登录
     */
    exitSystem() {
        confirm({
            title: "确定要退出系统吗?",
            content: "",
            onOk: () => {
                dispatchRepeat && dispatchRepeat.dispatcher.logout();
                localStorage.clear();
                sessionStorage.clear();
                // TODO：打包
                window.location.href = '/scooper-dispatch-web';
            }
        });
    }
    /**
     * 修改密码
     */
    resetPwd() {
        this.props.setIsShowPwdModal(true)
    }
    /**
     * 暂离 按钮点击
     */
    tempLeave = () => {
        this.props.setIsShowTempLeave(true);
        this.props.setIsShowGoBack(false);
    }
    /**
    * 隐藏弹框
    */
    hidePop = (tag) => {
        if (tag == 'isShowTempLeave') {
            this.props.setIsShowTempLeave(false)
        } else if (tag == 'isShowGoBack') {
            this.props.setIsShowGoBack(false);
        } else if (tag == 'isShowPwdModal') {
            this.props.setIsShowPwdModal(false)
        }
    }
    // 模式2下
    itemClick = (item) => {
        let { navArr } = this.props;
        // if (item.key) {
        //     navArr.forEach(element => {
        //         if ($("#nav-" + element.key).hasClass("checked-style")) {
        //             $("#nav-" + element.key).removeClass("checked-style")
        //         }
        //     });
        //     $("#nav-" + item.key).addClass("checked-style");

        //     if (!$(".iframe-" + item.key).attr("src")) {
        //         $(".iframe-" + item.key).attr("src", item.url);
        //     }
        //     $(".content-fream").hide();
        //     $(".iframe-" + item.key).show();
        // }
    }
    /**
     * 投屏按钮点击
     */
    videoRecord = () => {
        let videoRecordId = window.videoRecordId;
        if (!videoRecordId) {
            message.error("录屏软件未就绪，无法投屏");
            return;
        }
        let params = {
            "device_id": videoRecordId
        }
        const dataStr = JSON.stringify(params);
        let name = sessionStorage.getItem('dispAccountName') + "的录屏" || "录屏";
        let paramDatas = {
            "type": "nvr",
            "name": name,
            "content": videoRecordId,
            "data": dataStr,
            "block_frame": "video"
        }
        apis.mits.open(paramDatas).then((data) => {
            if (data.code != 0) {
                if (data.data.msg.indexOf("已存在") >= 0) {
                    message.error("录屏已投放");
                }
                else {
                    message.error("投屏失败," + data.data.msg)
                }
            } else {
                message.success("投屏成功")
            }
        })
    }
    // 模式3下
    navClick = (item) => {
        let { configData } = this.props;
        let type = configData.set["disp.set.module.loadTogether"];
        let isUseVideo = configData.set["disp.set.video.use"]
        if (isUseVideo == 'true') {
            this.props.setIsShowMainZdh(true);
            this.props.setIsShowSubZdh(true);
            if (!$(".web-rtc-video").hasClass('hide')) {
                $(".web-rtc-video").addClass('hide');
            }
        }


        if (type == 3 && item && item.key == 'video') {
            this.props.setIsShowDisMsg(false);
        } else {
            this.props.setIsShowDisMsg(true);
        }
        if (type == 3) {   //模式3下 从网页调度切换到其他模块，做janus的销毁动作，切换回来之后会重新初始化
            window.scooper.videoManager && window.scooper.videoManager.videoController.destoryJanus();  //视频调度
            window.scooper.videoManagers && window.scooper.videoManagers.videoController.destoryJanus();  //网页调度
        }
    }

    render() {
        let { isShowGoBack, isShowTempLeave, configData, navArr, isShowPwdModal } = this.props;
        // let fixpre = qs.stringify(commonData.getCommonData('urlParams'));
        const menu = (
            <Menu>
                <Menu.Item>
                    <a>{sessionStorage.getItem('dispAccountName')}</a>
                </Menu.Item>
                {JSON.stringify(configData) !== '{}' && configData.nav["disp.nav.mits"] == 'true' &&
                    <Menu.Item>
                        <a onClick={() => this.videoRecord()}>投屏</a>
                    </Menu.Item>
                }
                <Menu.Item>
                    <a onClick={() => this.resetPwd()}>修改密码</a>
                </Menu.Item>
                <Menu.Item>
                    <a onClick={() => this.exitSystem()}>退出登录</a>
                </Menu.Item>
            </Menu>
        )
        const { time, date, week } = this.state;
        return (
            <div className="common-header" id="dispatch-head">
                <div className="common-header-title">
                    {isMidStatus ?
                        <></>
                        :
                        <i className="common-header-title-logo"></i>
                    }
                    {JSON.stringify(configData) !== '{}' ?
                        <span>{configData.set['disp.set.header.title']}</span>
                        : <span>应急指挥中心</span>
                    }
                </div>
                <ul>
                    {navArr.map((item, index) => {
                        return (
                            <li key={index} onClick={() => { this.navClick(item) }} >
                                {JSON.stringify(configData) !== '{}' && configData.set["disp.set.module.loadTogether"] == 1 &&
                                    <a id={'nav-' + item.key} className={`${item.key == configData.nav["disp.nav.default"] ? 'checked-style' : ''}`} onClick={() => { this.itemClick(item) }}> {item.title}</a>
                                }
                                {JSON.stringify(configData) !== '{}' && configData.set["disp.set.module.loadTogether"] == 3 &&
                                    <NavLink
                                        to={`/main/${item.key}`}
                                        activeClassName="checked-style"
                                    >
                                        {item.title}
                                    </NavLink>
                                }
                            </li>
                        );
                    })}
                </ul>

                {/* 右侧用户信息*/}
                <div className="common-header-right">
                    <div className="icon-part">
                        <a onClick={() => { this.tempLeave() }}>
                            <i className="icon-zl"></i>
                        </a>
                        {/* <a onClick={() => this.exitSystem()}>
                            <i className="right-info"></i>
                        </a> */}
                        <Dropdown overlay={menu}>
                            <a>
                                <i className="right-admin"></i>
                            </a>
                        </Dropdown>
                    </div>
                    {/* <div className="weather-part">
                    <div>
                        <i className="weather-icon"></i>
                        <span>28C</span>
                    </div>
                    <p className="weather-info">轻度污染</p>
                </div> */}
                    {/* 右侧日期信息 */}
                    <div className="time-info-part">
                        <h2>{time}</h2>
                        <h4>
                            {date} <span>{week}</span>
                        </h4>
                    </div>
                </div>

                {isShowTempLeave && <TempLeaveModal visible={isShowTempLeave} hidePop={this.hidePop} />}
                {isShowGoBack && <GoBackModal visible={isShowGoBack} hidePop={this.hidePop} />}
                {isShowPwdModal && <PasswordModal visible={isShowPwdModal} hidePop={this.hidePop} />}
            </div>
        );
    }
}

export default SysHeader;
