/*
 * @File: 语音调度-更多记录-点名记录
 * @Author: liulian
 * @Date: 2020-07-07 11:05:04
 * @version: V0.0.0.1
 * @LastEditTime: 2020-10-13 11:43:41
 */ 
import React, { Component } from "react";
import { Table } from "antd";
import { connect } from "react-redux";
import { apis } from "../../../../../util/apis";
import { formatGroupRecord } from "../../../../../util/method";
import {setShowContent,setPresentRecordList} from '../../../../../reducer/callRecord-handle-reduce';
import {setMemTelMapCache} from '../../../../../reducer/audio-handle-reducer'
import SearchBox from './search-box';
import PresentTable from './present-table'


@connect(
    state=>state.audioHandle,
    {setMemTelMapCache}
)
@connect(
    state=> state.callRecordHandle,
    {setShowContent,setPresentRecordList}
)
class PresentRecord extends Component {
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
                groupType:3,
            }
        }else{
            params = {
                searchKey:data.searchKey,
                groupType:3,
                timeMin:data.timeMin,
                timeMax:data.timeMax,
            }
        }
        let response = await apis.disp.pageGroupRecord(params);
        let list = formatGroupRecord(response,memTelMapCache);
        this.props.setPresentRecordList(list)
    }
    /**
     * 加载点名记录
     */
    loadPresentRecordList = async (param) => {
        let data = await apis.disp.pageGroupRecord(param);
        let {memTelMapCache} = this.props;
        let list = formatGroupRecord(data,memTelMapCache);
        this.props.setPresentRecordList(list)
    }
    componentDidMount() {
        let param = {
            groupType:3
        }
        this.loadPresentRecordList(param);
    }

    render() {
        let { presentRecordList } = this.props;
        return (
            <div className='present-wrap'>
                <SearchBox onClick={this.onSearchClick} />
                <PresentTable presentRecordList={presentRecordList} />
            </div>
        );
    }
}

export default PresentRecord;