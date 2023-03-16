/*
 * @File: 会议调度
 * @Author: liulian
 * @Date: 2020-06-09 15:11:50
 * @version: V0.0.0.1
 * @LastEditTime: 2020-09-21 09:38:49
 */ 
import React, {Component} from "react";
import MeetNav from "./meet-nav";
import meetManager from '../../../util/meet-manager'


class MeetDispatch extends Component {
    render() {
        return (
            <MeetNav />
        );
    }
} 

export default MeetDispatch;