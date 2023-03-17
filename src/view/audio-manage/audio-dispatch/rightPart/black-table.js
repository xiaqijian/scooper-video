/*
 * @File: 语音调度-右侧黑名单管理
 * @Author: liulian
 * @Date: 2020-07-03 18:20:16
 * @version: V0.0.0.1
 * @LastEditTime: 2021-04-02 11:23:55
 */
import React, { Component } from "react";
import { Button, Table, message } from "antd";
import { connect } from 'react-redux';
import { setBlackListData } from '../../../../reducer/callRecord-handle-reduce';
import { apis } from "../../../../util/apis";


@connect(
    state => state.callRecordHandle,
    { setBlackListData }
)
class BlackTable extends Component {
    constructor(props) {
        super(props);

    }

    /**
     * 删除
     */
    onDelete = async (e, record) => {
        let param = { id: record.id };
        let data = await apis.disp.delBlack(param);
        if (data.code == 0) {
            message.success("删除成功");
            this.props.loadBlackList();
        }
    }

    componentDidMount() {

    }


    render() {
        let { blackListData } = this.props
        const columns = [
            {
                title: "name",
                dataIndex: "name",
                key: "name",
                width: '40%',
                ellipsis: true
            },
            {
                title: "号码",
                dataIndex: "hideTel",
                key: "hideTel",
                width: '40%',

            },
            {
                title: "操作",
                dataIndex: "operate",
                key: "operate",
                width: '30%',
                align: "right",
                render: (text, record) => {
                    return (
                        <span className='black-delete' onClick={e => this.onDelete(e, record)}>
                            <i className="icon-delete"></i>
                            <span className='delete-span'>删除</span>
                        </span>
                    );
                }
            }
        ];
        return (

            <Table
                columns={columns}
                showHeader={false}
                pagination={false}
                dataSource={blackListData}
                className="black-table"
            />
        );
    }
}

export default BlackTable;