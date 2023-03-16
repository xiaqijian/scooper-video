/*
 * @File: 语音调度-左侧通讯录
 * @Author: liulian
 * @Date: 2020-06-10 18:39:43
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-12 16:46:32
 */ 
import React, { Component } from "react";
import {Tree, Icon } from 'antd';
import {defaultLayers} from '../../../../config/constants';
import {loadOrgMember} from '../../../../util/method'
import { apis } from '../../../../util/apis';
import { connect } from 'react-redux';
import { setDeptTree,setMemList,setIsCheckAll,setCurSelectCore,setExpandedKeys,setSelectedKeys } from '../../../../reducer/audio-handle-reducer'
import SearchBox from './search-box';
import {isEmpty} from 'lodash';

const TreeNode = Tree.TreeNode;

@connect(
    state => state.audioHandle,
    { setDeptTree,setMemList,setIsCheckAll,setCurSelectCore,setExpandedKeys,setSelectedKeys }
)
class CoreList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 通讯录数据未加载完毕为true，否则为false
            loading: true,
        }
    }

    // 设置默认展开
    setDefaultExpandedKeys(deptTree) {
        let {expandedKeys} = this.props;
        const deptData = deptTree.filter(item => item.dataType === 'orgDept');
        for (let i = 0, len = Math.min(defaultLayers,deptData.length); i < len; i++) {
            const deptId = deptData[i] && deptData[i].id;
            let arr = expandedKeys.filter(items => items == "dept-"+deptId);
            if(arr.length == 0){
                deptId && expandedKeys.push(`dept-${deptId}`);
            }
        }
        this.props.setExpandedKeys([...expandedKeys]);
        this.setState({loading: false });
    }

    componentDidMount() {
        !isEmpty(this.props.deptTree) && this.setDefaultExpandedKeys(this.props.deptTree);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.deptTree.length && this.props.deptTree.length) {
            this.setDefaultExpandedKeys(this.props.deptTree);
        }
    }

    expandNode = expandedKeys => {
        this.props.setExpandedKeys([...expandedKeys])
    }

    onLoadData = async treeNode => {
        if (!isEmpty(treeNode.props.children)) return;
        const data = await apis.core.listTreeDeptByParent({ id: treeNode.props.dataRef.id});
        treeNode.props.dataRef.children = data;
        this.props.setDeptTree([...this.props.deptTree])
    }
    renderTreeNodes = data => {
        let lastParentDeptIndex = 0;
        data.map((item,index) =>{
            if(item.isParent){
                lastParentDeptIndex = index;
            }
        })
        return data.map((item,index) => {
            if (item.isParent) {
                return (
                    <TreeNode
                        key={`dept-${item.id}`}
                        symbol="dept"
                        className={`dept ${lastParentDeptIndex == index ?'last-dept':''}`}
                        title={<span ref={dom => { this[`dept${item.id}`] = dom }}>{item.name}</span>}
                        dataRef={item}
                        isLeaf={!item.isParent}
                    > 
                        {this.renderTreeNodes(item.children || [])}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    symbol="mem"
                    key={`dept-${item.id}`}
                    isLeaf={!item.isParent}
                    dataRef={item}
                    className="tree-mem"
                    title={
                        <span className="tree-none">
                            <span
                                className="dept-title-name over-ellipsis"
                                title={item.name.length > 12 ? item.name : ""}
                            >
                                {item.name} 
                            </span>
                           
                        </span>
                    }
                />
            )
        });
    };

    /**
     * 点击树节点
     * @param {*} selectedKeys [dept-1]
     * @param {*} e 详细信息：e.selectedNodes[0].props.dataRef
     */
    selectTreeNode = async (selectedKeys,e) => {
        if(selectedKeys.length == 0) return
        this.props.setSelectedKeys(selectedKeys)
        this.props.setCurSelectCore(e.selectedNodes[0].props.dataRef);
        let deptId = (selectedKeys.length > 0) && selectedKeys[0].split("-")[1];
        if(deptId){
            loadOrgMember(deptId,"",1);
        }
    }

    render() {
        const { deptTree, expandedKeys,selectedKeys } = this.props;
        return (
            <div className='core-wrap'>
                <SearchBox />
                <div className="call-part">
                    <Tree
                        selectedKeys={selectedKeys}
                        checkable={false}
                        onExpand={this.expandNode}
                        loadData={this.onLoadData}
                        onSelect={(selectedKeys,value) => {this.selectTreeNode(selectedKeys,value)}}
                        expandedKeys={expandedKeys}
                        switcherIcon={<Icon type="caret-down" theme="filled" style={{ fontSize: '18px', color: '#999' }} />}
                        showLine={true}
                    >
                        {this.renderTreeNodes(deptTree)}
                    </Tree>
                </div>
            </div>
        );
    }
}

export default CoreList;