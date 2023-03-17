/*
 * @File: 广播展开记录
 * @Author: liulian
 * @Date: 2020-09-02 15:14:42
 * @version: V0.0.0.1
 * @LastEditTime: 2021-07-23 13:50:38
 */
import { Table, Modal, message } from "antd";
import React, { Component } from "react";
import { setBoardCast, setIsSelectCall } from "../../../../../reducer/audio-handle-reducer";
import store from "../../../../../store";
import dispatchManager from "../../../../../util/dispatch-manager";
const { confirm } = Modal
function BoardTable(props) {
    let boardRecordList = props.boardRecordList;
    const expandedRowRender = (record) => {
        return (
            <div className="collasp-wrap">
                <p className="collasp-info">共发送{record.calleds.length}人(应答{record.succNum}人，未应答{record.failNum}人)</p>
                {
                    record.groupRecords && record.groupRecords.map((item, index) => {
                        return (<span key={`board-${index}`} className={`rec-mem over-ellipsis ${item.notifyResult == 200 ? '' : 'fail-mem'}`}>{item.name}</span>)
                    })
                }
            </div>
        );
    };

    const customExpandIcon = (props) => {

        if (props.expanded) {
            return (<a onClick={e => {
                props.onExpand(props.record, e);
            }}><i className='icon-shouqi'></i></a>)
        } else {
            return (<a onClick={e => {
                props.onExpand(props.record, e);
            }}><i className='icon-zhankai'></i></a>)
        }

    }

    const reStartBoard = (e, record) => {
        confirm({
            title: '是否对失败成员重新发起广播？',
            content: '',

            onCancel() {
                console.log("取消重新选呼");
            },
            onOk() {
                restartOk(record)
            },
        })
    }
    const restartOk = (record) => {
        let failList = [];
        record.groupRecords.map((item) => {
            if (item.notifyResult != 200) {
                let findTel = false;
                failList.map((list) => {
                    if (list == item.called) {
                        findTel = true;
                        return;
                    }
                })
                if (!findTel) {
                    failList.push(item.called)
                }
            }
        })
        if (failList.length == 0) {
            message.error("当前没有失败成员！")
        } else {
            store.dispatch(setIsSelectCall("3"));
            store.dispatch(setBoardCast("2"));
            dispatchManager.dispatcher.calls.selectCall(failList, '', false, true, (data) => {
                if (data.code == 0) {
                    props.setCurMeetId(data)
                }
            });
        }
    }

    const columns = [
        {
            title: "发起者",
            dataIndex: "caller",
            key: "caller",
            width: '20%'
        },
        {
            title: "广播成员",
            dataIndex: "memNames",
            key: "memNames",
            ellipsis: true,
        },
        {
            title: "发起时间",
            dataIndex: "tmNotifys",
            key: "tmNotifys",
            width: '30%',
            align: 'center',
        },
        {
            title: "操作",
            dataIndex: "operate",
            key: "operate",
            align: "center",
            width: '10%',
            render: (text, record) => {
                return (
                    <i title="重新广播" className='icon-restart' onClick={e => reStartBoard(e, record)}></i>
                );
            }
        }
    ];
    return (
        <Table
            className="board-table"
            pagination={false}
            columns={columns}
            expandRowByClick={true}
            expandedRowRender={expandedRowRender}
            expandIcon={customExpandIcon}
            dataSource={boardRecordList}
        />
    );
}
export default BoardTable