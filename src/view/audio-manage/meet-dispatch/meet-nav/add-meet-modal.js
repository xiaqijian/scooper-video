/*
 * @File: 会议会商 - 新建/编辑会议
 * @Author: liulian
 * @Date: 2020-06-11 11:20:49
 * @version: V0.0.0.1
 * @LastEditTime: 2021-09-15 14:00:48
 */
import React, { Component } from "react";
import { Modal, Button, Input, message, Radio, Form, DatePicker } from 'antd'
import AddMember from "../../../../component/add-member";
import { setMemTelMapCache } from '../../../../reducer/audio-handle-reducer'
import { setAllMeetList, setMeetDetailList, setCurMeet, setEditRecord } from '../../../../reducer/meet-handle-reduce';
import meetManager from "../../../../util/meet-manager";
import { connect } from "react-redux";
import moment from 'moment'


let curData;
const { RangePicker } = DatePicker
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
    },
};
@connect(
    state => state.audioHandle, {
    setMemTelMapCache
}
)
@connect(
    state => state.meetHandle,
    { setAllMeetList, setMeetDetailList, setCurMeet, setEditRecord }
)
class AddMeetModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowDatePicker: false,
            addMeetMem: [], //参会人员列表
            memModalVisible: false,   //人员选择器弹框是否显示
            timeBegin: '',
            timeEnd: ''
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        let none = {}
        this.props.setEditRecord({ ...none });
        this.props.hidePop("addMeetVisible");
    };

    /**
     * 会议类型改变
     */
    meetTypeChange = (e) => {
        let { data } = this.props;
        const val = e.target.value;
        if (data.meetId) {
            // 编辑
            if (val == 'MEET_RESERVE') {
                curData.meetAttr = 'MEET_RESERVE'
            } else {
                curData.meetAttr = 'MEET_INSTANT'
            }
        } else {
            if (val == 'MEET_RESERVE') {
                this.setState({
                    isShowDatePicker: true
                })
            } else {
                this.setState({
                    isShowDatePicker: false
                })
            }
        }

    }
    /**
     * 显示人员选择器弹框
     */
    showAddMember = () => {
        this.setState({
            addMeetMemVisible: true
        })
    }
    /**
     * 获取人员选择器 人员  返回的人员数据
     */
    getMemData = (memData) => {
        let { data } = this.props;
        if (data.meetId) {
            // 编辑情况
            if (memData.length > 0) {
                curData.meetMem = memData;
                // curData.meetMem = curData.meetMem.concat(memData)
            }
        } else {
            // 新增情况
            this.setState({
                addMeetMem: memData
            })
        }
        this.setState({
            addMeetMemVisible: false,
        })

    };
    delMeetMem = (mem) => {
        let { addMeetMem } = this.state;
        addMeetMem.map((item, index) => {
            if (item.memTel == mem.memTel) {
                addMeetMem.splice(index, 1);
            }
        })
        this.setState({ addMeetMem })
    }
    /**
     * 预约时间选定
     */
    timeOk = (value) => {
        let a = value[0]
        window.tim = value[0];
        // let b = new Date().getTime();
        let cur = new Date();
        if ((value[0]._d && value[0]._d < cur) || (value[1]._d && value[1]._d < cur)) {
            message.error("预约时间段有误");
            this.setState({
                timeBegin: "",
                timeEnd: ""
            })
            this.props.form.setFieldsValue({ meetTime: "" })
            return;
        } else {
            this.setState({
                timeBegin: value[0].format('YYYY-MM-DD HH:mm:ss'),
                timeEnd: value[1].format('YYYY-MM-DD HH:mm:ss')
            })
        }
    }
    /**
     * 新建会议弹框确定
     */
    modalOk = () => {
        let { timeBegin, timeEnd, addMeetMem } = this.state;
        let { data } = this.props;
        let _this = this;
        _this.props.form.validateFields((err, values) => {
            if (!err) {
                let params = {
                    meetAccess: values.meetAccess,
                    meetAttr: values.meetAttr,
                    meetName: values.meetName,
                    passwdAudience: values.passwdAudience,
                    passwdSpeaker: values.passwdSpeaker,
                    timeBegin: timeBegin,
                    timeEnd: timeEnd,
                }

                if (data.meetId) {
                    // 编辑
                    let paramMem = [];
                    curData.meetMem.map((da) => {
                        paramMem.push((da.tel || da.memTel) + ',speak');
                    })

                    params.meetMembers = paramMem;
                    params.meetId = data.meetId;
                    if (!params.timeBegin) {
                        params.timeBegin = curData.timeBegin
                    }
                    if (!params.timeEnd) {
                        params.timeEnd = curData.timeEnd
                    }
                    _this.editOk(params, (res) => {
                        if (res.code != 0 || res.data.result == 'fail') {
                            if (res.message) message.error(res.message)
                        } else {
                            message.success('编辑会议成功');
                            let none = {}
                            _this.props.setEditRecord({ ...none });
                            _this.props.hidePop('addMeetVisible');
                            if (params.meetAttr != 'MEET_RESERVE') {
                                addMeetMem.map((item) => {
                                    meetManager.meetsObj.joinMember(res.data.meetId, item.memTel)
                                })
                            }
                        }
                    });
                } else {
                    let mems = [];
                    addMeetMem.map((item) => {
                        mems.push(item.memTel + ',speak');
                    })
                    params.meetMembers = mems;
                    _this.addMeet(params, (res) => {
                        if (res.code != 0 || res.data.result == 'fail') {
                            if (res.message) message.error(res.message)
                        } else {
                            message.success('新建会议成功');
                            let none = {}
                            _this.props.setEditRecord({ ...none });
                            _this.props.hidePop('addMeetVisible');
                            if (params.meetAttr != 'MEET_RESERVE') {
                                addMeetMem.map((item) => {
                                    meetManager.meetsObj.joinMember(res.data.meetId, item.memTel)
                                })
                            }
                        }
                    });
                }
            }
        })
    }
    /**
     * 新建会议
     */
    addMeet = (params, resultCallback) => {
        let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        meetManager.meetsObj.createMeetDetail(params.meetName, '', resultCallback, params.meetAccess, params.meetAttr,
            params.timeBegin, params.timeEnd, params.passwdSpeaker, params.passwdAudience, meetMembers)
    }
    /**
     * 编辑时删除人员
     */
    editDele = (item) => {
        let { data } = this.props;
        curData.meetMem.map((mem, index) => {
            if (mem.tel == item.tel) {
                curData.meetMem.splice(index, 1);
            }
        })
    }
    /**
     * 确定编辑
     */
    editOk = (params, resultCallback) => {
        let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        meetManager.meetsObj.editMeet(params.meetId, params.meetName, resultCallback, params.meetAccess, params.meetAttr,
            params.timeBegin, params.timeEnd, params.passwdSpeaker, params.passwdAudience, meetMembers)

    }

    componentDidMount() {

    }
    componentWillMount() {
        let { data, memTelMapCache } = this.props;
        curData = JSON.parse(JSON.stringify(data));
        if (curData.meetMem) {
            curData.meetMem.map((item) => {
                if (item.tel || item.memTel) {
                    let tel = item.tel || item.memTel;
                    item.orgMemId = memTelMapCache[tel] ? memTelMapCache[tel].id : '';
                    item.memTel = tel
                }
            })
        }
    }

    render() {
        let { visible, data } = this.props;
        const { getFieldDecorator } = this.props.form;
        let { isShowDatePicker, addMeetMem, addMeetMemVisible } = this.state

        return (
            <Modal
                title={data.meetId ? '编辑会议' : '新建会议'}
                className="add-meet-modal"
                style={{ width: '22rem' }}
                visible={visible}
                onCancel={this.handleCancel}
                onOk={this.modalOk}
            >
                <Form className='add-meet' {...formItemLayout} >
                    <Form.Item label="会场名称">
                        {getFieldDecorator("meetName", {
                            initialValue: data.meetName || data.name || data.meetId || "",
                            rules: [
                                { required: true, message: "请输入会议名称!" }
                            ]
                        })(<Input autoComplete="off"
                            disabled={(data.meetId && (data.meetCreated == 'default' || data.meetId == data.meetName || data.meetCreated == data.meetName)) ? true : ''} />)}
                    </Form.Item>
                    {data.meetId ?
                        // 编辑会场
                        data.meetAccess && <Form.Item label="会场号">
                            {getFieldDecorator("meetAccess", {
                                initialValue: data.meetAccess,
                                rules: [
                                    !(data.meetId && (data.meetCreated == 'default' || data.meetId == data.meetName || data.meetCreated == data.meetName)) && { pattern: /^[0-9]*$/, message: "请输入数字" },
                                    { required: true, message: "请输入会场号！" }
                                ]
                            })(<Input
                                disabled={(data.meetId && (data.meetCreated == 'default' || data.meetId == data.meetName || data.meetCreated == data.meetName)) ? true : ''}
                                autoComplete="off" />)}
                        </Form.Item>
                        :
                        // 新建会场
                        <Form.Item label="会场号">
                            {getFieldDecorator("meetAccess", {
                                initialValue: '',
                                rules: [
                                    !(data.meetId && (data.meetCreated == 'default' || data.meetId == data.meetName || data.meetCreated == data.meetName)) && { pattern: /^[0-9]*$/, message: "请输入数字" },
                                    { required: true, message: "请输入会场号！" }
                                ]
                            })(<Input autoComplete="off" />)}
                        </Form.Item>

                    }

                    <Form.Item label="成员密码">
                        {getFieldDecorator("passwdSpeaker", {
                            initialValue: data.passwdSpeaker || "",
                            rules: [
                                { pattern: /^[0-9]*$/, message: "请输入数字" }
                            ]
                        })(<Input autoComplete="off" />)}
                    </Form.Item>
                    <Form.Item label="听众密码">
                        {getFieldDecorator("passwdAudience", {
                            initialValue: data.passwdAudience || "",
                            rules: [
                                { pattern: /^[0-9]*$/, message: "请输入数字" }
                            ]
                        })(<Input autoComplete="off" />)}
                    </Form.Item>
                    <Form.Item label="会场类型">
                        {getFieldDecorator('meetAttr', {
                            initialValue: data.meetAttr || 'MEET_INSTANT',
                        })
                            (<Radio.Group onChange={this.meetTypeChange} >
                                <Radio value="MEET_INSTANT" disabled={(data.meetId && data.meetAttr != 'MEET_RESERVE' ? true : '')}>立即会议</Radio>
                                <Radio value="MEET_RESERVE" disabled={(data.meetId && data.meetAttr != 'MEET_RESERVE' ? true : '')}>预约会议</Radio>
                            </Radio.Group>
                            )}
                    </Form.Item>
                    {(isShowDatePicker || curData.meetAttr == 'MEET_RESERVE') &&
                        <Form.Item label="预约时间">
                            {getFieldDecorator('meetTime', {
                                initialValue: (curData.timeBegin && [moment(curData.timeBegin, "YYYY-MM-DD HH:mm:ss"),
                                moment(curData.timeEnd, "YYYY-MM-DD HH:mm:ss")]) || '',
                            })
                                (<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.timeOk} />)}
                        </Form.Item>
                    }
                    {!data.meetId && <Form.Item label="参会人员">

                        <div className='add-meet-mem'>
                            <span
                                className='add-meet-icon-wrap'
                                onClick={() => { this.showAddMember() }}>
                                <i className='add-meet-icon'></i>添加</span>
                            <ul>
                                {addMeetMem && addMeetMem.map((item, index) => {
                                    return (
                                        <li key={`addMem-${index}`}>
                                            <span className='meet-memName over-ellipsis'>{item.memName}</span>
                                            <span className='meet-memTel over-ellipsis'>{item.memTel}</span>
                                            <i className='meet-mem-del' onClick={() => { this.delMeetMem(item) }}></i>
                                        </li>
                                    )
                                })
                                }
                            </ul>
                        </div>
                    </Form.Item>}
                    {data.meetMem &&
                        <Form.Item label="参会人员">
                            <div className='add-meet-mem'>
                                {data.meetAttr == 'MEET_RESERVE' &&
                                    <span
                                        className='add-meet-icon-wrap'
                                        onClick={() => { this.showAddMember() }}>
                                        <i className='add-meet-icon'></i>添加</span>
                                }
                                <ul className={`${(data.meetId && data.meetAttr == 'MEET_RESERVE') ? '' : 'no-edit'}`}>
                                    {curData.meetMem.length > 0 && curData.meetMem.map((item, index) => {
                                        return (
                                            <li key={`addMem-${index}`}>
                                                <span className='meet-memName over-ellipsis'>{item.memName || item.meetMem}</span>
                                                <span className='meet-memTel over-ellipsis'>{item.tel || item.memTel}</span>
                                                {(data.meetId && data.meetAttr == 'MEET_RESERVE') ?
                                                    <i className='meet-mem-del' onClick={() => { this.editDele(item) }}></i> : ''
                                                }
                                            </li>
                                        )
                                    })
                                    }
                                </ul>
                            </div>
                        </Form.Item>
                    }
                </Form>
                {/* 编辑会议 */}
                {data.meetId &&
                    <AddMember
                        modalVisible={addMeetMemVisible}
                        chosedMem={(data.meetId && data.meetAttr == 'MEET_RESERVE') ? curData.meetMem : ''}
                        getMemData={(mems) => this.getMemData(mems)}
                        title="请编辑参会人员" />
                }
                {/* 新建会议 */}
                {!data.meetId &&
                    <AddMember
                        modalVisible={addMeetMemVisible}
                        chosedMem={addMeetMem}
                        getMemData={(mems) => this.getMemData(mems)}
                        title="请新建参会人员" />
                }

            </Modal>
        );
    }
}

export default Form.create()(AddMeetModal);