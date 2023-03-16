/*
 * @File: 语音调度-更多记录-轮询记录
 * @Author: liulian
 * @Date: 2020-07-07 11:06:10
 * @version: V0.0.0.1
 * @LastEditTime: 2020-10-13 11:43:30
 */ 
import React, { Component } from "react";
import { Table } from "antd";
import SearchBox from './search-box';
import { connect } from "react-redux";
import { apis } from "../../../../../util/apis";
import { formatGroupRecord } from "../../../../../util/method";
import {setShowContent,setPollRecordList} from '../../../../../reducer/callRecord-handle-reduce';
import {setMemTelMapCache} from '../../../../../reducer/audio-handle-reducer'
import PollTable from './poll-table'

@connect(
    state=>state.audioHandle,
    {setMemTelMapCache}
)
@connect(
    state=> state.callRecordHandle,
    {setShowContent,setPollRecordList}
)
class PollRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
     * 筛选查询
     */
    onSearchClick = async (data) => {
        let {memTelMapCache} = this.props;
        let params
        if(!data || data == null){
            params = {
                groupType:4,
            }
        }else{
            params = {
                searchKey:data.searchKey,
                groupType:4,
                timeMin:data.timeMin,
                timeMax:data.timeMax,
            }
        }
        let response = await apis.disp.pageGroupRecord(params);
        let list = formatGroupRecord(response,memTelMapCache);
        this.props.setPollRecordList(list)
    }

    /**
     * 加载轮询记录
     */
    loadPollRecordList = async (param) => {
        let data = await apis.disp.pageGroupRecord(param);
        let {memTelMapCache} = this.props;
        let list = formatGroupRecord(data,memTelMapCache);
        this.props.setPollRecordList(list)
    }
    componentDidMount() {
        let param = {
            groupType:4
        }
        this.loadPollRecordList(param);
    }

    render() {
        let { pollRecordList } = this.props;
        return (
            <div className='poll-wrap'>
                <SearchBox onClick={this.onSearchClick} />
                <PollTable pollRecordList={pollRecordList} />
            </div>
        );
    }
}

export default PollRecord;