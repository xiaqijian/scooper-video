/**
 * @author wangyan
 * @date 2018/12/17.
 * @version v1.0.1
 * @record 由于是比较早的版本 所以一些规范没有按制定的规范来书写，比如class名等
 */
import React from "react";
import axios from "axios";
import "moment/locale/zh-cn";
import {
  AutoComplete,
  Button,
  Icon,
  Input,
  Menu,
  message,
  Modal,
  Tabs,
  Tree,
} from "antd";
import "./UserPick.less";
import PropTypes from "prop-types";
import { scooper } from "./scooper.pinyin";
import { meetapis } from '../../api/meetapis'

const TabPane = Tabs.TabPane;
const { TreeNode } = Tree;
const Search = Input.Search;
const DirectoryTree = Tree.DirectoryTree;

export default class UserPicker extends React.Component {
  static propTypes = {
    // visible: PropTypes.bool.isRequired,
    mode: PropTypes.number.isRequired,
    token: PropTypes.string.isRequired,
    ip: PropTypes.string,
    limit: PropTypes.number,
    chosedMem: PropTypes.array.isRequired,
    defaultMemData: PropTypes.array.isRequired,
    memData: PropTypes.func,
    userPickerHide: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      mode: 1, //选择器模式 0-单人 1-多人  默认多人选择器
      defaultMemData: [], //初始已添加人员列表

      token: "",
      api: {
        listOrgDept:
          "/scooper-core-rest/data/contacts/orgDeptManage/listOrgDept",
        listDeptByParent:
          "/mpgw/contact/listDepartments",
        listOrgMember:
          "/mpgw/contact/listMembers",
        findOrgMemberByTel:
          "/scooper-core-rest/data/contacts/orgMemberManage/findOrgMemberByTel",
        listDispGroup:
          "/scooper-core-rest/data/dispatch/dispGroupManage/listDispGroup",
        listDispMember:
          "/scooper-core-rest/data/dispatch/dispMemberManage/listDispMember",
        queryOrgDept:
          "/scooper-core-rest/data/contacts/orgDeptManage/queryOrgDept",
      },

      allMemData: [], //加载的成员列表
      memData: [], //筛选过的成员列表
      DeptData: [], //部门树列表

      rightBtnDis: true, //添加按钮是否禁用
      leftBtnDis: true, //删除按钮是否禁用
      addAllBtnDis: true, //添加全部按钮是否禁用
      deleteAllBtnDis: true, //删除全部按钮是否禁用

      addMemData: [], //准备添加的成员
      chosenMem: [], //已添加成员列表 mode为1时有用
      deleteMem: [], //删除后剩下的成员 准备阶段

      selectedKeys: [], //成员列表已选择的key
      memSelectedKeys: [], //已添加成员列表 已选择的key

      searchVal: "", //搜索框内容
      deptSearchVal: "",
      deptListShow: false,
      deptSearchList: [],

      limit: "",
      isDeptSearch: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    let { mode, ip, limit, token, memList, chosedMem, visible } = nextProps;
    if (
      this.props.mode != mode ||
      this.props.visible != visible ||
      this.props.ip != ip ||
      this.props.limit != limit ||
      this.props.token != token
    ) {
      this.setState({
        mode: mode,
        ip: ip,
        token: token,
        limit: limit,
        allMemData: memList,
        visible: visible,
        memData: [],
        searchVal: "",
        deptSearchList: [],
        addMemData: chosedMem ? [...chosedMem] : [],
        chosenMem: chosedMem ? [...chosedMem] : [],
        defaultMemData: chosedMem ? [...chosedMem] : [],
      });
      if (chosedMem.length !== 0) {
        this.setState({
          deleteAllBtnDis: false,
        });
      }
      this.loadDept(ip, token);
    }
  }

