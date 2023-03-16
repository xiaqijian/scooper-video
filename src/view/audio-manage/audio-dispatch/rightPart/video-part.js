/*
 * @File: 语音调度-视频
 * @Author: liulian
 * @Date: 2020-06-10 10:28:06
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-01 17:42:37
 */ 
import React, { Component } from "react";
import VideoManager from '../../../../util/video-manager'

class VideoPart extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <div className='video-part'>
               <div className='ocx-video hide'>
                    <div className="camera-content video-area">

                    </div>
                </div>

                <div className='web-rtc-video hide'>
                    <div className="web-rtc-camera-content-dis">

                    </div>
                </div>
            </div>
        );
    }
}

export default VideoPart;