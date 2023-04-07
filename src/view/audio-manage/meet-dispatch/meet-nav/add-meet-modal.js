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
import { loadMeetList, getMeetDetail } from "../../../../util/meet-method";
import { meetapis } from "../../../../api/meetapis";
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
            timeEnd: '',
            editedata: []
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
        if (data.id) {
            // 编辑
            if (val == 'EDIT_CONFERENCE') {
                curData.conferenceTimeType = 'EDIT_CONFERENCE'
            } else {
                curData.conferenceTimeType = 'INSTANT_CONFERENCE'
            }
        } else {
            if (val == 'EDIT_CONFERENCE') {
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
        console.log(memData);
        if (data.id) {
            // 编辑情况
            if (memData.length > 0) {
                curData.attendees = memData;
                // curData.attendees = curData.attendees.concat(memData)
                this.setState({
                    editedata: [...curData.attendees]
                })
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
    // timeOk = (value) => {
    //     let a = value[0]
    //     window.tim = value[0];
    //     // let b = new Date().getTime();
    //     let cur = new Date();
    //     if ((value[0]._d && value[0]._d < cur) || (value[1]._d && value[1]._d < cur)) {
    //         message.error("预约时间段有误");
    //         this.setState({
    //             timeBegin: "",
    //             timeEnd: ""
    //         })
    //         this.props.form.setFieldsValue({ meetTime: "" })
    //         return;
    //     } else {
    //         this.setState({
    //             timeBegin: value[0].format('YYYY-MM-DD HH:mm:ss'),
    //             timeEnd: value[1].format('YYYY-MM-DD HH:mm:ss')
    //         })
    //     }
    // }
    timeOk = (value) => {
        let a = value
        window.tim = value;
        // let b = new Date().getTime();
        let cur = new Date();
        if ((value._d && value._d < cur)) {
            message.error("预约时间段有误");
            this.setState({
                timeBegin: "",
                timeEnd: ""
            })
            this.props.form.setFieldsValue({ meetTime: "" })
            return;
        } else {
            this.setState({
                timeBegin: value.format('YYYY-MM-DD HH:mm:ss'),
            })
        }
    }
    /**
     * 新建会议弹框确定
     */
    localToUtc = (date) => {
        const fmt = 'YYYY-MM-DD HH:mm:ss';
        console.log(date);
        return moment(date, fmt).utc().format(fmt) + ' UTC'
    }
    modalOk = () => {
        let { timeBegin, timeEnd, addMeetMem } = this.state;
        let { data } = this.props;
        let _this = this;
        _this.props.form.validateFields((err, values) => {
            if (!err) {
                let params = {
                    // accessCode: values.accessCode,
                    conferenceTimeType: values.conferenceTimeType,
                    subject: values.subject,
                    guestPassword: values.guestPassword,
                    chairmanPassword: values.chairmanPassword,
                    scheduleStartTime: timeBegin ? _this.localToUtc(timeBegin) : undefined,
                }

                if (data.id) {
                    // 编辑

                    let attendees = curData.attendees.map((item) => {
                        return {
                            account: item.memTel,
                            name: item.memName,
                            organizationName: item.deptName
                        }
                    })
                    params.conferenceId = data.id;
                    if (!params.scheduleStartTime) {
                        params.scheduleStartTime = curData.scheduleStartTime
                    }
                    // if (!params.timeEnd) {
                    //     params.timeEnd = curData.timeEnd
                    // }
                    _this.editOk({
                        conference: params,
                        attendees
                    }, (res) => {
                        if (res.code != 0 || res.data.result == 'fail') {
                            if (res.message) message.error(res.message)
                        } else {
                            message.success('编辑会议成功');
                            let none = {}
                            _this.props.setEditRecord({ ...none });
                            _this.props.hidePop('addMeetVisible');
                            if (params.conferenceTimeType != 'EDIT_CONFERENCE') {
                                addMeetMem.map((item) => {
                                    meetManager.meetsObj.joinMember(res.data.id, item.memTel)
                                })
                            }
                        }
                    });
                } else {

                    let attendees = addMeetMem.map((item) => {
                        return {
                            account: item.memTel,
                            name: item.memName,
                            organizationName: item.deptName
                        }
                    })
                    // params.meetMembers = mems;
                    _this.addMeet(params, attendees, (res) => {
                        console.log(res);
                        // if (res.code != 0) {
                        //     if (res.message) message.error(res.message)
                        // } else {
                        message.success('新建会议成功');
                        let none = {}
                        _this.props.setEditRecord({ ...none });
                        _this.props.hidePop('addMeetVisible');
                        if (params.conferenceTimeType != 'EDIT_CONFERENCE') {
                            addMeetMem.map((item) => {
                                meetManager.meetsObj.joinMember(res.data.id, item.memTel)
                            })
                        }
                        // }
                    });
                }
            }
        })
    }
    /**
     * 新建会议
     */
    addMeet = async (params, attendees, resultCallback) => {

        let res = await meetapis.meetManagePrefix.create({
            conference: params,
            attendees,
            participants: []
        })
        console.log(res);
        resultCallback(res)
        loadMeetList()
        // meetManager.meetsObj.createMeetDetail(params.subject, '', resultCallback, params.accessCode, params.conferenceTimeType,
        //     params.timeBegin, params.timeEnd, params.chairmanPassword, params.guestPassword, meetMembers)
    }
    /**
     * 编辑时删除人员
     */
    editDele = (item) => {
        let { data } = this.props;
        console.log(item);
        curData.attendees.map((mem, index) => {
            if (mem.memTel == item.memTel) {
                curData.attendees.splice(index, 1);
            }
        })
        this.setState({
            editedata: [...curData.attendees]
        })
    }
    /**
     * 确定编辑
     */
    editOk = async (params, resultCallback) => {
        const { data } = this.props
        console.log(params);
        let res = await meetapis.meetManagePrefix.updateMeet(
            params
        )
        loadMeetList()
        console.log(res);
        getMeetDetail(data)
        // let meetMembers = params.meetMembers ? params.meetMembers.join(";") : '';
        // meetManager.meetsObj.editMeet(params.id, params.subject, resultCallback, params.accessCode, params.conferenceTimeType,
        //     params.timeBegin, params.timeEnd, params.chairmanPassword, params.guestPassword, meetMembers)

    }

    componentDidMount() {

    }
    componentWillMount() {
        let { data, memTelMapCache } = this.props;
        curData = JSON.parse(JSON.stringify(data));
        if (curData.attendees) {
            curData.attendees.map((item) => {
                if (item.tel || item.memTel) {
                    let tel = item.tel || item.memTel;
                    item.orgMemId = memTelMapCache[tel] ? memTelMapCache[tel].id : '';
                    item.memTel = item.account || item.item.memTel
                    item.memName = item.name || item.memName
                }
            })
            this.setState({
                editedata: [...curData.attendees]
            })
        }
    }

    render() {
        let { visible, data } = this.props;
        const { getFieldDecorator } = this.props.form;
        let { isShowDatePicker, addMeetMem, addMeetMemVisible, editedata } = this.state
        console.log(curData.attendees);
        return (
            <Modal
                title={data.id ? '编辑会议' : '新建会议'}
                className="add-meet-modal"
                style={{ width: '22rem' }}
                visible={visible}
                onCancel={this.handleCancel}
                onOk={this.modalOk}
            >
                <Form className='add-meet' {...formItemLayout} >
                    <Form.Item label="会场名称">
                        {getFieldDecorator("subject", {
                            initialValue: data.subject || data.name || data.id || "",
                            rules: [
                                { required: true, message: "请输入会议名称!" },
                                { max: 64, message: "最大64位" }
                            ]
                        })(<Input autoComplete="off"
                            disabled={(data.id && (data.meetCreated == 'default' || data.id == data.subject || data.meetCreated == data.subject)) ? true : ''} />)}
                    </Form.Item>
                    {data.id ?
                        // 编辑会场
                        data.duration && <Form.Item label="会议时长">
                            {getFieldDecorator("duration", {
                                initialValue: data.duration,
                                rules: [
                                    !(data.id && (data.meetCreated == 'default' || data.id == data.subject || data.meetCreated == data.subject)) && { pattern: /^[0-9]*$/, message: "请输入数字" },
                                    { required: true, message: "请输入会议时长！" }
                                ]
                            })(<Input
                                disabled={(data.id && (data.meetCreated == 'default' || data.id == data.subject || data.meetCreated == data.subject)) ? true : ''}
                                autoComplete="off" />)}
                        </Form.Item>
                        :
                        // 新建会场
                        <Form.Item label="会议时长">
                            {getFieldDecorator("duration", {
                                initialValue: '120',
                                rules: [
                                    !(data.id && (data.meetCreated == 'default' || data.id == data.subject || data.meetCreated == data.subject)) && { pattern: /^[0-9]*$/, message: "请输入数字，单位分钟" },
                                    { required: true, message: "请输入会议时长！单位分钟" }
                                ]
                            })(<Input autoComplete="off" />)}
                        </Form.Item>

                    }

                    <Form.Item label="主席密码">
                        {getFieldDecorator("chairmanPassword", {
                            initialValue: data.chairmanPassword || "",
                            rules: [
                                { pattern: /^[0-9]*$/, message: "请输入数字" },
                                { max: 6, message: "最大6位" }
                            ]
                        })(<Input autoComplete="off" />)}
                    </Form.Item>
                    <Form.Item label="来宾密码">
                        {getFieldDecorator("guestPassword", {
                            initialValue: data.guestPassword || "",
                            rules: [
                                { pattern: /^[0-9]*$/, message: "请输入数字" },
                                { max: 6, message: "最大6位" }

                            ]
                        })(<Input autoComplete="off" />)}
                    </Form.Item>
                    <Form.Item label="会场类型">
                        {getFieldDecorator('conferenceTimeType', {
                            initialValue: data.conferenceTimeType || 'INSTANT_CONFERENCE',
                        })
                            (<Radio.Group onChange={this.meetTypeChange} >
                                <Radio value="INSTANT_CONFERENCE" disabled={(data.id && data.conferenceTimeType != 'EDIT_CONFERENCE' ? true : '')}>立即会议</Radio>
                                <Radio value="EDIT_CONFERENCE" disabled={(data.id && data.conferenceTimeType != 'EDIT_CONFERENCE' ? true : '')}>预约会议</Radio>
                            </Radio.Group>
                            )}
                    </Form.Item>
                    {(isShowDatePicker || curData.conferenceTimeType == 'EDIT_CONFERENCE') &&
                        <Form.Item label="预约时间">
                            {getFieldDecorator('meetTime', {
                                initialValue: (curData.timeBegin && [moment(curData.timeBegin, "YYYY-MM-DD HH:mm:ss"),
                                moment(curData.timeEnd, "YYYY-MM-DD HH:mm:ss")]) || '',
                            })
                                (<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.timeOk} />)}
                        </Form.Item>
                    }
                    {!data.id && <Form.Item label="参会人员">

                        <div className='add-meet-mem'>
                            <span
                                className='add-meet-icon-wrap'
                                onClick={() => { this.showAddMember() }}>
                                <i className='add-meet-icon'></i>添加</span>
                            <ul>
                                {addMeetMem && addMeetMem.map((item, index) => {
                                    return (
                                        <li key={`addMem-${index}`}>
                                            <span className='meet-name over-ellipsis'>{item.memName}</span>
                                            <span className='meet-memTel over-ellipsis'>{item.memTel}</span>
                                            <i className='meet-mem-del' onClick={() => { this.delMeetMem(item) }}></i>
                                        </li>
                                    )
                                })
                                }
                            </ul>
                        </div>
                    </Form.Item>}
                    {data.attendees &&
                        <Form.Item label="参会人员">
                            <div className='add-meet-mem'>
                                {data.conferenceTimeType == 'EDIT_CONFERENCE' &&
                                    <span
                                        className='add-meet-icon-wrap'
                                        onClick={() => { this.showAddMember() }}>
                                        <i className='add-meet-icon'></i>添加</span>
                                }
                                <ul className={`${(data.id && data.conferenceTimeType == 'EDIT_CONFERENCE') ? '' : 'no-edit'}`}>
                                    {curData.attendees.length > 0 && editedata.map((item, index) => {
                                        return (
                                            <li key={`addMem-${index}`}>
                                                <span className='meet-name over-ellipsis'>{item.memName || item.name}</span>
                                                <span className='meet-memTel over-ellipsis'>{item.memTel || item.account}</span>
                                                {(data.id && data.conferenceTimeType == 'EDIT_CONFERENCE') ?
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
                {data.id &&
                    <AddMember
                        modalVisible={addMeetMemVisible}
                        chosedMem={(data.id && data.conferenceTimeType == 'EDIT_CONFERENCE') ? curData.attendees : ''}
                        getMemData={(mems) => this.getMemData(mems)}
                        title="请编辑参会人员" />
                }
                {/* 新建会议 */}
                {!data.id &&
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