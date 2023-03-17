/*
 * @File: 语音调度-右侧黑名单管理
 * @Author: liulian
 * @Date: 2020-07-03 16:58:59
 * @version: V0.0.0.1
 * @LastEditTime: 2021-04-02 11:23:25
 */
import React, { Component } from "react";
import { Button, Badge, Input, DatePicker, Divider, message } from "antd";
import BlackTable from './black-table';
import AddMember from '../../../../component/add-member'
import { blackUserPickTitle } from '../../../../config/constants'
import { connect } from 'react-redux';
import { setBlackListData, setShowContent } from '../../../../reducer/callRecord-handle-reduce';
import { setMemTelMapCache } from '../../../../reducer/audio-handle-reducer'
import dispatchManager from "../../../../util/dispatch-manager";
import { apis } from "../../../../util/apis";
import $, { param } from 'jquery'
import { hideTel } from "../../../../util/method";

const { Search } = Input

@connect(
    state => state.callRecordHandle,
    { setBlackListData, setShowContent }
)
@connect(
    state => state.audioHandle,
    { setMemTelMapCache }
)
class BlackList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            choseMemList: [],      //人员选择器 最终选择的人员数据
        }

    }

    /**
     * 显示人员选择框
     */
    showMemChose() {
        this.setState({
            modalVisible: true,
        })
    }

    /**
     * 获取人员选择器 人员
     * @param memData 返回的人员数据
     */
    getMemData = (memData) => {
        this.setState({
            modalVisible: false,
            choseMemList: memData
        })
        let telsArr = [];
        if (memData.length > 0) {
            memData.map((item) => {
                telsArr.push(item.memTel)
            })
        }
        let tels = telsArr.join(",");
        let params = {
            telType: 0,
            tels
        }
        this.addBlack(params);
    };

    /**
     * 加载黑名单数据
     */
    loadBlackList = async () => {
        let { memTelMapCache } = this.props;
        let params = {
            telType: 0
        }
        let data = await apis.disp.listBlack(params);
        data && data.list.length > 0 && data.list.map((item) => {
            item.key = item.id;
            item.hideTel = hideTel(item.tel);
            item.name = memTelMapCache[item.tel] ? memTelMapCache[item.tel].name : hideTel(item.tel)
        })
        this.props.setBlackListData(data.list);
    }

    /**
     * 关闭黑名单
     */
    closeBlackList = () => {
        this.props.setShowContent('callRecord')
    }

    /**
     * 输入号码添加黑名单
     */
    addBlackByTel = async () => {
        let tel = $(".num-add input").val();
        if (tel) {
            let params = {
                telType: 0,
                tels: tel
            }
            this.addBlack(params);
        } else {
            message.error("请输入号码");
            return;
        }
    }
    addBlack = async (params) => {
        let data = await apis.disp.addBlacks(params);
        if (data.code == 0) {
            message.success("添加成功");
            this.loadBlackList();
        }
    }
    /**
     * 搜索黑名单
     */
    searchBlack = async (value) => {
        let { memTelMapCache } = this.props;
        let data = await apis.disp.listBlack({ searchKey: value })
        if (data) {
            data.list.map((item) => {
                item.key = item.id;
                item.hideTel = hideTel(item.tel);
                item.name = memTelMapCache[item.tel] ? memTelMapCache[item.tel].name : hideTel(item.tel);
            })
            this.props.setBlackListData(data.list);
        }

    }

    componentDidMount() {
        this.loadBlackList();
    }


    render() {
        const { modalVisible } = this.state;
        return (
            <div className='black-wrap'>
                <div className="call-header">
                    <i className="icon-blackList"></i>
                    <span className="title">黑名单管理</span>
                    <Button className='close-black' onClick={() => { this.closeBlackList() }}></Button>
                </div>
                <div className="add-wrap">
                    <p className="add-span">添加黑名单人员：</p>
                    <div className='add-type'>
                        <Button type="primary" className='core-add' onClick={() => this.showMemChose()}>通讯录选择</Button>
                        <Input
                            className="num-add"
                            placeholder="请输入号码进行添加"
                            suffix={
                                <Button type="primary" className='icon-add' title="加入黑名单" onClick={() => this.addBlackByTel()}></Button>
                            }
                        />
                    </div>
                </div>
                <Search
                    placeholder="请输入名字或号码进行搜索"
                    className="black-search"
                    onSearch={value => this.searchBlack(value)}
                    prefix={<i className='icon-search-num'></i>}
                />
                <BlackTable loadBlackList={this.loadBlackList} />

                <AddMember modalVisible={modalVisible} getMemData={(mems) => this.getMemData(mems)} title={blackUserPickTitle} />

            </div>

        );
    }
}

export default BlackList;