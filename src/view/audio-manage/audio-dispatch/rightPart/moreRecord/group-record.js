/*
 * @File: 语音调度-更所记录-组呼选呼
 * @Author: liulian
 * @Date: 2020-07-07 11:01:23
 * @version: V0.0.0.1
 * @LastEditTime: 2021-04-06 17:20:48
 */
import React, { Component } from "react";
import { Table } from "antd";
import SearchBox from './search-box';
import GroupNestedTable from './group-nested'
import { apis } from "../../../../../util/apis";
import { formatGroupRecord } from "../../../../../util/method";
import { connect } from "react-redux";
import { setShowContent, setGroupRecordList } from '../../../../../reducer/callRecord-handle-reduce';
import { setMemTelMapCache, setCurGroupCallMeetId } from '../../../../../reducer/audio-handle-reducer'

@connect(
    state => state.audioHandle,
    { setMemTelMapCache, setCurGroupCallMeetId }
)
@connect(
    state => state.callRecordHandle,
    { setShowContent, setGroupRecordList }
)
class GroupRecord extends Component {
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
                groupType: 1,
            }
        } else {
            params = {
                searchKey: data.searchKey,
                groupType: 1,
                timeMin: data.timeMin,
                timeMax: data.timeMax,
            }
        }

        let response = await apis.disp.pageGroupRecord(params);

        let list = formatGroupRecord(response, memTelMapCache);
        this.props.setGroupRecordList(list)
    }
    setCurMeetId = (data) => {
        if (data.code == 0) {
            let desc = data.data && data.data.description;
            this.props.setCurGroupCallMeetId(desc.id || '')
        }
    }

    componentDidMount() {

    }

    render() {
        let { groupRecordList } = this.props;
        return (
            <div>
                <SearchBox onClick={this.onSearchClick} />
                <GroupNestedTable groupRecordList={groupRecordList} setCurMeetId={this.setCurMeetId} />
            </div>
        )
    }
}

export default GroupRecord;