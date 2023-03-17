/*
 * @File: 大会议桌入口
 * @Author: liulian
 * @Date: 2020-09-16 15:57:09
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-09 16:50:27
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { setMeetDetailList } from '../../../../reducer/meet-handle-reduce';
import BigDesk from "./big-desk";
import BigPanel from "./big-panel";

@connect(
    state => state.meetHandle,
    { setMeetDetailList }
)
class BigMeet extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {

    }

    render() {
        let { curSelectMeet } = this.props;
        return (
            curSelectMeet ?
                <div className="big-meet-wrap">
                    <div className='big-title'>
                        <div className='title-info'>
                            <span className='meet-name'>{curSelectMeet.subject}({curSelectMeet.attendees.length}人)</span>
                            {curSelectMeet.meetSymbol == 'main' && <span className='meet-symbol'>主会场</span>}
                            <i className='icon-zxh' onClick={this.props.onClick}></i>
                        </div>
                        <div className='title-time'>
                            <i className='icon-time'></i>
                            {curSelectMeet.conferenceTimeType == 'EDIT_CONFERENCE' ?
                                <span className='meet-time'>{curSelectMeet.timeBegin}</span>
                                :
                                !((curSelectMeet.meetCreateId == 'default') || ((curSelectMeet.id == curSelectMeet.subject || curSelectMeet.meetCreateId == curSelectMeet.subject))) &&
                                <span className='meet-time'>{curSelectMeet.timeLength}</span>
                            }
                        </div>
                    </div>
                    {curSelectMeet.attendees && curSelectMeet.attendees.length < 25 && <BigDesk curMeet={curSelectMeet} />}
                    {curSelectMeet.attendees && curSelectMeet.attendees.length >= 25 && <BigPanel curMeet={curSelectMeet} />}
                </div>
                : ''
        );
    }
}

export default BigMeet; 