/*
 * @File: 
 * @Author: liulian
 * @Date: 2020-10-10 10:42:36
 * @version: V0.0.0.1
 * @LastEditTime: 2020-10-15 11:12:36
 */
import React, { Component } from "react";
import { connect } from "react-redux";

import { Input, message } from "antd";

import { setMeetDetailList } from '../../../../reducer/meet-handle-reduce';

const { Search } = Input

@connect(
    state => state.meetHandle,
    { setMeetDetailList }
)
class MeetSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {

    }
    onChange = (e) => {


    }

    onSearch = (val) => {
        let { curMeet } = this.props;
        let searchResult = [];
        curMeet.attendees.map((mem) => {
            if (mem.name.toString().indexOf(val) > -1) {
                searchResult.push(mem);
            }
        })
        this.props.searchResult(searchResult);
    }
    render() {
        return (
            <Search
                placeholder="请输入人员姓名回车搜索"
                prefix={<i className="icon-meet-search"></i>}
                onSearch={value => this.onSearch(value)}
                onChange={this.onChange}
                className='meet-search'
                allowClear
            />
        );
    }
}

export default MeetSearch; 