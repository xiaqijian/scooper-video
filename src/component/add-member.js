/*
 * @File: 人员选择
 * @Author: liulian
 * @Date: 2020/07/05 13:50:06 
 * @Version:0.0.0.1
 */

import React, { PureComponent } from "react";
import UserPicker from './UserPick/UserPicker';
import { getToken, platUrl } from "../config/constants";

import store from "../store";

class AddMember extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            mode: 1,              //选择器模式 0-单人 1-多人
        }
    }

    /**
     * 获取人员选择器 人员
     * @param memData 返回的人员数据
     */
    getMemData = (memData) => {
        memData.map((item) => {
            if (!item.orgMemId) {
                item.orgMemId = item.id
            }
        })
        this.props.getMemData(memData);
    };
    /**
     * @desc 选择人员弹窗取消
     */
    userPickerHide = () => {
        // this.setState({ visible: false })
    }

    render() {
        const { mode } = this.state;
        const { modalVisible, title } = this.props;
        let { configData } = store.getState().loading;
        //向选择器组件传参
        let userPickerParams = {
            visible: modalVisible,
            mode: mode,
            token: getToken(),
            ip: platUrl,
            // limit:16,
            // deptType: 'all',
            limit: (JSON.stringify(configData) !== '{}' && configData.set["disp.set.multSelect.max"]) ? Number(configData.set["disp.set.multSelect.max"]) : 12
        };
        return (
            <React.Fragment>
                <UserPicker {...userPickerParams}
                    defaultMemData={this.props.chosedMem || []}
                    chosedMem={this.props.chosedMem || []}
                    memData={memData => this.getMemData(memData)}
                    userPickerHide={this.userPickerHide}
                    title={title} />
            </React.Fragment>
        );
    }
}

export default AddMember;