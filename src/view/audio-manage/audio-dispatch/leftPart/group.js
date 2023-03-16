/*
 * @File: 
 * @Author: liulian
 * @Date: 2020-07-13 16:07:11
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-10 10:58:28
 */
import React, { Component } from "react";
import Backend from 'react-dnd-html5-backend'
import { useDrop, useDrag, DragSource, DropTarget, DragDropContext } from 'react-dnd'
import { connect } from 'react-redux';
import { setShowEdit, setTelStausList } from '../../../../reducer/audio-handle-reducer'

const sourceSpec = {
    beginDrag(props) {
        return {
            id: props.item.id,
            index: props.item.index
        }
    }
}

const targetSpec = {
    canDrop() {
        return true
    },

    // hover(props, monitor) {
    //     const { id: draggedId } = monitor.getItem()
    //     const { id: overId } = props

    //     if (draggedId !== overId) {
    //         console.log("kkkkkkkkkk")
    //         const { index:overIndex } = props.findCard(overId);
    //         props.moveCard(draggedId, overIndex)
    //     }
    // }, 
    drop(props, monitor) {
        const { id: draggedId } = monitor.getItem()
        const { id: overId } = props.item;
        if (draggedId && overId && draggedId !== overId) {
            const { index: overIndex } = props.findCard(overId);
            props.moveCard(draggedId, overIndex)
        }
    }
}

@DragSource('groupBox', sourceSpec, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}))
@DropTarget('groupBox', targetSpec, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
@connect(
    state => state.audioHandle,
    { setShowEdit, setTelStausList }
)
class Group extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    /**
     * 点击群组列表
     */
    listClick = (e,item) => {
        this.props.listClick(e,item)
    }
    /**
     * 删除快捷组
     */
    groupDelete = (e,item)=>{
        this.props.groupDelete(e,item);
    }
    componentDidMount() {
    }

    render() {
        let {isShowEdit,curSelectGroup,connectDragSource, connectDropTarget,item } = this.props;
        return connectDropTarget(
            (connectDragSource(
                <li key={item.id} className={`${(curSelectGroup && item.id == curSelectGroup.id ) ? 'onsel' : ''}`} onClick={(e) => { this.listClick(e, item) }}>
                    <div className='group-list' style={{height:'60px'}}>
                        <i className='icon-group'></i>
                        <span className='group-name over-ellipsis'>{item.groupName}</span>
                        <span className='group-num'>（{item.maxMemNum}人）</span>
                        {isShowEdit &&
                            <span className='del-wrap' onClick={(e) => { this.groupDelete(e, item) }}><i className="icon-delete"></i></span>
                        }
                    </div>
                </li>
            ))

        );
    }
}
export default Group;