  //加载部门信息
  async loadDept(ip, token) {

    let { api } = this.state;
    let deptUrl = api.listDeptByParent + "?token=" + token;
    let postData = new URLSearchParams();
    let deptParams = {
      //  token: token
      parentId: 0,
    };
    for (let key in deptParams) {
      postData.append(key, deptParams[key]);
    }
    axios
      .post(deptUrl, postData)
      .then((response) => {
        if (response.data.code === 0) {
          console.log(response);
          this.setState({
            DeptData: response.data.data,
          });
        } else {
          message.error(response.data.message);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  //异步加载
  onLoadData = (treeNode) =>
    new Promise((resolve) => {
      let { ip, api, DeptData, token } = this.state;
      if (treeNode.props.children) {
        resolve();
        return;
      }
      let deptParams = {
        token: token,
        parentId: treeNode.props.dataRef.id,
      };

      let postData = new URLSearchParams();
      for (let key in deptParams) {
        postData.append(key, deptParams[key]);
      }

      axios
        .post(ip + api.listDeptByParent, postData)
        .then((response) => {
          if (response.data.code === 0) {
            treeNode.props.dataRef.children = response.data.data;
            this.setState({
              DeptData: [...DeptData],
            });
            resolve();
          } else {
            message.error(response.data.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });

  //渲染树节点
  renderTreeNodes = (data) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.deptName} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.deptName} key={item.id} dataRef={item} />;
    });

  //点击树节点 加载成员
  onTreeSelect = (selectedKeys, info) => {
    let parentCode = info.node.props.dataRef.data;
    let deptId = info.node.props.dataRef.id;
    this.loadMem(parentCode, deptId);
  };
  //点击列表节点 加载成员
  onListSelect = (Keys, e) => {
    this.loadMem(e.node.props.parentCode, Keys);
  };
  //搜索成员
  onSearch = (value) => {
    let { allMemData } = this.state;
    let searchInput = trim(value);
    this.setState({
      searchVal: searchInput,
    });
    if (!value || !value.trim()) {
      this.setState({
        memData: allMemData,
      });
      return;
    }

    this.queryMemData(searchInput);
  };

  async queryMemData(searchVal) {
    let { ip, api, token } = this.state;
    let params = {
      token: token,
      keyword: searchVal,
    };
    let postData = new URLSearchParams();
    for (let key in params) {
      postData.append(key, params[key]);
    }
    axios.post(api.listOrgMember, postData).then((response) => {
      if (response.data.code == 0) {
        let list = response.data.data;
        this.setState({
          memData: list,
        });
      }
    });
  }

  //搜索部门
  // onDeptSearch = (value) => {
  //     console.log(value);
  //     let { chosenMem, ip, api, token, searchVal, isDeptSearch } = this.state;
  //     if (isDeptSearch) {
  //         if (value == '') {
  //             message.info('请输入搜索关键字');
  //             return;
  //         }
  //         let params = {
  //             token: token,
  //             deptName: value
  //         }
  //         let postData = new URLSearchParams();
  //         for (let key in params) {
  //             postData.append(key, params[key]);
  //         }
  //         axios.post(ip + api.queryOrgDept, postData).then((response) => {
  //             if (response.data.code == 0) {
  //                 // console.log(response.data.data, '----部门搜索');
  //                 let data = response.data.data;
  //                 let list = data.list;
  //                 if (list.length !== 0) {
  //                     this.setState({
  //                         deptSearchList: list,
  //                         searchVal: ''
  //                     });

  //                 }
  //             }
  //         })
  //     } else {
  //         this.onSearch(value, 1)
  //     }

  // }

  //清除搜索
  clearDeptSearchList = () => {
    //  this.refs.searchDept.input.state.value = '';
    this.setState({ deptSearchList: [] });
  };
  //加载成员
  loadMem(parentCode, deptId) {
    let { chosenMem, ip, api, token, searchVal } = this.state;
    let params = {
      token: token,
      parentCode: parentCode,
      deptId: deptId,
    };
    let postData = new URLSearchParams();
    for (let key in params) {
      postData.append(key, params[key]);
    }
    axios
      .post(api.listOrgMember, postData)
      .then((response) => {
        if (response.data.code === 0) {
          var memData = response.data.data;
          memData.map((item) => {
            item.pinyinLess = scooper.pinyin.convert(item.memName, true);
            item.pinyinFull = scooper.pinyin.convert(item.memName);
          });

          let filterData = [];
          if (searchVal != "") {
            memData &&
              memData.map((item) => {
                if (
                  isMatch(item.memName, searchVal) ||
                  isMatch(item.pinyinLess, searchVal) ||
                  isMatch(item.pinyinFull, searchVal)
                ) {
                  filterData.push(item);
                }
              });
          } else {
            filterData = memData;
          }

          this.setState({
            allMemData: memData,
            memData: filterData,
            selectedKeys: [],
            addMemData: [...chosenMem],
            rightBtnDis: true,
          });
          if (response.data.data.length != 0) {
            this.setState({
              addAllBtnDis: false,
            });
          } else {
            this.setState({
              addAllBtnDis: true,
            });
          }
        } else {
          message.error(response.data.message);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  //选择人员
  onMemSelect = (e) => {
    let {
      addMemData,
      selectedKeys,
      mode,
      deleteMem,
      chosenMem,
      memSelectedKeys,
      limit,
    } = this.state;
    let value = e.item.props.value;
    if (memSelectedKeys.length !== 0) {
      this.setState({
        memSelectedKeys: [],
        leftBtnDis: true,
      });
    }
    if (mode === 1) {
      selectedKeys.push(e.key);
      if (addMemData.length === 0) {
        addMemData.push(value);
      } else {
        let hasItem = false;
        // console.log(addMemData, 'memSelect-addMemData-before')
        addMemData.map((item) => {
          if (item.memTel == value.memTel) {
            hasItem = true;
          }
        });
        if (!hasItem) {
          if (addMemData.length >= limit) {
            message.info("人员选择达到上限");
          } else {
            addMemData.push(value);
          }
        }
        // console.log(addMemData, 'memSelect-addMemData-after')
      }
      if (chosenMem.length === 0) {
        deleteMem.push(value);
      } else {
        let hasItem = false;
        chosenMem.map((item) => {
          if (item.memTel == value.memTel) {
            hasItem = true;
          }
        });
        if (!hasItem) {
          deleteMem.push(value);
        }
      }
    } else {
      selectedKeys[0] = e.key;
      addMemData[0] = value;
    }
    this.setState({
      rightBtnDis: false,
      addMemData: addMemData,
      selectedKeys: selectedKeys,
      deleteMem: deleteMem,
    });
  };

  //取消选择人员
  memDeselect = (e) => {
    let { addMemData, selectedKeys, chosenMem, deleteMem } = this.state;
    let value = e.item.props.value;
    let hasItem = false;
    for (let i in chosenMem) {
      if (chosenMem[i].memTel == value.memTel) {
        hasItem = true;
      }
    }
    addMemData.map((item, index) => {
      if (item.memTel == value.memTel) {
        if (!hasItem) {
          addMemData.splice(index, 1);
        }
        for (let i in selectedKeys) {
          if (selectedKeys[i] === e.key) {
            selectedKeys.splice(i, 1);
          }
        }
      }
    });
    deleteMem.map((item, index) => {
      if (item.memTel == value.memTel) {
        if (!hasItem) {
          deleteMem.splice(index, 1);
        }
      }
    });
    this.setState({
      addMemData: addMemData,
      deleteMem: deleteMem,
      selectedKeys: selectedKeys,
    });
  };

  //双击添加人员
  onAddDoubleClick(value) {
    let { chosenMem, mode, limit } = this.state;
    let hasItem = false;
    if (chosenMem.length != 0) {
      chosenMem.map((item) => {
        if (item.memTel == value.memTel) {
          hasItem = true;
        }
      });
    }

    if (!hasItem) {
      let arr = [];
      arr[0] = value;
      if (chosenMem.length >= limit) {
        message.info("人员选择达到上限");
      } else {
        chosenMem.push(value);
      }
    }

    //当mode为0时，单人选择器,双击时选择完毕
    if (mode === 0) {
      let arr = [];
      arr[0] = value;
      this.props.memData(arr);
      this.setState({
        addMemData: [],
        chosenMem: [],
        selectedKeys: [],
      });
    }
    this.setState({
      addMemData: [...chosenMem],
      chosenMem: chosenMem,
      selectedKeys: [],
      memSelectedKeys: [],
      rightBtnDis: true,
      leftBtnDis: true,
      deleteAllBtnDis: false,
    });
  }

  //添加、向右 按钮
  onAddMem() {
    let { addMemData } = this.state;
    // console.log(addMemData, 'addMemData');
    this.setState({
      chosenMem: [...addMemData],
      selectedKeys: [],
      rightBtnDis: true,
      deleteAllBtnDis: false,
    });
  }

  //添加当前所有成员 按钮
  addAllMem() {
    let { memData, chosenMem, limit } = this.state;
    for (let i in memData) {
      let flag = true;
      for (let j in chosenMem) {
        if (chosenMem[j].memTel == memData[i].memTel) {
          flag = false;
        }
      }
      if (flag) {
        if (chosenMem.length >= limit) {
          message.info("人员选择达到上限");
          break;
        } else {
          chosenMem.push(memData[i]);
        }
      }
    }
    // console.log(chosenMem, '全选之后的addMemData');
    this.setState({
      chosenMem: [...chosenMem],
      addMemData: [...chosenMem],
      selectedKeys: [],
      rightBtnDis: true,
      deleteAllBtnDis: false,
    });
  }

  //选择已添加人员列 预备删除
  onChosenMemSelect = (e) => {
    let { memSelectedKeys, chosenMem, deleteMem, selectedKeys } = this.state;
    let value = e.item.props.value;
    if (selectedKeys.length !== 0) {
      this.setState({
        selectedKeys: [],
        rightBtnDis: true,
      });
    }
    let arr = [];
    if (memSelectedKeys.length === 0) {
      arr = [...chosenMem];
    } else {
      arr = deleteMem;
    }
    arr.map((item, index) => {
      if (item.memTel == value.memTel) {
        arr.splice(index, 1);
      }
    });
    memSelectedKeys.push(e.key);

    this.setState({
      leftBtnDis: false,
      deleteMem: arr,
      memSelectedKeys: memSelectedKeys,
    });
  };

  //取消选择已添加人员 取消删除
  chosenMemDeSelect = (e) => {
    let { memSelectedKeys, chosenMem, deleteMem } = this.state;
    let value = e.item.props.value;
    chosenMem.map((item, index) => {
      if (item.id == value.accId) {
        for (let i in memSelectedKeys) {
          if (memSelectedKeys[i] === e.key) {
            memSelectedKeys.splice(i, 1);
          }
        }
        deleteMem.splice(index, 0, item);
      }
    });
    this.setState({
      memSelectedKeys: memSelectedKeys,
      deleteMem: deleteMem,
    });
  };

  //双击删除人员
  onDeleteDbClick(value) {
    let { chosenMem } = this.state;
    let hasData = true;

    chosenMem.map((item, index) => {
      if (item.id == value.accId) {
        chosenMem.splice(index, 1);
      }
    });
    if (chosenMem.length === 0) {
      hasData = false;
    }

    this.setState({
      chosenMem: chosenMem,
      deleteMem: [...chosenMem],
      deleteAllBtnDis: !hasData,
      addMemData: [...chosenMem],
      leftBtnDis: true,
      rightBtnDis: true,
      selectedKeys: [],
      memSelectedKeys: [],
    });
  }

  //删除、向左按钮
  onDeleteMem() {
    let { deleteMem } = this.state;
    this.setState({
      chosenMem: [...deleteMem],
      addMemData: [...deleteMem],
      leftBtnDis: true,
      memSelectedKeys: [],
    });
    if (deleteMem.length === 0) {
      this.setState({
        deleteAllBtnDis: true,
      });
    } else {
      this.setState({
        deleteAllBtnDis: false,
      });
    }
  }

  //删除所有成员 按钮
  deleteAllMem() {
    this.setState({
      chosenMem: [],
      addMemData: [],
    });
  }

  //确定
  onPickOk() {
    let { chosenMem, addMemData, mode } = this.state;
    if (mode === 0) {
      this.props.memData(addMemData);
    } else {
      this.props.memData(chosenMem);
    }
    this.props.userPickerHide();
    this.setState({
      addMemData: [],
      chosenMem: [],
      memSelectedKeys: [],
      selectedKeys: [],
    });
  }

  //取消
  onCancel() {
    let { defaultMemData } = this.state;
    this.props.memData(defaultMemData);
    this.props.userPickerHide();
    this.setState({
      visible: false,
      addMemData: [],
      chosenMem: [],
      memSelectedKeys: [],
      selectedKeys: [],
    });
  }
  /**
   * @desc 生成除摄像头之外的树(列表)
   */
  renderTreeNodes2 = (data) =>
    data.map((item, i) => {
      let title = item.deptName;
      let id = item.id;
      return (
        <TreeNode
          title={title}
          key={id}
          isLeaf={true}
          parentCode={item.orgCode}
        />
      );
    });
  render() {
    const {
      mode,
      DeptData,
      memData,
      rightBtnDis,
      leftBtnDis,
      chosenMem,
      selectedKeys,
      memSelectedKeys,
      addAllBtnDis,
      deleteAllBtnDis,
      limit,
      defaultMemData,
      searchVal,
      deptListShow,
      deptSearchList,
      isDeptSearch,
      visible,
    } = this.state;
    const { title } = this.props;
    // console.log(memData);
    //                     console.log(chosenMem)
    return (
      <Modal
        title={title}
        width={865}
        visible={visible}
        onOk={this.onPickOk.bind(this)}
        onCancel={this.onCancel.bind(this)}
        destroyOnClose={true}
        closable={false}
        className="skin-modal"
      >
        <div className="selectBox">
          <div
            className={`ele-divider content-bg ${mode === 1 ? "selectLeft" : "selectLeftSingle"
              }`}
          >
            <AutoComplete
              className={"skin-select-auto-complete"}
              placeholder="请输入人员名称"
              onChange={(value) => this.onSearch(value)}
              value={searchVal}
            >
              <Input
                className="content-bg"
                suffix={
                  <Icon type="search" className="certain-category-icon" />
                }
              />
              {/* <Search
                            className={"skin-select-auto-complete"}
                            placeholder="回车搜索人员名称"
                            onSearch={(value) => this.onSearch(value, 1)}

                        /> */}
            </AutoComplete>

            <Tabs
              type="card"
              className="deptContent normal-font"
              onTabClick={() => this.clearDeptSearchList()}
            >
              <TabPane tab="部门" key="1">
                {/* <Search
                                    className="dept-search"
                                    placeholder="请输入部门名称"
                                    ref="searchDept"
                                    onSearch={this.onDeptSearch} 
                                    /> */}
                {deptSearchList.length == 0 ? (
                  <DirectoryTree
                    className="skin-ant-tree"
                    loadData={this.onLoadData}
                    onSelect={this.onTreeSelect}
                  >
                    {this.renderTreeNodes(DeptData)}
                  </DirectoryTree>
                ) : (
                  <Tree
                    showIcon={false}
                    onSelect={this.onListSelect}
                    className="list-tree"
                  >
                    {this.renderTreeNodes2(deptSearchList)}
                  </Tree>
                )}
              </TabPane>
            </Tabs>

            <Menu
              className="skin-menu-basic chose-menu ele-divider-left ele-divider-right content-bg"
              onSelect={this.onMemSelect}
              onDeselect={this.memDeselect}
              multiple
              selectedKeys={selectedKeys}
            >
              {memData &&
                memData.map((item, index) => {
                  let count = 0;
                  chosenMem.forEach((mem) => {
                    if (mem.memTel == item.memTel) {
                      count++;
                    }
                  });
                  return (
                    <Menu.Item
                      key={index}
                      value={item}
                      disabled={count > 0}
                      onDoubleClick={this.onAddDoubleClick.bind(this, item)}
                    >
                      <div className="mem-item">
                        <span className="item-name over-ellipsis">
                          {item.memName}
                        </span>
                        <span className="deptName over-ellipsis second-font">
                          {item.deptName}
                        </span>
                      </div>
                      {/* <div className="mem-item"><Icon type="phone" theme="twoTone"></Icon>{item.memTel}</div> */}
                    </Menu.Item>
                  );
                })}
            </Menu>
          </div>

          {mode === 1 ? (
            <div className="selectBtn">
              <Button
                shape="circle"
                icon="double-right"
                disabled={addAllBtnDis ? true : false}
                onClick={this.addAllMem.bind(this)}
              />
              <Button
                shape="circle"
                icon="arrow-right"
                className="select-btn"
                disabled={rightBtnDis ? true : false}
                onClick={this.onAddMem.bind(this)}
              />
              <Button
                shape="circle"
                icon="arrow-left"
                className="select-btn"
                disabled={leftBtnDis ? true : false}
                onClick={this.onDeleteMem.bind(this)}
              />
              <Button
                shape="circle"
                icon="double-left"
                className="select-btn"
                disabled={deleteAllBtnDis ? true : false}
                onClick={this.deleteAllMem.bind(this)}
              />
            </div>
          ) : null}

          {mode === 1 ? (
            <React.Fragment>
              <div className="chosed-tip-text">
                <span className="select-span">已选择</span>
                <span className="select-info">
                  {" "}
                  {chosenMem.length}/{limit}
                </span>
              </div>
              <Menu
                className="selectRight skin-menu-basic ele-divider"
                onSelect={this.onChosenMemSelect}
                onDeselect={this.chosenMemDeSelect}
                multiple
                selectedKeys={memSelectedKeys}
              >
                {chosenMem.map((item, index) => {
                  return (
                    <Menu.Item
                      key={index}
                      value={item}
                      onDoubleClick={this.onDeleteDbClick.bind(this, item)}
                    >
                      <div className="mem-item">
                        <span className="item-name over-ellipsis">
                          {item.memName}
                        </span>
                        <span className="deptName over-ellipsis second-font">
                          {item.deptName}
                        </span>
                      </div>
                      {/* <div className="mem-item"><Icon type="phone" theme="twoTone"></Icon>{item.memTel}</div> */}
                    </Menu.Item>
                  );
                })}
              </Menu>
            </React.Fragment>
          ) : null}
        </div>
      </Modal>
    );
  }
}

/**
 * 检测str是否包含matchStr，忽略大小写
 * @param str
 * @param matchStr
 * @returns {boolean}
 */
function isMatch(str, matchStr) {
  if (str == null || str == "") {
    return matchStr == null || matchStr == "";
  } else {
    return (
      str.indexOf(matchStr) >= 0 ||
      str.toLowerCase().indexOf(matchStr.toLowerCase()) >= 0 ||
      str.toUpperCase().indexOf(matchStr.toUpperCase()) >= 0
    );
  }
}

/*
 * 去除字符串前后的空格
 * 返回值：去除空格后的字符串
 * */
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}
