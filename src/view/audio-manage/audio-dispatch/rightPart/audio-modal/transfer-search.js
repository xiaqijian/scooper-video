/*
 * @File: 转接面板--搜索框
 * @Author: liulian
 * @Date: 2020-07-15 16:03:59
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-25 14:00:55
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { apis } from '../../../../../util/apis';
import { setGroupList, setGroupMemList, setTransferInfo, setIsShowPanel, setIsShowSearchPanel, setResultMemList, setIsShowTransferResultPanel } from '../../../../../reducer/audio-handle-reducer'
import { Input, Select, Tabs, Tree, message } from 'antd';
import { debounce, isEmpty, uniqBy } from 'lodash';
import dispatchManager from '../../../../../util/dispatch-manager';

const { TabPane } = Tabs;
const { TreeNode } = Tree;

@connect(
    state => state.audioHandle,
    { setGroupList, setGroupMemList, setTransferInfo, setIsShowPanel, setIsShowSearchPanel, setResultMemList, setIsShowTransferResultPanel }
)
class TransferSearch extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            treeData: [],  //通讯录树结构
            selectData: [], //选中的成员列表
            searchKey: ''
        }
        this.loadMemberWithPath = debounce(this.loadMemberWithPath, 500)
    }
    inputFocus = (e) => {
        let { transferInfo } = this.props;
        if (!transferInfo.val) {
            this.props.setIsShowPanel(true);
            this.props.setIsShowSearchPanel(false);
        }

    }
    onChange = (e) => {
        e.persist();
        this.props.setIsShowPanel(false);
        this.props.setIsShowSearchPanel(true);
        this.props.setTransferInfo({ val: e.target.value })
        if (e.target.value.toString().length == 0) {
            this.props.setIsShowPanel(true);
            this.props.setIsShowSearchPanel(false);
        }

        if (e.target.value) {
            // this.setState({searchKey:e.target.value})
            this.loadMemberWithPath(e.target.value)
        }


    }
    /**
     * 人员搜索（返回结果携带部门路径）
     */
    loadMemberWithPath = async (value) => {
        let params = { searchKey: value }
        this.setState({ searchKey: value })
        let data = await apis.disp.pageMemberWithPath(params);
        data && data.list.forEach(element => {
            element.pageNum = data.pageNum
            element.hasNextPage = data.hasNextPage
            if (element.dutyName) {
                element.deptPath = element.deptPath + "-" + element.dutyName
            } else {
                element.deptPath = element.deptPath
            }

        });
        this.props.setResultMemList(data.list);
        // if(data.list.length == 0){

        // }
    }
    /**
     * 加载群组成员
     */
    loadGroupMember = async (first, id) => {
        // first:加载第一个群组的成员
        let { groupList } = this.props;
        groupList.map((item, index) => {
            if (item.id == id) {
                item.onsel = true
            } else {
                item.onsel = false
            }
        })
        this.props.setGroupList(groupList);
        let params;
        if (first) {
            params = {
                groupId: groupList && groupList[0].id
            }
        } else {
            params = {
                groupId: id
            }
        }
        let data = await apis.dispatch.queryDispMember(params);
        this.props.setGroupMemList(data.list);
    }
    /**
     * 选择群组人员
     */
    choseGroupMem = async (item) => {
        item.val = item.name;
        this.props.setTransferInfo(item);
        this.props.setIsShowPanel(false);

        this.transferOk(item);
    }

    /**
     * 搜索结果点击选择
     */
    searchClick = (item) => {
        item.val = (item.name && item.name != undefined) ? item.name : item.tel;
        this.props.setTransferInfo(item);
        this.props.setIsShowSearchPanel(false);
        this.transferOk(item);
    }

    /**
     * 转接
     */
    transferOk = (item) => {
        let { fromInfo } = this.props;
        if (item.memTel) {
            // 转接
            dispatchManager.getCalls().transfer(fromInfo.memTel, item.memTel);
            this.props.setIsShowTransferResultPanel(true);
            this.props.transferEndByClose(item)
        } else if (item.id == 'empty-search') {
            // 没搜索到，直接转接该号码
            dispatchManager.getCalls().transfer(fromInfo.memTel, item.tel);
            this.props.setIsShowTransferResultPanel(true);
            this.props.transferEndByClose(item)
        } else {
            message.error("转接信息有误，请重新选择");
        }
    }

    /**
     * 加载通讯录树结构（一次性全加载）
     */
    loadCoreList = async () => {
        let data = await apis.core.listOrgDept({ deptType: 3 });
        let setting = {
            idKey: 'id',
            pIdKey: 'parentId',
            childKey: 'children'
        }
        let newNodes = this.transformTozTreeFormat(setting, data);
        this.setState({
            treeData: newNodes
        })
    }
    /** 
    * listorgDept的数据
    * 普通数据转换为树结构
    */
    transformTozTreeFormat = (setting, sNodes) => {
        var i, l,
            key = setting.idKey,
            parentKey = setting.pIdKey,
            childKey = setting.childKey;
        if (!key || key == "" || !sNodes) return [];

        if (this.isArray(sNodes)) {
            var r = [];
            var tmpMap = {};
            for (i = 0, l = sNodes.length; i < l; i++) {
                tmpMap[sNodes[i][key]] = sNodes[i];
            }
            for (i = 0, l = sNodes.length; i < l; i++) {
                if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
                    if (!tmpMap[sNodes[i][parentKey]][childKey])
                        tmpMap[sNodes[i][parentKey]][childKey] = [];
                    tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
                } else {
                    r.push(sNodes[i]);
                }
            }
            return r;
        } else {
            return [sNodes];
        }
    }
    /**
     * 是否是数组
     */
    isArray = (arr) => {
        return Object.prototype.toString.apply(arr) === "[object Array]";
    }
    /**
     * 选中的数据
     */
    onSelect = async (selectedKeys, info) => {
        let params = {
            deptId: selectedKeys[0]
        }
        let data = await apis.core.listOrgMember(params);
        this.setState({
            selectData: data
        })
    }
    /**
    * 渲染树节点
    */
    renderTreeNodes = (data) => {
        return data.map((item) => {
            return (
                <TreeNode
                    key={`${item.id}`}
                    symbol="dept"
                    id={item.id}
                    title={item.deptName}
                    value={item.deptName}
                    dataRef={item} >
                    {this.renderTreeNodes(item.children || [])}
                </TreeNode>
            );

        });
    };
    setSearchValColor(origValue, searchValue, nember) {
        if (origValue == null) {
            origValue = ''
        }
        let skin = window.scooper.configs.skin;
        const index = (origValue += "").indexOf(searchValue);
        const beforeStr = origValue.substr(0, index);
        const afterStr = origValue.substr(index + searchValue.length);
        const realStr = searchValue && index > -1 ? (
            <span id="name">
                {beforeStr}
                {skin == 'science' && <span style={{ color: '#fff' }}>{searchValue}</span>}
                {skin == 'light' && <span style={{ color: '#0080FF' }}>{searchValue}</span>}
                {skin == 'dark' && <span style={{ color: '#FFA600' }}>{searchValue}</span>}
                {afterStr}
            </span>
        ) : <span id="name">{origValue}</span>;
        return realStr;
    }

    componentDidMount() {
        this.loadGroupMember('first');
        // 加载通讯录树结构数据
        this.loadCoreList();
    }

    render() {
        const { groupList, groupMemList, isShowPanel, transferInfo, isShowSearchPanel, resultMemList } = this.props;
        let { treeData, selectData, searchKey } = this.state;
        return (
            <div className='transfer-search' id='transfer-search'>
                <Input
                    prefix={<i className="icon-transfer-search"></i>}
                    placeholder="请直接输入名字或者号码进行转接"
                    id='transfer-input'
                    autoComplete="off"
                    onFocus={this.inputFocus}
                    onChange={this.onChange}
                    value={transferInfo.val}
                />
                {isShowPanel &&
                    <div className='result-panel'>
                        <Tabs defaultActiveKey="1" onChange={this.tabsChange}>
                            <TabPane tab={<span>群组</span>} key="1">
                                <div className='group-list'>
                                    {groupList && groupList.map((item, index) => {
                                        return (
                                            <li className={`${item.onsel ? 'onsel' : ''}`} key={item.id} onClick={() => { this.loadGroupMember('', item.id) }}><span className='group-name'>{item.groupName}</span></li>
                                        )
                                    })}
                                </div>
                                <div className='mem-list'>
                                    {groupMemList && groupMemList.map((item, index) => {
                                        return (
                                            <li key={item.id} onClick={() => this.choseGroupMem(item)}><span className='mem-name'>{item.name}</span></li>
                                        )
                                    })}
                                </div>
                            </TabPane>
                            <TabPane tab={<span>通讯录</span>} key="2">
                                <div className='core-list'>
                                    <Tree onSelect={this.onSelect}>
                                        {this.renderTreeNodes(treeData)}
                                    </Tree>
                                </div>
                                <div className='mem-list'>
                                    {selectData && selectData.map((item, index) => {
                                        return (
                                            <li key={item.id} onClick={() => this.choseGroupMem(item)}><span className='mem-name'>{item.name}</span></li>
                                        )
                                    })}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                }
                {isShowSearchPanel && resultMemList.length > 0 &&
                    <div className='search-result-panel'>
                        {resultMemList.map((item) => {
                            return (
                                <div className='search-result' onClick={() => { this.searchClick(item) }}>
                                    <span className='result-name over-ellipsis'>{this.setSearchValColor(item.name, searchKey, 15)}</span>
                                    <span className='result-tel over-ellipsis'>{this.setSearchValColor(item.memTel, searchKey, 15)}</span>
                                    <p className='result-path over-ellipsis'>{item.deptPath}</p>
                                </div>
                            )
                        })
                        }
                    </div>
                }
                {isShowSearchPanel && resultMemList.length == 0 &&
                    <div className='search-result-panel'>
                        <p className='empty-search'>无本地搜索结果</p>
                        <p className='empty-info' onClick={() => { this.searchClick({ tel: searchKey, id: 'empty-search' }) }}>将电话转接给“{searchKey}”</p>
                    </div>
                }

            </div>
        )
    }
}

export default TransferSearch;