import React, {PureComponent} from 'react';
import {Avatar, Dropdown, Modal, Menu, Icon} from 'antd';

const {confirm} = Modal;

class UserInfo extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            changePasswordVisible: false,
            userMenu:[
                {id: '1', menuKey: 'userOperation', menuName: '修改密码'}
            ],
            roleName: "",
        }
    }

    componentDidMount() {
    }

    /**
     * 退出登录
     */
    exitSystem(){

        const _this = this;

        confirm({
            title: '确定要退出系统吗?',
            content: '',
            cancelText:'取消',
            okText:'确定',
            onOk() {
                _this.props.historyUrl.replace('/login');
                localStorage.clear();
                sessionStorage.clear();
            },
            onCancel() {},
        });
    }

    render(){

        const menu = (
            <Menu
                className={"user-info-menu"}
            >
                <Menu.Item key={"mbtn"} onClick={()=>this.exitSystem()}>
                    <Icon type = "logout" />
                    <span>退出登录</span>
                </Menu.Item>
            </Menu>
        );

        return (
            <Dropdown
                overlay={menu}
                placement="bottomRight"
                trigger={['hover']}
            >
                <div>
                    <Avatar size="small" icon="user" style={{ backgroundColor: '#1890ff' }}/>
                    <span>XXX</span>
                    <span> (管理员) </span>
                </div>
            </Dropdown>

        )
    }
}

export default UserInfo;