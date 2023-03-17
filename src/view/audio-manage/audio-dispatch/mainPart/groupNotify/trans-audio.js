/*
 * @File: 语音调度-组呼通知Tab- 文字转语音
 * @Author: liulian
 * @Date: 2020-07-05 16:37:28
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-03 16:11:34
 */
import React, { Component } from "react";
import { Button, Form, Input, InputNumber, Select, Row, Col, message } from "antd";
import { uniqBy } from 'lodash';
import { apis } from '../../../../../util/apis';
import dispatchManager from '../../../../../util/dispatch-manager'
import timeUtil from "../../../../../util/time-util";
import AddMember from "../../../../../component/add-member";
import { groupNotifyTitle } from "../../../../../config/constants";

const { Option, OptGroup } = Select;
const { TextArea } = Input;
const textItemLayout = {
    labelCol: {
        span: 0,
    },
    wrapperCol: {
        span: 24,
    },
}
const formIteLayout = {
    labelCol: {
        span: 9,
    },
    wrapperCol: {
        span: 15,
    },
}
const layout = {
    labelCol: {
        span: 5,
    },
    wrapperCol: {
        span: 19,
    },
};

class TransToAudio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            temBtnVisible: false,
            loopList: [
                { id: 1, value: '1', text: '单次' },
                { id: 2, value: '3', text: '多次' },
                { id: 3, value: '0', text: '无限次' },
            ],
            isDel: false,
            isCheck: false,
            notifyPhrases: [],
            recMems: [],
            modalVisible: false,  //人员选择器弹框
        }
        if (props.onRef) {//如果父组件传来该方法 则调用方法将子组件this指针传过去
            props.onRef(this)
        }
    }

    /**
     * 通知内容下拉框选择
     */
    handleChange = (e) => {
        let val = e.split(",")[0];
        let id = e.split(',')[1];
        this.props.form.setFieldsValue({
            'notifyContent': val
        })
    }
    /**
     * 添加模板
     */
    addToTemplete = async () => {
        let { notifyPhrases } = this.state;
        let content = this.props.form.getFieldValue('notifyContent');
        let params = {
            corpId: dispatchManager.accountDetail.corpId,
            content: content
        }
        let data = await apis.disp.saveDispNotifyPhrases(params);
        if (data) {
            message.success("添加成功")
            this.loadNotifyPhrases();
        }
    }
    /**
     * 循环次数改变
     */
    loopNumChange = (value) => {
        // console.log('changed', value);
    }
    /**
     * 提交
     */
    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { recMems } = this.props;
                let telArr = [];
                recMems.forEach(element => {
                    if (element.memTel) {
                        telArr.push(element.memTel)
                    }
                });
                let files = values.notifyContent;
                let type = 'text';
                let times = values.loopNum;
                let notifyId = dispatchManager.accountDetail.operatorId + "_" + timeUtil.getDaeTimeStr();

                if (!files) {
                    message.error("通知内容不能为空");
                    return false;
                }
                if (!times) {
                    message.error("循环次数不能为空");
                    return false;
                }
                if (telArr.length == 0) {
                    message.error("接收人不能为空");
                    return false;
                }
                dispatchManager.dispatcher.calls.selectNotify(telArr, files, type, times, notifyId);
            }
        })
    }
    /**
     * 加载常用语模板
     */
    loadNotifyPhrases = async () => {
        let data = await apis.disp.listDispNotifyPhrases();
        this.setState({ notifyPhrases: data.list });
    }
    /**
     * 编辑接收人
     */
    recMemEdit = (recMems) => {
        let { isCheck, isDel, modalVisible } = this.state
        if (isCheck == true) {
            this.setState({
                modalVisible: false
            })

        } else {
            this.setState({
                modalVisible: true
            })
        }
        this.setState({
            isDel: !isDel,
            isCheck: !isCheck,
        })
    }
    /**
     * 删除接收人
     */
    delRecMems = (item) => {
        let { recMems } = this.props;
        recMems.map((mem, i) => {
            if (mem.orgMemId == item.orgMemId) {
                recMems.splice(i, 1)
            }
        })
        this.props.setRecMems(recMems)
    }
    /**
     * 获取人员选择器 人员
     * @param memData 返回的人员数据
     */
    getMemData = (memData) => {
        let { recMems } = this.props;
        this.setState({
            modalVisible: false,
        })
        this.props.setRecMems(memData)
        // this.props.setRecMems(uniqBy(recMems.concat(memData), 'orgMemId'))
    };

    componentDidMount() {

    }
    componentWillMount() {
        this.loadNotifyPhrases();
    }

    componentWillReceiveProps(nexProps) {
        if (nexProps.form.getFieldValue('notifyContent') && nexProps.form.getFieldValue('notifyContent').length > 0) {
            this.setState({ temBtnVisible: true })
        } else {
            this.setState({ temBtnVisible: false })
        }
    }
    /**
     * 删除某一条tts
     */
    deletetTTS = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        let data = await apis.disp.removeDispNotifyPhrases({ id: item.id });
        if (data.code == 0) {
            message.success("删除成功");
            this.loadNotifyPhrases()
        }
    }

    render() {
        let { notifyPhrases, temBtnVisible, loopList, isDel, isCheck, modalVisible } = this.state;
        const { totalNum, recMems, loopTime, content } = this.props
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Form  {...layout}>
                    <Row>
                        <Col span={14} style={{ textAlign: 'center' }}>
                            <Form.Item label="通知内容">
                                {getFieldDecorator('notifyTemplete')(
                                    <Select style={{ width: '300px' }} placeholder="请选择通知模板" onChange={(e) => this.handleChange(e)}>
                                        {notifyPhrases.map(item => (
                                            <Option key={item.id} title={item.content} value={item.content + "," + item.id}>
                                                {item.content}
                                                <i className='tts-delete' onClick={(e) => { this.deletetTTS(e, item) }}></i>
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>

                        <Col span={10} style={{ textAlign: 'right' }}>
                            <Form.Item label="循环次数" {...formIteLayout}>
                                {getFieldDecorator('loopNum', { initialValue: loopTime || '3' })
                                    (<Select placeholder="请选择循环次数">
                                        {loopList.map(item => (
                                            <Option key={item.id} value={item.value}>{item.text}</Option>
                                        ))}
                                    </Select>)
                                }
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row className='content-row'>
                        <Form.Item {...textItemLayout}>
                            {getFieldDecorator('notifyContent', { initialValue: content || '' })(
                                <TextArea placeholder="请输入通知内容（300字以内）" rows={8} />
                            )}
                            {temBtnVisible && <Button className='add-templete' onClick={() => { this.addToTemplete() }}>添加模板</Button>}
                        </Form.Item>
                    </Row>
                    <Row className='rec-mems'>
                        <span>接收人</span>
                        {recMems.length > 0 && <span>(共{recMems.length}人)</span>}

                        <span className={`notify-edit ${isCheck == true ? 'notify-edit-ok' : ''}`} onClick={() => { this.recMemEdit(recMems) }} >
                            <i className='icon-notify-edit'></i>{isCheck == true ? '完成' : '编辑'}
                        </span>
                    </Row>
                    <Row className='rec-wrap rec-trans'>
                        {
                            recMems && recMems.map((item, index) => {
                                return (
                                    <div className="rec-mem-wrap" key={index}>
                                        <span className='rec-mem'>{item.name}</span>
                                        {isDel == true && <i className="icon-delte" onClick={() => this.delRecMems(item)}></i>}
                                    </div>
                                )
                            })
                        }
                    </Row>
                </Form>
                <AddMember modalVisible={modalVisible} getMemData={(mems) => this.getMemData(mems)} title={groupNotifyTitle} chosedMem={recMems} />
            </div>
        );
    }
}

export default Form.create()(TransToAudio);