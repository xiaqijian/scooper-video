/*
 * @File: 语音调度-组呼通知Tab-通知记录
 * @Author: liulian
 * @Date: 2020-07-05 16:40:03
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-12 16:48:17
 */
import React, { Component } from "react";
import { Table } from "antd";
import { connect } from 'react-redux';
import { setShowRecordInfo, setRecordItemData, setAllNotifyRecord, setNotifyRecord } from '../../../../../reducer/audio-handle-reducer';
import { apis } from "../../../../../util/apis";
import InfiniteScroll from 'react-infinite-scroller';

@connect(
    state => state.audioHandle,
    { setShowRecordInfo, setRecordItemData, setAllNotifyRecord, setNotifyRecord }
)
class NotifyRecord extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasMore: true,
        }
    }

    openRecordInfo = (e, record) => {
        e.stopPropagation();
        this.props.setShowRecordInfo(false);
        this.props.setRecordItemData(record);
    }
    loadNotifyRecord = async (params, update) => {
        let { notifyRecord } = this.props;

        let data = await apis.disp.pageSerNotifyRecord(params);
        let { memTelMapCache } = this.props;
        if (data) {
            data.list.forEach((item) => {
                item.key = item.notifyId;
                item.tmNotify = item.tmNotify.substring(0, 4) + "/" + item.tmNotify.substring(4, 6) + "/" + item.tmNotify.substring(6, 8) + " " + item.tmNotify.substring(8, 10) + ":" + item.tmNotify.substring(10, 12)
                item.callee = item.notifyRecordList[0].caller;
                item.memNames = ""
                if (item.calleds.length > 0) {
                    item.calleds.forEach((cal) => {
                        if (memTelMapCache[cal] && memTelMapCache[cal].name != undefined) {
                            item.memNames += memTelMapCache[cal].name + "、"
                        } else {
                            item.memNames = cal + "、"
                        }
                    })
                }
                item.memNames = item.memNames.substring(0, item.memNames.length - 1) + " 共(" + item.calleds.length + ")人"
                if (item.notifyRecordList.length > 0) {
                    item.notifyRecordList.forEach((notify) => {
                        if (memTelMapCache[notify.called]) {
                            notify.calledName = memTelMapCache[notify.called].name
                        } else {
                            notify.calledName = notify.called
                        }
                    })
                }
            })
            if (update) {

                this.props.setAllNotifyRecord(data);
                this.props.setNotifyRecord([...notifyRecord, ...data.list])
            } else {
                this.props.setAllNotifyRecord(data);
                this.props.setNotifyRecord(data.list)
            }

        }
    }

    fetchMemData = () => {
        let { AllNotifyRecord } = this.props;
        if (AllNotifyRecord.hasNextPage) {
            let param = {
                pageNum: AllNotifyRecord.pageNum + 1,
                pageSize: 10
            }
            this.loadNotifyRecord(param, 'updata');
        }
    }
    /**
     * 筛选查询
     */
    onSearchClick = async (data) => {
        let { memTelMapCache } = this.props;
        let params
        if (!data || data == null) {
            // params = {
            //     groupType:3,
            // }
        } else {
            params = {
                searchKey: data.searchKey,
                timeMin: data.timeMin,
                timeMax: data.timeMax,
            }
        }
        console.log(params)
        // this.loadNotifyRecord(params);
    }
    componentWillMount() {
        let param = {
            pageNum: 1,
            pageSize: 10
        }
        this.loadNotifyRecord(param);   //加载通知记录
    }
    render() {
        let { AllNotifyRecord, notifyRecord } = this.props;
        let { hasMore } = this.state
        const columns = [
            {
                title: "发起者",
                dataIndex: "callee",
                key: "callee",
                width: '20%'
            },
            {
                title: "通知成员",
                dataIndex: "memNames",
                key: "memNames",
                ellipsis: true,
            },
            {
                title: "通知时间",
                dataIndex: "tmNotify",
                key: "tmNotify",
                width: '30%',
                ellipsis: true,
            },
            {
                title: "操作",
                dataIndex: "operate",
                key: "operate",
                align: "right",
                width: '10%',
                render: (text, record) => {
                    return (
                        <span className='operate-info' onClick={e => this.openRecordInfo(e, record)}>查看</span>
                    );
                }
            }
        ];
        return (
            <div>
                {/* <RecordSearch onClick={this.onSearchClick} /> */}
                <div style={{ height: '480px', overflowY: 'auto' }}>
                    <InfiniteScroll
                        pageStart={0}
                        initialLoad={false}
                        loadMore={() => { this.fetchMemData() }}
                        hasMore={hasMore}
                        style={{ height: "100%" }}
                        useWindow={false}>
                        <Table
                            columns={columns}
                            pagination={false}
                            dataSource={notifyRecord}
                            className="record-table"
                        />
                    </InfiniteScroll>
                </div>
            </div>

        );
    }
}

export default NotifyRecord;