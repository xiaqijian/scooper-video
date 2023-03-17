/*
 * @File: 
 * @Author: liulian
 * @Date: 2020-07-13 16:07:11
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-22 17:02:01
 */
import React, { Component } from "react";
import Backend from 'react-dnd-html5-backend'
import { useDrop, useDrag, DragSource, DropTarget, DragDropContext } from 'react-dnd'
import { isEmpty } from 'lodash';
import { getTelStatus } from '../../../../util/method'
import { connect } from 'react-redux';
import { setShowEdit, setTelStausList } from '../../../../reducer/audio-handle-reducer'

const sourceSpec = {
    beginDrag(props) {
        return {
            id: props.item.orgMemId,
            index: props.item.index
        }
    },
    endDrag(props, monitor) {
        // console.log("endDrap:",props);
        // console.log(monitor)
        // const { id: draggedId } = monitor.getItem()
        // const { id: overId } = props

        // if (draggedId !== overId) {
        //     const { index:overIndex } = props.findCard(overId);
        //     props.moveCard(draggedId, overIndex)
        // }

        // const item = monitor.getItem()
        // const dropResult = monitor.getDropResult()

        // console.log(item);
        // console.log(dropResult)

        //  const { id: droppedId, index } = monitor.getItem()
        //  const didDrop = monitor.didDrop()

        //  if (!didDrop) {
        //     props.moveCard(droppedId, index)
        //  }
    },
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
        const { orgMemId: overId } = props
        if (draggedId && overId && draggedId !== overId) {
            const { index: overIndex } = props.findCard(overId);
            // console.log(props.findCard(overId))
            props.moveCard(draggedId, overIndex)
        }
    }
}

