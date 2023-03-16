/*
 * @File: 新增群组弹框
 * @Author: liulian
 * @Date: 2020-07-28 18:27:58
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-25 15:06:54
 */
import React, { Component } from "react";
import { Modal, Form, Input, message} from 'antd';
import dispatchManager from "../../../../util/dispatch-manager";
import { apis } from "../../../../util/apis";

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
class AddGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transferModal: false
        }
    }
    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.props.hidePop("addGroupModalVisible");
        this.props.form.resetFields();
    };
    /**
     * 新增群组
     */
    modalOk = () => {
        this.props.form.validateFields((err, values) => {
            if(!err){
                let groupName = values.groupName;
                let centerId = dispatchManager.accountDetail.centerId;
                let groupLevel = 0;
                let memNumberMax = 128;
                let groupType = 0;
                let params = {
                    groupName,
                    centerId,
                    groupLevel,
                    memNumberMax,
                    groupType,
                }
                this.saveDispGroup(params);
            }
        })
    }
    /**
     * 新增群组
     */
    saveDispGroup = async (params) => {
        let data = await apis.dispatch.saveDispGroup(params);
        if(data){
            message.success("添加成功");
            this.props.loadGroupList();
            this.handleCancel();
        }
    }
    componentDidMount() {
        
    }
    render() {
        let {visible} = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="新增群组"
                className='addgroup-modal'
                maskClosable={false}
                visible={visible}
                onOk={this.modalOk}
                onCancel={this.handleCancel}
            >
                <Form {...layout}>
                    <Form.Item label="名称">
                        {getFieldDecorator('groupName', {
                            initialValue: '', rules: [{ required: true, message: '群组名称不能为空' }]
                        })(<Input placeholder="请输入群组名称" />)}
                    </Form.Item>
                </Form>
            </Modal>

        );
    }
}

export default Form.create()(AddGroup);
