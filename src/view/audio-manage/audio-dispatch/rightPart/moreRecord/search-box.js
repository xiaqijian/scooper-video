/*
 * @File: 语音调度-更多记录-搜索
 * @Author: liulian
 * @Date: 2020-07-07 15:02:57
 * @version: V0.0.0.1
 * @LastEditTime: 2020-09-02 14:25:12
 */
import React, { PureComponent } from "react";
import { Form, Input, Button, DatePicker } from 'antd';

const { RangePicker } = DatePicker;

class SearchBox extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            params: {},
        }
    }

    /**
     * 给父组件传值
     */
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, fieldsValue) => {
            if (!err) {
                const rangeTimeValue = fieldsValue['dateTime'];
                let paramDetail = this.state.params;
                paramDetail.searchKey = fieldsValue.name;
                if (rangeTimeValue) {
                    paramDetail.timeMin = rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss');
                    paramDetail.timeMax = rangeTimeValue[1].format('YYYY-MM-DD HH:mm:ss');
                }
                this.setState({ params: paramDetail });
                this.props.onClick(paramDetail);

            }
        });
    };


    /**
     * 重置
     */
    onResetClick = () => {
        this.props.form.resetFields();
        this.setState({ params: {} })
        this.props.onClick(null);
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className='search-box'>
                <Form onSubmit={this.handleSubmit} className='skin-ant-form' layout='inline'>
                    <Form.Item style={{ marginRight: '1.2rem' }}>
                        {getFieldDecorator('name', { initialValue: '' })(<Input placeholder="请输入成员名称" />)}
                    </Form.Item>
                    <Form.Item style={{ marginRight: '1.3rem' }}>
                        {getFieldDecorator('dateTime', { initialValue: '' })
                            (<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)
                        }
                    </Form.Item>
                    <Form.Item style={{ marginRight: '0px' }}>
                        <Button htmlType="submit" type="primary" className='search-btn'>搜索</Button>
                        <Button className="reset" type="primary" ghost onClick={this.onResetClick}>重置</Button>
                    </Form.Item>
                </Form>

            </div>

        );
    }
}

export default Form.create()(SearchBox);
