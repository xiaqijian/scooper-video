/*
 * @File: 语音调度-右侧通话记录-通话记录列表
 * @Author: liulian
 * @Date: 2020-07-03 11:39:57
 * @version: V0.0.0.1
 * @LastEditTime: 2021-04-02 10:46:38
 */
import React, { Component } from "react";
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller'
import { setMemTelMapCache } from '../../../../reducer/audio-handle-reducer'
import { setRecordListData, setCurSelectItem } from '../../../../reducer/callRecord-handle-reduce';
import $ from 'jquery';
import { message } from "antd";
import { platUrl, getToken } from '../../../../config/constants'
import { apis } from "../../../../util/apis";
import dispatchManager from "../../../../util/dispatch-manager";
import { hideTel, loadCallRecord } from "../../../../util/method";
import { joinMeet } from "../../../../util/meet-method";


@connect(
    state => state.callRecordHandle,
    { setRecordListData, setCurSelectItem }
)
@connect(
    state => state.audioHandle,
    { setMemTelMapCache }
)
class RecordList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasMore: true,  //是否还有更多通话记录
        }
    }


    /**
     * 点击某一条通话记录
     */
    clickList = (item) => {
        this.props.setCurSelectItem(item);
    }


    fetchRecordData = () => {
        let { recordListData, recordAllData, searchParam } = this.props;
        if (recordAllData.hasNextPage) {
            let param = {
                pageNum: recordAllData.pageNum + 1,
                pageSize: 10,
                searchKey: searchParam.searchKey,
                timeMin: searchParam.timeMin,
                timeMax: searchParam.timeMax
            };
            loadCallRecord(param, 'update');
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
        joinMeet(item.tel);

    }
    /**
     * 录音下载
     */
    downRadio = (item) => {
        if (!item.recFile) {
            return;
        }
        apis.record.batchDownloadFiles({
            businessId: item.businessid,
            fileType: 0
        }).then((data) => {
            var ifup = document.getElementById('ifup');
            if (ifup) {
                document.body.removeChild(ifup);
            }
            var elemIF = document.createElement('iframe');
            elemIF.id = 'ifup';
            elemIF.src = platUrl + '/scooper-record/data/file/batchDownloadFiles'
                + '?token=' + getToken()
                + '&businessId=' + item.businessid
                + '&fileType=0';
            elemIF.style.display = 'none';
            document.body.appendChild(elemIF);
        })
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

    }

    render() {

        let { recordListData, curSelectItem, isShowDate, searchParam } = this.props;
        let { hasMore } = this.state;
        return (
            <div className={`record-list-wrap ${isShowDate == true ? '' : 'record-height'}`}>
                <ul>
                    <InfiniteScroll
                        pageStart={0}
                        initialLoad={false}
                        loadMore={() => { this.fetchRecordData() }}
                        hasMore={hasMore}
                        key={"dd"}
                        style={{ height: '100%' }}
                        useWindow={false}>
                        {recordListData && recordListData.map((item, index) => {
                            return (
                                <li className={`record-list ${item.recId == curSelectItem.recId ? 'onsel' : ''}`} key={'all-' + index} onClick={() => { this.clickList(item) }}>
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
                {!isEmpty(curSelectItem) &&
                    <div className='icon-operates'>
                        <i className="icon-call" title="呼叫" onClick={() => { this.makeCall(curSelectItem) }}></i>
                        <i className="icon-meet" title="加入会议" onClick={() => { this.joinMeet(curSelectItem) }}></i>
                        <i className={`icon-radio ${!curSelectItem.recFile ? 'icon-radio-dis' : ''}`}
                            title={`${!curSelectItem.recFile ? '暂无录音' : '录音下载'}`} onClick={() => { this.downRadio(curSelectItem) }}></i>
                        <i className="icon-black" title="加入黑名单" onClick={() => { this.addBlack(curSelectItem) }}></i>
                    </div>
                }
            </div>

        );
    }
}

export default RecordList;