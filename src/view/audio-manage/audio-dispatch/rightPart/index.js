/*
 * @File: 语音调度-右侧入口文件
 * @Author: liulian
 * @Date: 2020-06-10 10:28:06
 * @version: V0.0.0.1
 * @LastEditTime: 2020-09-03 15:34:45
 */ 
import React, { Component } from "react";
import CallIn from './call-in';
import CallRecord from './call-record'



class RightPart extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className='right-wrap'>
                <CallIn />
                <CallRecord />
            </div>
        );
    }
}

export default RightPart;