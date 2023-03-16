/*
 * @File: 语音调度-左侧群组
 * @Author: liulian
 * @Date: 2020-06-10 15:46:10
 * @version: V0.0.0.1
 * @LastEditTime: 2021-05-19 15:22:06
 */
import React, { Component } from "react";
import { apis } from '../../../../util/apis';
import { connect } from 'react-redux';
import { setGroupList, setShowEdit ,setMemList,setCurSelectGroup,setIsCheckAll} from '../../../../reducer/audio-handle-reducer'
import {setCurMemList, fillMem,loadGroupMember} from '../../../../util/method'
import SearchBox from './search-box';
import Group from './group'
import AddGroup from './add-group';
import { Button,message } from "antd";

@connect(
    state => state.audioHandle,
    { setGroupList, setShowEdit,setMemList,setCurSelectGroup,setIsCheckAll }
)
class GroupList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addGroupModalVisible: false
        }
        this.moveCard = this.moveCard.bind(this)
        this.findCard = this.findCard.bind(this)
    }
    findCard(id) {
        let { groupList } = this.props;
        const group = groupList.find(group => group.id === id)
        return {
            group,
            index: group.sortIndex
        }
    }
    async moveCard(id, atIndex) {
        // console.log("atIndex:", atIndex);   //要放的 sortIndex
        // console.log("index:", index);       //原来的 sortIndex
        // console.log(id);   //组id
        let params = {
            groupId:id,
            newIndex:atIndex
        }
        let data = await apis.disp.dispResetSort(params);
        if(data.code == 0){
            message.success("移动成功");
            this.loadGroupList();
        }
    }

    /**
     * 加载快捷组数据
     */
    loadGroupList = async () => {
        let data = await apis.dispatch.listDispGroup();
        this.props.setGroupList(data);
        if(sessionStorage.getItem('tempItem')){
            // 存在临时组
            this.props.setCurSelectGroup(JSON.parse(sessionStorage.getItem('tempItem')));
            loadGroupMember('','',"temp");
        }else{
            if(data.length > 0 ){
                this.props.setCurSelectGroup(data[0])
            }else{
                this.props.setMemList([]);
                fillMem();
            }
            this.loadFirstGroupMember('first',data);
        }
    }

    /**
     * 删除快捷组
     */
    groupDelete = async (e, item) => {
        e.stopPropagation();
        let params = {ids:item.id};
        let data = await apis.dispatch.deleteDispGroup(params);
        if(data.obj == 0){
            message.success("删除成功");
            this.loadGroupList();
        }
    }
    /**
     * 新增群组
     */
    addGroup = () => {
        this.setState({
            addGroupModalVisible: true
        })
    }
    /**
     * 新增群组确定
     */
    modalOk = () => {
        this.setState({
            addGroupModalVisible: false
        })
    }
    /**
     * 新增群组取消
     */
    handleCancel = () => {
        this.setState({
            addGroupModalVisible: false
        })
    }
    /**
    * 隐藏弹框
    */
    hidePop = (tag) => {
        this.setState({
            [tag]: false
        })
    }

    /**
     * 加载群组成员
     */
    loadFirstGroupMember = async (first,datas) => {
        if(first && datas.length > 0 ){
            loadGroupMember(datas[0].id,1)
        }
    }

    /**
     * 点击群组列表
     */
    listClick = async (e,item) => {
        e.preventDefault();
        e.stopPropagation();
        if(item.id.toString().indexOf('temp') >= 0){
            // 点击的是临时组
            this.props.setCurSelectGroup(item);
            this.props.setIsCheckAll(false);
            if(this.props.isShowCheck){
                loadGroupMember('','','temp','showCheck')
            }else{
                loadGroupMember('','',"temp");
            }
            fillMem();
        }else{
            this.props.setCurSelectGroup(item);
            this.props.setIsCheckAll(false)
            loadGroupMember(item.id,1);
        }
    }

    componentDidMount() {
        this.loadGroupList();
    }

    componentWillReceiveProps(nextProps) {//componentWillReceiveProps方法中第一个参数代表即将传入的新的Props
        if (this.props.memMapCache !== nextProps.memMapCache) {
            setCurMemList(nextProps.memMapCache,'deptName');
        }
    }

    render() {
        let { groupList, isShowEdit,curSelectGroup,makeTemp } = this.props;
        let { addGroupModalVisible } = this.state; 
        let tempItem ;
        if(sessionStorage.getItem('tempItem') && makeTemp){
            tempItem = JSON.parse(sessionStorage.getItem('tempItem'))
        }
        return (
            <div className='group-wrap'>
                <SearchBox />
                <ul>
                    {tempItem && 
                        <li key={tempItem.id}
                            onClick={(e)=>{this.listClick(e,tempItem)}} 
                            className={`${(JSON.stringify(curSelectGroup) != "{}") && curSelectGroup.id.toString().indexOf("temp") >= 0 ? 'onsel' : ''}`} 
                            >
                            <div className='group-list' style={{height:'60px'}}>
                                <i className='icon-temp'></i>
                                <span className='group-name over-ellipsis'>{tempItem.groupName}</span>
                                <span className='group-num'>（{tempItem.maxMemNum}人）</span>
                                {/* {isShowEdit &&
                                    <span className='del-wrap' onClick={(e) => { this.groupDelete(e, tempItem) }}><i className="icon-delete"></i></span>
                                } */}
                            </div>
                        </li>
                    }
                    {groupList && groupList.map((item, index) => {
                        return (
                            <Group  
                            key={'group-' + index}
                            findCard={this.findCard}
                            moveCard={this.moveCard} 
                            item={item} 
                            listClick={this.listClick} 
                            groupDelete={this.groupDelete} />
                        )
                    })}
                </ul>
                {isShowEdit &&
                    <Button className="btn-addGroup" ghost onClick={() => { this.addGroup() }}><i className='icon-addGroup'></i>增加群组</Button>
                }
                {
                    addGroupModalVisible && <AddGroup visible={addGroupModalVisible} hidePop={this.hidePop} loadGroupList={this.loadGroupList} />
                }
            </div>
        );
    }
}

export default GroupList;