@DragSource('box', sourceSpec, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}))
@DropTarget('box', targetSpec, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
@connect(
    state => state.audioHandle,
    { setShowEdit, setTelStausList }
)
class Member extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount() {

    }

    // 点击人员
    memClick = (item) => {
        this.props.memClick(item)
    }
    /**
     * 人员详情
     */
    memDetail = (e, mem) => {
        this.props.memDetail(e, mem)
    }

    /**
     * 人员删除
     */
    memDelete = (e, mem) => {
        this.props.memDelete(e, mem)
    }


    render() {
        let { isShowEdit, connectDragSource, connectDropTarget, item, curSelectGroup, defaultKey, configData } = this.props;
        if (defaultKey == 1 && !sessionStorage.getItem('tempItem')) {
            return connectDropTarget(
                (connectDragSource(
                    <div className={`mem-item ${item.onSel == true ? 'mem-sel' : ''}`}
                        key={item.orgMemId}
                        onClick={() => this.memClick(item)}
                    >
                        <div id={`mem-${item.orgMemId}`}
                            className={`mem-item-in ${item.id == 'mem-add' ? 'none-add' : ''}${item.id.toString().indexOf('none-') > -1 ? 'mem-none' : ''}
                            ${(Object.keys(configData).length !== 0 && configData.set["disp.set.show.offline"] == 'true' && getTelStatus(item.memTel) == 'callst_offline') ? 'btn-offline' : ''}
                            ${getTelStatus(item.memTel) == 'callst_waitring' ? 'btn-waiting' : ''}${getTelStatus(item.memTel) == 'callst_ring' ? 'btn-ring' : ''}${getTelStatus(item.memTel) == 'callst_transfering' ? 'btn-transfering' : ''}${getTelStatus(item.memTel) == 'callst_transfer' ? 'btn-transfer' : ''}${getTelStatus(item.memTel) == 'callst_monitorring' ? 'btn-monitorRing' : ''}${getTelStatus(item.memTel) == 'callst_hold' ? 'btn-music' : ''}${getTelStatus(item.memTel) == 'callst_monitor' ? 'btn-monitor' : ''}${getTelStatus(item.memTel) == 'callst_breakin' ? 'btn-breakin' : ''}${getTelStatus(item.memTel) == 'callst_doubletalk' ? 'btn-doubletalk' : ''}${getTelStatus(item.memTel) == 'callst_monitoranswer' ? 'btn-monitoranswer' : ''}${getTelStatus(item.memTel) == 'callst_answer' ? 'btn-answer' : ''}${getTelStatus(item.memTel) == 'callst_meet' ? 'btn-meet' : ''} `}>
                            {
                                item.id.toString().indexOf('none-') == -1 && <div>
                                    {item.isCheck && <span className="icon-checked-wrap"><i className='icon-checked'></i></span>}
                                    <p className='mem-name' title={item.name}><span className='over-ellipsis'>{item.name || item.memTel}</span></p>
                                    <p className='dept-name' title={item.deptName}><span className='over-ellipsis'>{item.deptName}</span></p>
                                    <span className="icon-wrap" onClick={(e) => { this.memDetail(e, item) }}><i className='icon-detail'></i></span>
                                    {isShowEdit && curSelectGroup.id && curSelectGroup.id.toString().indexOf('temp-') == -1 && <span className='del-wrap' onClick={(e) => { this.memDelete(e, item) }}><i className="icon-delete"></i></span>}
                                    {(item.memType == 1 || item.memType == 2) && <span className='type-wrap'><i className='icon-videoType'></i></span>}
                                </div>
                            }
                        </div>
                    </div>
                ))
            );
        } else {
            return (
                <div className={`mem-item ${item.onSel == true ? 'mem-sel' : ''}`}
                    key={item.orgMemId}
                    onClick={() => this.memClick(item)}
                >
                    <div id={`mem-${item.orgMemId}`}
                        className={`mem-item-in ${item.id == 'mem-add' ? 'none-add' : ''} ${item.id.toString().indexOf('none-') > -1 ? 'mem-none' : ''}${getTelStatus(item.memTel) == 'callst_offline' ? 'btn-offline' : ''}${getTelStatus(item.memTel) == 'callst_waitring' ? 'btn-waiting' : ''}${getTelStatus(item.memTel) == 'callst_ring' ? 'btn-ring' : ''}${getTelStatus(item.memTel) == 'callst_transfering' ? 'btn-transfering' : ''}${getTelStatus(item.memTel) == 'callst_transfer' ? 'btn-transfer' : ''}${getTelStatus(item.memTel) == 'callst_monitorring' ? 'btn-monitorRing' : ''}${getTelStatus(item.memTel) == 'callst_hold' ? 'btn-music' : ''}${getTelStatus(item.memTel) == 'callst_monitor' ? 'btn-monitor' : ''}${getTelStatus(item.memTel) == 'callst_breakin' ? 'btn-breakin' : ''}${getTelStatus(item.memTel) == 'callst_doubletalk' ? 'btn-doubletalk' : ''}${getTelStatus(item.memTel) == 'callst_monitoranswer' ? 'btn-monitoranswer' : ''}${getTelStatus(item.memTel) == 'callst_answer' ? 'btn-answer' : ''}${getTelStatus(item.memTel) == 'callst_meet' ? 'btn-meet' : ''} `}>
                        {
                            item.id.toString().indexOf('none-') == -1 && <div>
                                {item.isCheck && <span className="icon-checked-wrap"><i className='icon-checked'></i></span>}
                                <p className='mem-name' title={item.name}><span className='over-ellipsis'>{item.name || item.memTel}</span></p>
                                <p className='dept-name' title={item.deptName}><span className='over-ellipsis'>{item.deptName}</span></p>
                                <span className="icon-wrap" onClick={(e) => { this.memDetail(e, item) }}><i className='icon-detail'></i></span>
                                {isShowEdit && curSelectGroup.id && curSelectGroup.id.toString().indexOf('temp-') == -1 && <span className='del-wrap' onClick={(e) => { this.memDelete(e, item) }}><i className="icon-delete"></i></span>}
                                {(item.memType == 1 || item.memType == 2) && <span className='type-wrap'><i className='icon-videoType'></i></span>}
                            </div>
                        }
                    </div>
                </div>
            )
        }

    }
}
export default Member;