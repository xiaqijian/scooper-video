/*
 * @File: 事件模块页面
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 14:07:09
 */
import React, { PureComponent } from 'react';
import { injectUnount } from "../../util/inject-unount";
import { withRouter } from 'react-router-dom';
import videoManage from '../../util/video-manager'

@withRouter
class AudioManage extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            path: 'main/dispatch',
            loading: true,
        }
    }

    componentDidMount() {
        if (this.state.path == 'main/dispatch') {
            this.props.history.push(`/${this.state.path}/audio`);
        }
    }
   

    render() {
        return (
            <div></div>
        )
    }
}

export default AudioManage;