/*
 * @File: 语音调度-呼叫保持面板
 * @Author: liulian
 * @Date: 2020-07-15 11:21:33
 * @version: V0.0.0.1
 * @LastEditTime: 2022-05-16 17:30:43
 */

import React, { Component } from "react";
import { Button, Carousel } from 'antd';
import LeftCore from "../leftPart";
import dispatchManager from "../../../../util/dispatch-manager";
import { getDeptName } from "../../../../util/method";


class KeepInPane extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    // 取回
    unhold = (e, tel) => {
        dispatchManager.dispatcher.calls.unhold(tel);
    }

    componentDidMount() {

    }

    render() {
        let { keepInList } = this.props;
        let accountDetail = window.scooper.dispatchManager.accountDetail;
        return (
            <div className='keep-pane'>
                <Carousel dotPosition="left" dots={true} >
                    {keepInList && keepInList.map((item, index) => {
                        return (
                            <div className="keep-list">
                                <div style={{ float: "left" }}>
                                    <span className='keep-name'>{item.name}</span>
                                    <span className='keep-duty'>{getDeptName(item.deptName, item.dutyName)}</span>
                                    <div className="keep-date-wrap">
                                        <span>正在保持</span>
                                        <span className='keep-time'>{item.waitTime}</span>
                                    </div>
                                </div>
                                <Button
                                    className={`${((accountDetail && accountDetail.mainTel && item.tel == accountDetail.mainTel) || (accountDetail && accountDetail.viceTel && item.tel == accountDetail.viceTel)) ? 'btn-take-dis' : 'btn-take'}`}
                                    disabled={((accountDetail && accountDetail.mainTel && item.tel == accountDetail.mainTel) || (accountDetail && accountDetail.viceTel && item.tel == accountDetail.viceTel)) ? true : false}
                                    onClick={(e) => { this.unhold(e, item.tel) }}> 取回 </Button>
                            </div>
                        )
                    })}
                </Carousel>
            </div>
        );
    }
}

export default KeepInPane;