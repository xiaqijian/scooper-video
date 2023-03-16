/*
 * @File: 修改密码弹框
 * @Author: liulian
 * @Date: 2021-03-17 09:44:59
 * @version: V0.0.0.1
 * @LastEditTime: 2022-03-18 10:09:27
 */
import React, { Component } from "react";
import { Modal, Form, Input, message, Button } from 'antd';
import { connect } from "react-redux";
import { setIsShowPwdModal } from '../reducer/loading-reducer'
import { apis } from "../util/apis";
import { sha256_digest } from "../lib/sha256/sha256";

const layout = {
    labelCol: { span: 5},
    wrapperCol: { span: 19 },
};

@connect(
    state => state.loading,
    { setIsShowPwdModal }
)
class PasswordModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transferModal: false,
            confirmDirty: false,
        }
    }

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.props.hidePop("isShowPwdModal");
    };

    handleSubmit = () => {
        let _this = this;
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                let params = {
                    origPwd: sha256_digest(values.password),
                    newPwd: sha256_digest(values.newpassword)
                }
                let data = await apis.core.resetSelfPwd(params);
                if (data.obj == 0) {
                    message.success("修改成功");
                    _this.handleCancel()
                } else {
                    message.error(data.message);
                }
            }
        })
    }
    /**
     * 检查输入的新密码
     */
    handleCheck = (rules, value = '', callback) => {
        const { getFieldValue } = this.props.form;
        try {
            if ((value.length < 8) || value.length > 16) {
                callback('请输入8-16位字符');
                return;
            } else if (/^\W+$/.test(value) || /^[a-z]+$/.test(value) || /^[A-Z]+$/.test(value) || /^\d+$/.test(value)) {
                callback('密码格式太单调');
                return;
            } else if (value == getFieldValue('password')) {
                callback('新密码不能与原密码相同');
                return;
            } else if (value == sessionStorage.getItem('dispAccountName')) {
                callback('密码不能与账户名相同');
                return;
            } else {
                callback()
            }
        } catch (err) {
            callback(err)
        }
    }
    /**
     * 检查输入的原密码
     */
    handleCheckOldPass = (rules, value = '', callback) => {
        try {
            if (value.length < 8 || value.length > 16) {
                callback('请输入8-16位字符');
                return;
            } else if (/^\W+$/.test(value) || /^[a-z]+$/.test(value) || /^[A-Z]+$/.test(value) || /^\d+$/.test(value)) {
                callback('密码格式太单调');
                return;
            } else {
                callback()
            }
        } catch (err) {
            callback(err)
        }
    }
    /**
     * 确认密码
     */
    compareToNewPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('newpassword')) {
            callback('两次输入密码不一致！');
        } else {
            callback();
        }
    }

    render() {
        let { visible } = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title="修改密码"
                className='password-modal'
                maskClosable={false}
                visible={visible}
                width='468px'
                height='204px'
                onCancel={this.handleCancel}
                onOk={this.handleSubmit}
            >
                <Form {...layout}>
                    <Form.Item label='原密码'>
                        {getFieldDecorator('password', {
                            rules: [{
                                required: true,
                                message: '原密码不能为空',
                            },
                            // { validator: (rules, value, callback) => { this.handleCheckOldPass(rules, value, callback) } }
                            ],
                        })
                            (<Input.Password placeholder="请输入原密码" />)}
                    </Form.Item>
                    <Form.Item label='新密码'>
                        {getFieldDecorator('newpassword', {
                            rules: [
                                {
                                    required: true,
                                    message: ' '
                                },
                                { validator: (rules, value, callback) => { this.handleCheck(rules, value, callback) } }
                            ],
                        })
                            (<Input.Password placeholder="请输入新密码" />)}
                    </Form.Item>
                    <Form.Item label='确认密码'>
                        {getFieldDecorator('confirmPass', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入8-16位字符'
                                },
                                { validator: this.compareToNewPassword }
                            ],
                        })
                            (<Input.Password placeholder="请输入新密码" />)}
                    </Form.Item>
                </Form>

            </Modal>

        );
    }
}

export default Form.create()(PasswordModal);
