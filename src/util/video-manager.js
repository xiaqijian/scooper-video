/*
 * @File: 视频管理
 * @Author: liulian
 * @Date: 2020-07-30 16:38:57
 * @version: V0.0.0.1
 * @LastEditTime: 2022-01-06 14:29:28
 */
import { getToken, stsConst } from '../config/constants'
import { Component } from 'react'
import { message } from 'antd'
import { setIsShowMainZdh, setIsShowSubZdh } from '../reducer/audio-handle-reducer'
import { setConfigData } from '../reducer/loading-reducer'
import store from '../store/index'
import config from '../lib/sha256/scooper.config'
import $ from 'jquery'
import EventDispatcher from './event'

class VideoManager extends Component {
    videoController   //videoController
    callInterval
    constructor(props) {
        super(props);

    }
    componentDidMount() {
        window.configTime = setInterval(() => {
            let { configData } = store.getState().loading;
            if (JSON.stringify(configData) !== '{}') {
                clearInterval(window.configTime);
                if (configData.set["disp.set.video.use"] == "true") {
                    window.require(window.video, ['jquery', 'video'], ($, Video) => {
                        this.initializa($, config, Video);
                    })
                } else if (configData.set["disp.set.video.use"] !== 'true') {
                    this.videoController = '';
                    message.info("当前不支持视频通话");
                    return;
                }
            }
        }, 500)
    }
    initializa = ($, config, Video) => {
        let videoConf;
        let videoController;
        const _this = this
        config.initialize(function (conf) {
            $(function () {
                videoConf = conf;
                // 初始化视频播放方式
                // _this.initplaVideoType();
                if (!_this.hasOcx()) {
                    return;
                }
                var videoOpts = {
                    //初始化时的界面显示的分屏树
                    windows: 1,
                    //共有哪几种分屏
                    windowsArr: [1],
                    //总的窗口数
                    windowsNum: 1,
                    conf: {
                        user: conf['video.username'],
                        passwd: conf['video.password'],
                        ip: conf['video.ip'],
                        port: conf['video.port'],
                        janusUrl: conf['video.janus.url'],
                        token: getToken()
                    },
                    extra: false,
                    streamType: conf['video.stream'],
                    openChangeWindowStrategy: conf['video.openChangeWindowStrategy'] === 'true',
                    capImage: conf['video.cap.image'] === 'true',
                    videoCapImagePath: conf['video.cap.image.path'],
                    videoInfoInBottom: false
                };

                var videoArea = _this.isIE() ? '.video-area' : '.web-rtc-camera-content-dis';
                _this.videoController = new Video($(videoArea), videoOpts);
                console.log(_this.videoController);
                window.scooper.videoManagers = {};
                window.scooper.videoManagers.videoController = _this.videoController;
                if (_this.videoController) {
                    _this.videoController.addListener('playsuccess', (e) => {
                        // 视频播放成功
                        _this.showVideo(e);
                    })
                    _this.videoController.addListener('afterclose', (e) => {
                        // 视频关闭
                        if (!$(".web-rtc-video").hasClass('hide')) {
                            $(".web-rtc-video").addClass('hide');
                        }
                        if ($(".video-info")) {
                            $(".video-info").remove()
                        }
                        if ($(".video-hung")) {
                            $(".video-hung").remove()
                        }
                        clearInterval(this.callInterval)
                    })
                }
            })

        }, undefined, { 'type': 'main', 'token': getToken() })
    }
    /**
     * 显示视频框
     */
    showVideo = (e) => {
        let curId = e.id;
        let curType;
        $(".web-rtc-video").removeClass('hide');
        let shankCall = store.getState().audioHandle.shankCall;
        if (shankCall.subType == 'sub' && curId == shankCall.subTel) {
            curType = 'sub'
        } else if (shankCall.mainType == 'main' && curId == shankCall.mainTel) {
            curType = 'main'
        }
        let name = "";
        let time = "";
        let talkStatus = '';
        if (curType == 'main') {
            name = shankCall.mainMemName;
            time = shankCall.mainLong;
            talkStatus = shankCall.mainTalkStatus;
        } else {
            name = shankCall.subMemName;
            time = shankCall.subLong;
            talkStatus = shankCall.subTalkStatus;
        }
        this.callInterval = setInterval(() => {
            let shankCall = store.getState().audioHandle.shankCall;
            let time = shankCall.mainLong;
            $(".talk-long").html(time)
        }, 1000)
        let temp = '<div class="video-info">' +
            '<span>与' + name + '视频通话中</span>' +
            '<span class="talk-long">' + time + '</span>' +
            '</div>' +
            '<i class="video-zxh"></i>' +
            '<i class="btn-hungup video-hung" id="hung-' + e.id + '"></i>'
        if ($(".video-info").length == 0 || $(".video-hung").length == 0) {
            $('.screen-' + (e.index + 1)).append(temp);
        }
        let _this = this;
        // 挂断按钮点击
        $('#hung-' + e.id).click((event) => {
            _this.videoController.close(e.index);
            if (talkStatus == stsConst.DOUBLETALK) {
                if (window.scooper.dispatchRepeat && window.scooper.dispatchRepeat.dispatcher) {
                    window.scooper.dispatchRepeat.dispatcher.calls.hungUp(e.id);
                } else if (window.scooper.dispatchManager && window.scooper.dispatchManager.dispatcher) {
                    window.scooper.dispatchManager.dispatcher.calls.hungUp(e.id);
                }
            } else if (talkStatus == stsConst.MONITORANSWER) {
                if (window.scooper.dispatchRepeat && window.scooper.dispatchRepeat.dispatcher) {
                    window.scooper.dispatchRepeat.dispatcher.calls.tripleHungup(e.id);
                } else if (window.scooper.dispatchManager && window.scooper.dispatchManager.dispatcher) {
                    window.scooper.dispatchManager.dispatcher.calls.tripleHungup(e.id);
                }
                // window.scooper.dispatchManager.getCalls().tripleHungup(e.id);
            }
            if (curType == 'main') {
                store.dispatch(setIsShowMainZdh(false))
            } else {
                store.dispatch(setIsShowSubZdh(false))
            }

        })
        // 最小化按钮点击
        $(".video-zxh").click((event) => {
            store.dispatch(setIsShowMainZdh(true))
            store.dispatch(setIsShowSubZdh(true))
            if (!$(".web-rtc-video").hasClass('hide')) {
                $(".web-rtc-video").addClass('hide');
            }
        })
    }

    /**
    * 是否安装ocx控件
    */
    hasOcx = () => {
        if (!(!!window.ActiveXObject || "ActiveXObject" in window)) {
            return true;
        }
        return true;
    }
    /**
     * 判断是否是IE
     */
    isIE = () => {
        return !!window.ActiveXObject || "ActiveXObject" in window;
    }
    render() {
        return (
            null
        )
    }
}

// window.scooper = window.scooper || {}
// const videoManager = window.scooper.videoManagers = new VideoManager();
export default VideoManager;