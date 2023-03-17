/*
 * @File: 语音调度-更所记录-广播记录
 * @Author: liulian
 * @Date: 2020-07-07 11:03:49
 * @version: V0.0.0.1
 * @LastEditTime: 2021-04-06 17:22:24
 */
import React, { Component } from "react";
import { Table } from "antd";
import SearchBox from './search-box'
import { connect } from "react-redux";
import { apis } from "../../../../../util/apis";
import { formatGroupRecord } from "../../../../../util/method";
import { setShowContent, setBoardRecordList } from '../../../../../reducer/callRecord-handle-reduce';
import { setMemTelMapCache, setCurGroupCallMeetId } from '../../../../../reducer/audio-handle-reducer'
import BoardTable from './board-table'

@connect(
    state => state.audioHandle,
    { setMemTelMapCache, setCurGroupCallMeetId }
)
@connect(
    state => state.callRecordHandle,
    { setShowContent, setBoardRecordList }
)
class BoardRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    /**
     * 筛选查询
     */
    onSearchClick = async (data) => {
        let { memTelMapCache } = this.props;
        let params
        if (!data || data == null) {
            params = {
                groupType: 2,
            }
        } else {
            params = {
                searchKey: data.searchKey,
                groupType: 2,
                timeMin: data.timeMin,
                timeMax: data.timeMax,
            }
        }
        let response = await apis.disp.pageGroupRecord(params);
        let list = formatGroupRecord(response, memTelMapCache);
        this.props.setBoardRecordList(list)
    }
    /**
     * 加载广播记录
     */
    loadBoardRecordList = async (param) => {
        let data = await apis.disp.pageGroupRecord(param);
        let { memTelMapCache } = this.props;
        let list = formatGroupRecord(data, memTelMapCache);
        this.props.setBoardRecordList(list)
    }
    setCurMeetId = (data) => {
        if (data.code == 0) {
            let desc = data.data && data.data.description;
            this.props.setCurGroupCallMeetId(desc.id || '')
        }
    }
    componentDidMount() {
        let param = {
            groupType: 2
        }
        this.loadBoardRecordList(param);
    }
    render() {
        let { boardRecordList } = this.props;
        return (
            <div className='board-wrap'>
                <SearchBox onClick={this.onSearchClick} />
                <BoardTable boardRecordList={boardRecordList} setCurMeetId={this.setCurMeetId} />
            </div>
        );
    }
}

export default BoardRecord;