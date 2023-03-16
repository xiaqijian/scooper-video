/*
 * @File: 组呼通知记录搜索
 * @Author: liulian
 * @Date: 2021-02-23 09:54:42
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-23 10:40:18
 */
import React, { PureComponent } from "react";
import { Form, Input, Button, DatePicker } from 'antd';

const { RangePicker } = DatePicker;

class RecordSearch extends PureComponent {
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
                const rangeTimeValue = fieldsValue['tmNotify'];
                let paramDetail = this.state.params;
                paramDetail.searchKey = fieldsValue.callee;
                if(rangeTimeValue){
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
                    <Form.Item style={{marginRight:'0.6rem'}}>
                        {getFieldDecorator('callee', { initialValue: '' })(<Input placeholder="请输入发起者名称" />)}
                    </Form.Item>
                    <Form.Item style={{marginRight:'0.6rem'}}>
                        {getFieldDecorator('tmNotify', { initialValue: '' })
                            (<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)
                        }
                    </Form.Item>
                    <Form.Item style={{marginRight:'0px',marginLeft:'0.5rem'}}>
                        <Button htmlType="submit" type="primary" className='search-btn' style={{marginRight:'0.5rem'}}>搜索</Button>
                        <Button className="reset" type="primary" ghost onClick={this.onResetClick}>重置</Button>
                    </Form.Item>
                </Form>

            </div>

        );
    }
}

export default Form.create()(RecordSearch);
