/*
 * @File: 语音调度-右侧通话记录-呼入未接列表
 * @Author: liulian
 * @Date: 2020-07-03 11:39:57
 * @version: V0.0.0.1
 * @LastEditTime: 2021-04-02 10:51:17
 */
import React, { Component } from "react";
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller'
import { setCurSelectMissItem, setCallInMissCount } from '../../../../reducer/callRecord-handle-reduce';
import { message } from "antd";
import { apis } from "../../../../util/apis";
import dispatchManager from "../../../../util/dispatch-manager";
import { hideTel, loadCallInMiss } from "../../../../util/method";


@connect(
    state => state.callRecordHandle,
    { setCurSelectMissItem, setCallInMissCount }
)
class MissList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMore: true,  //是否还有更多通话记录
        }
    }


    /**
     * 点击某一条通话记录
     */
    clickLists = (item) => {
        this.props.setCurSelectMissItem(item);
    }


    fetchRecordData = () => {
        let { callInMissData, searchParam } = this.props;
        if (callInMissData.hasNextPage) {
            let param = {
                pageNum: callInMissData.pageNum + 1,
                pageSize: 10,
                searchKey: searchParam.searchKey,
                timeMin: searchParam.timeMin,
                timeMax: searchParam.timeMax
            };
            loadCallInMiss(param, 'update');
        }
    }

    /**
     * 呼叫
     */
    makeCall = (item) => {
        dispatchManager.getCalls().makeCall(item.tel);
    }
    /**
     * 加入会议
     */
    joinMeet = (item) => {
        dispatchManager.getMeets().joinMeetMember(item.tel)
    }
    /**
     * 加入黑名单
     */
    addBlack = async (item) => {
        let data = await apis.disp.addBlacks({ tels: item.tel });
        if (data.code == 0) {
            message.success("添加成功");
        }
    }
    /**
     * 阅读所有呼入未接
     */
    readAllCount = async () => {
        let data = await apis.disp.readALLCallInMiss();
        if (data.code == 0) {
            this.props.setCallInMissCount('');
        }

    }
    /**
     * 获得title
     */
    getTitle = (item) => {
        let title = '';
        if (item.name) {
            title = item.name + "-"
        }
        if (item.tel) {
            title += hideTel(item.tel)
        }
        return title
    }

    componentDidMount() {
        this.readAllCount()
    }


    render() {
        let { callInMissList, curSelectMissItem, isShowDate } = this.props;
        let { hasMore } = this.state;
        return (
            <div className={`record-list-wrap ${isShowDate == true ? '' : 'record-height'}`}>
                <ul>
                    <InfiniteScroll
                        pageStart={0}
                        initialLoad={false}
                        loadMore={() => { this.fetchRecordData() }}
                        hasMore={hasMore}
                        key={"cc"}
                        style={{ height: '100%' }}
                        useWindow={false}>
                        {callInMissList && callInMissList.map((item, index) => {
                            return (
                                <li className={`record-list ${item.recId == curSelectMissItem.recId ? 'onsel' : ''}`} key={"miss" + item.recId} onClick={() => { this.clickLists(item) }}>
                                    <i className={`icon-record  ${(item.callType == 'incallin' || item.callType == 'callin' || item.callType == 'incall') ? 'icon-callin' : ''}${(item.callType == 'incallout' || item.callType == 'callout') ? 'icon-callout' : ''} ${item.isCallInMiss == 1 ? 'icon-callmiss' : ''}`}></i>
                                    <span
                                        className={`record-name ${item.isCallInMiss == 1 ? 'record-miss-name' : ''}`}
                                        title={this.getTitle(item)}>
                                        {item.name || hideTel(item.tel)}
                                    </span>
                                    <span className={`record-date ${item.isCallInMiss == 1 ? 'record-miss-date' : ''}`}>{item.tmCallT.substring(0, 16)}</span>
                                    {item.callLen && <p className="call-length">{item.callLen}</p>}
                                </li>
                            )
                        })
                        }
                    </InfiniteScroll>
                </ul>
                {!isEmpty(curSelectMissItem) &&
                    <div className='icon-operates'>
                        <i className="icon-call" title="呼叫" onClick={() => { this.makeCall(curSelectMissItem) }}></i>
                        <i className="icon-meet" title="加入会议" onClick={() => { this.joinMeet(curSelectMissItem) }}></i>
                        <i className={`icon-radio-dis`} title="暂无录音"></i>
                        <i className="icon-black" title="加入黑名单" onClick={() => { this.addBlack(curSelectMissItem) }}></i>
                    </div>
                }
            </div>

        );
    }
}

export default MissList;