/**
 * @file 登录页
 * @author XXX
 * @date 2019/10/10
 * @version:v1.1.0
 */

import React, { PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { sha256_digest } from '../../lib/sha256/sha256';
import { Form, Input, Button, message } from 'antd';
import { HOME_PAGE,platUrl } from '../../config/constants';
import { apis } from "../../util/apis";
import {setConfigData} from '../../reducer/loading-reducer'
import { connect } from 'react-redux';
import '../../less/login.less';


const FormItem = Form.Item;

@connect(
    state => state.loading,
    {setConfigData}
)
class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            captchaSrc: apis.auth.captcha,
            chemicalTechnology: ''
        }
    }

    componentDidMount() {

    }


    /**
     * 点击登录
     * */
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.doLogin(values);
            }
        });
    };

    /**
     * 验证码刷新
     */
    resetCaptcha() {
        var timestamp = new Date().getTime();

        this.setState({
            captchaSrc: platUrl + apis.auth.captcha + "?t=" + timestamp
        })
    };

    /**
     * 登录请求
     * @param：values 登录数据
     */
    async doLogin(values) {

        let { username, password,captcha } = values;

        let params = {
            username:username,
            password: sha256_digest(password),
            captcha:captcha
        };

        let  data = await apis.login.login(params) || [];

        if(data && data.code == 0){
            sessionStorage.setItem("dispWebToken",data.data.validToken);
            this.setState({
                isLogin:true
            })
            
        }else{
            message.error(data.message || "登录失败,用户名密码错误或没授权！")
            this.resetCaptcha();
            this.resetValue("captcha");
        }
    }

    //重置用户名或密码
    resetValue(e) {
        this.props.form.resetFields(e, []);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let {configData} = this.props
        let renderNode = '';

        if (this.state.isLogin ) {
            if(JSON.stringify(configData) !== '{}' && configData.set["disp.set.module.loadTogether"] == 3){
                // 路由方式
                renderNode = <Redirect to={`/main/${configData.nav['disp.nav.default']}`} />;
            }else if(JSON.stringify(configData) !== '{}' && configData.set["disp.set.module.loadTogether"] == 1){
                // iframe方式
                renderNode = <Redirect to={`/main/front`} />;
            }
            
        } else {
            renderNode = <div className="login">

                <div className="login-header">
                    <i></i>
                    {JSON.stringify(configData) !== '{}'?
                        <span>{configData.set['disp.set.header.title']}</span>
                        :<span>应急指挥调度系统</span> 
                    }
                    
                </div>
                <div className="login-box">
                    <div className="login-box-title">用户登录</div>
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <FormItem>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: '请输入账号!' }],
                            })(
                                <Input
                                autoComplete="off"
                                prefix={<i className="usernamePrefix"></i>}
                                placeholder="用户名"
                                suffix={<i className="suffix" onClick={() => this.resetValue("username")}></i>}
                            />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }],
                            })(
                                <Input
                                autoComplete="off"
                                prefix={<i className="passwordPrefix"></i>}
                                type="password"
                                placeholder="密码"
                                suffix={<i className="suffix" onClick={() => this.resetValue("password")}></i>}
                                />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('captcha', {
                                rules: [{ required: true, message: '请输入验证码!' }],
                            })(
                                <Input 
                                    prefix={<i className="captchaPrefix"></i>}
                                    style={{ width: '210px' }}
                                    placeholder="验证码" />
                            )}
                            <img id="captcha" className="warpper-code" src={`${platUrl}${this.state.captchaSrc}`} />
                            <span id="next_captcha" className="warpper-text" style={{cursor:'pointer'}} onClick={() => this.resetCaptcha()}>看不清换一张</span>

                        </FormItem>
                        <FormItem>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                登　 录
                        </Button>
                        </FormItem>
                    </Form>
                </div>

                <div className="login-footer">
                    ©2020 SCOOPER 杭州叙简科技股份有限公司
                </div>
            </div>
        }

        return renderNode;
    }
}

const WrappedNormalLoginForm = Form.create()(Login);

export default WrappedNormalLoginForm;
