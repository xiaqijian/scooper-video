/*
 * @File: 语音调度-左侧群组&通讯录入口文件
 * @Author: liulian
 * @Date: 2020-06-10 15:43:45
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-10 17:11:03
 */
import React, { Component } from "react";
import { Prompt } from "react-router-dom";
import { Tabs } from "antd";
import { defaultLayers } from "../../../../config/constants";
import {
  fillMem,
  getTelStatus,
  loadGroupMember,
} from "../../../../util/method";
import { connect } from "react-redux";
import { apis } from "../../../../util/apis";
import {
  setDeptTree,
  setCurSelectGroup,
  setIsCheckAll,
  setMemList,
  setDefaultKey,
  setShowEdit,
  setRealMemListLen,
  setSelectedKeys,
  setCurSelectCore,
} from "../../../../reducer/audio-handle-reducer";
import MeetDispatch from "../../meet-dispatch";
import { isEmpty } from "lodash";
import timeUtil from "../../../../util/time-util";
import dispatchManager from "../../../../util/dispatch-manager";

const { TabPane } = Tabs;

@connect((state) => state.audioHandle, {
  setDeptTree,
  setCurSelectGroup,
  setIsCheckAll,
  setMemList,
  setDefaultKey,
  setShowEdit,
  setRealMemListLen,
  setSelectedKeys,
  setCurSelectCore,
})
class LeftCore extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  /**
   * 加载通讯录部门和人员
   */
  loadDeptTree = async () => {
    const data = await apis.core.listTreeDeptByParent({ id: 0 }); // 调用部门
    if (!isEmpty(data)) {
      // 得到一级部门数据
      const deptData = data.filter((item) => item.dataType === "orgDept");
      let requestAll = [];
      // 根据配置的默认展开部门数来请求（3层）暂时无用
      for (
        let i = 0, len = Math.min(defaultLayers, deptData.length);
        i < len;
        i++
      ) {
        const deptId = deptData[i] && deptData[i].id;
        deptId &&
          requestAll.push(apis.core.listTreeDeptByParent({ id: deptId })); // 调用部门
      }
      const childDeptdata = await Promise.all(requestAll);
      childDeptdata.forEach(
        (item, index) => (item.children = childDeptdata[index])
      );
      console.log("加载通讯录部门和人员结束");
      this.props.setDeptTree(deptData);
    }
  };
  componentDidMount() {
    this.loadDeptTree();
    // 解决本机时间和服务器时间不统一的问题
    timeUtil.setServerDateRul();
    let tel = sessionStorage.getItem("dispAccountTel");
    console.log(dispatchManager.accountDetail);
  }
  componentWillUnmount() {
    // let tel = sessionStorage.getItem('dispAccountTel')
    // if (tel && getTelStatus(tel) == 'callst_doubletalk') {
    //     const listener = ev => {
    //         ev.preventDefault();
    //         ev.returnValue = '当前正在通话中，离开中断通话，确定离开吗？';
    //     }
    //     window.removeEventListener('beforeunload', listener)
    // }
  }
  /**
   * tabs切换
   */
  tabsChange = (key) => {
    let { curSelectGroup } = this.props;
    let tempItem = JSON.parse(sessionStorage.getItem("tempItem"));
    this.props.setDefaultKey(key);
    this.props.setIsCheckAll(false);
    if (key == 1) {
      if (tempItem && tempItem.id.toString().indexOf("temp") > -1) {
        loadGroupMember("", "", "temp");
      } else {
        if (curSelectGroup && curSelectGroup.id) {
          loadGroupMember(curSelectGroup.id, 1);
        }
      }
      this.props.setSelectedKeys([]);
    }
    if (key == 2) {
      this.props.setShowEdit(false);
      this.props.setSelectedKeys([]);
      this.props.setCurSelectCore({});
      let { memList, realMemListLen } = this.props;
      memList &&
        memList.forEach((mem, index) => {
          mem.isDel = false;
          if (mem.id == "mem-add") {
            memList.splice(index, 1);
          }
        });
      let len = realMemListLen - 1;
      this.props.setRealMemListLen(len);
      this.props.setMemList([...memList]);
      fillMem();
    }
  };

  render() {
    let { defaultKey } = this.props;
    return (
      <div className="left-core">
        <MeetDispatch />
      </div>
    );
  }
}

export default LeftCore;
