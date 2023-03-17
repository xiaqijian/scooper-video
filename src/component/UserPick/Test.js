/**
 * @author wangyan
 * @date 2018/12/17.
 * @version v1.0.1
 */
import React from 'react';
import axios from 'axios';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from '../../../node_modules/antd/lib/locale-provider/zh_CN';
import { Layout, Icon, Button, message, Form, Input, Modal } from 'antd';
import UserPicker from './UserPicker'


const { Content } = Layout;
const { TextArea } = Input;
const FormItem = Form.Item;
const platIp = formatMessage({ id: 'platIp' });
const coreIp = formatMessage({ id: 'coreIp' });
const token = formatMessage({ id: 'token' });
//let token = localStorage.getItem('token');

@Form.create()
export default class Test extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      mode: 0,              //选择器模式 0-单人 1-多人

      singleData: [],
      multiData: [],
      deleteAllBtnDis: []
    }
  }

  componentDidMount() {
    //this.tokenJudge();
  }

  //判断token可用
  tokenJudge() {
    let params = {
      token: token
    };

    let postData = new URLSearchParams();
    for (let key in params) {
      postData.append(key, params[key]);
    }
    axios.post(coreIp + '/system/authManage/tokenVerify', postData)
      .then((response) => {
        if (response.data.code === 0) {
          //console.log(response.data);
        } else {
          message.error(response.data.message);
        }
      })
      .catch(function (error) {
        console.log(error);
      }
      );
  }

  //单人添加按钮
  addSinglePerson() {
    let { singleData } = this.state;
    this.setState({
      modalVisible: true,
      mode: 0,
      defaultMemData: singleData
    })
  }

  //多人添加按钮
  addMultiPerson() {
    let { multiData } = this.state;
    this.setState({
      modalVisible: true,
      mode: 1,
      defaultMemData: multiData
    })
  }

  //获取人员选择器 人员
  getMemData = (memData) => {
    let { mode } = this.state;
    if (mode === 1) {
      this.setState({
        multiData: memData
      });
    } else {
      this.setState({
        singleData: memData
      });
    }
    this.setState({
      modalVisible: false
    })
  };


  render() {
    let { modalVisible, mode, singleData, multiData, defaultMemData } = this.state;
    const { getFieldDecorator } = this.props.form;

    let multiMem = [];
    if (multiData) {
      multiData.map((item) => {
        multiMem.push(item.name)
      });
    }

    //向选择器组件传参
    let userPickerParams = {
      visible: modalVisible,
      mode: mode,
      ip: 'http://192.168.106.67:8080',
      token: token,
      deptType: 'all',
      limit: 5,
      defaultMemData: defaultMemData
    };

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };

    const userPickerForm = () => {
      return (
        <Form style={{ width: '60%' }}>
          <FormItem
            {...formItemLayout}
            label="单人选择器">
            {getFieldDecorator('single', { initialValue: singleData[0] ? singleData[0].name : '' })
              (<TextArea placeholder="请输入人员..." autosize readOnly />)}
          </FormItem>
          <Button type="primary" shape="circle" icon="plus"
            style={{ position: 'absolute', left: '56%', top: '22px' }}
            onClick={this.addSinglePerson.bind(this)}
          />
          <FormItem
            {...formItemLayout}
            label="多人选择器">
            {getFieldDecorator('multi', { initialValue: multiMem.join(',') })
              (
                <TextArea
                  placeholder="请输入人员..."
                  autosize={{ minRows: 6, maxRows: 6 }}
                  readOnly
                />
              )}
          </FormItem>
          <Button type="primary" shape="circle" icon="plus"
            style={{ position: 'absolute', left: '56%', top: '10%' }}
            onClick={this.addMultiPerson.bind(this)}
          />
        </Form>
      )
    };


    return (
      <Layout style={{ padding: '0 24px 24px' }}>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280, position: 'relative' }}>
          {userPickerForm()}
        </Content>
        <UserPicker {...userPickerParams} memData={memData => this.getMemData(memData)} />
      </Layout>
    )
  }
}
