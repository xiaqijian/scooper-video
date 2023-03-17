/*
 * @File: 语音调度-组呼通知Tab-语音文件
 * @Author: liulian
 * @Date: 2020-07-05 16:39:05
 * @version: V0.0.0.1
 * @LastEditTime: 2022-01-04 13:59:25
 */
import React, { Component } from "react";
import { uniqBy } from 'lodash';
import { Button, Input, Form, Row, Col, message, Upload, Select, notification, Popconfirm } from "antd";
import { setShowRecordInfo, setAudioList, setCurSelectAudio } from '../../../../../reducer/audio-handle-reducer';
import AddMember from "../../../../../component/add-member";
import { groupNotifyTitle, stsConst } from "../../../../../config/constants";
import { getToken } from "../../../../../config/constants";
// import AddAudio from './add-audio'
import { connect } from "react-redux";
import { apis } from "../../../../../util/apis";
import dispatchManager from "../../../../../util/dispatch-manager";
import timeUtil from "../../../../../util/time-util";
import { getTelStatus } from "../../../../../util/method";

const { Option } = Select;
const { Search } = Input;
const formIteLayout = {
    labelCol: {
        span: 3,
    },
    wrapperCol: {
        span: 21,
    },
}
@connect(
    state => state.audioHandle,
    { setShowRecordInfo, setAudioList, setCurSelectAudio }
)
class AudioFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loopList: [
                { id: 1, value: '1', text: '单次' },
                { id: 2, value: '3', text: '多次' },
                { id: 3, value: '0', text: '无限次' },
            ],
            // addAudioVisible: false,
            isDel: false,
            isCheck: false,
            recMems: [],
            modalVisible: false,  //人员选择器弹框
            audioName: "",
            title: "",
            recordTag: false,   //是否开始录制
            isStartRecord: true,  //是否开始录制 
            audioTime: ''
        }
        if (props.onRef) {//如果父组件传来该方法 则调用方法将子组件this指针传过去
            props.onRef(this)
        }
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
     * 循环次数改变
     */
    loopNumChange = (value) => {
        // console.log('changed', value);
    }

    // 录音上传所需参数
    getParam = file => {
        return {
            title: file.name,
        }
    }

    // 录音文件上传前
    beforeUpload = file => {
        const isWav = file.type === "audio/wav"
        if (!isWav) {
            message.error("只允许上传wav格式的文件");
        }
        const list = file.size / 1024 / 1024 < 10;
        if (!list) {
            message.error("文件必须小于10MB!");
        }
        return isWav && list;
    }
    // 
    fileOnchange = info => {
        let { audioList } = this.props;
        if (info.file.status === 'done') {

            if (info.file.response.code == 0) {
                message.success(`${info.file.name} 上传成功`);
                this.loadAudioList()
            } else {
                message.error(info.file.response.message);
            }
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`);
        }
    }
    /**
     * 加载录音文件
     */
    loadAudioList = async () => {
        let data = await apis.disp.listSerRecordNotify();

        data.list.forEach(element => {
            if (element.callLength) {
                element.callLength = timeUtil.calTimelength(element.callLength);
            } else {
                element.callLength = ""
            }
        });
        this.props.setAudioList(data.list);

    }
    /**
     * 确定录制
     */
    modalOk = () => {
        let { audioName, audioTime } = this.state;
        let { audioList } = this.props;
        if (!audioName) {
            message.error("请输入文件名")
            return;
        }
        let title;
        let find = false;
        let tel = dispatchManager.accountDetail.activeHandler
        title = audioName;
        audioList && audioList.map((item) => {
            if (item.recFile == audioName) {
                find = true;
                return false;
            }
        })
        if (find) {
            message.error("录音名称已存在，请重新设置！");
            title = "";
        } else {
            dispatchManager.dispatcher.calls.notifyRecordOP(tel, audioName, 'record');
            let time = 0;
            // let _this = this;
            window.timeIndex = setInterval(() => {
                if (getTelStatus(tel) == stsConst.CALLANSWER) {
                    const btn = (
                        <div className="recording">
                            <span>正在录制 {audioTime}</span>
                            <Button className="record-finish" onClick={this.recordEnd}>结束</Button>
                        </div>
                    )
                    time++;
                    audioTime = timeUtil.calTimelength(time)
                    notification.open({
                        message: title ? title : '新建录音文件',
                        description: '',
                        btn,
                        key: 'updateAudio',
                        duration: 0
                    })
                } else {
                    if (window.timeIndex && time != 0) {
                        this.recordEnd('nohungUp');
                        clearInterval(window.timeIndex);
                    }
                }

            }, 1000)

        }
    }
    /**
     * 录音文件名称改变
     */
    inputChange = (e) => {
        this.setState({
            audioName: e.target.value
        })
    }
    /**
     * 结束录制
     */
    recordEnd = (nohungup) => {
        console.log(nohungup)
        let { audioName, title } = this.state;
        let tel = dispatchManager.accountDetail.activeHandler;
        if (nohungup && nohungup == 'nohungUp') {

        } else {
            dispatchManager.dispatcher.calls.notifyRecordOP(tel, audioName, 'finish');
            // 结束录制后会变成保持状态，直接挂断
            if (getTelStatus(tel) == stsConst.CALLHOLD) {
                dispatchManager.dispatcher.calls.hungUp(tel);
            }

        }
        this.setState({
            audioTime: ''
        })
        clearInterval(window.timeIndex);
        this.loadAudioList();
        let btn = (
            <div className='restart'>
                <Button className="restart-record" onClick={this.reStart}>继续录制</Button>
                <Button className="play-record" onClick={this.playAudioRecord}>播放</Button>
            </div>
        )
        notification.open({
            message: audioName ? audioName : '新建录音文件',
            description: '',
            btn,
            key: 'updateAudio',
            duration: 0
        })
    }
    /**
     * 重新录制
     */
    reStart = () => {
        this.showAddAudio()
    }
    /**
     * 播放
     */
    playAudioRecord = () => {
        let { audioList } = this.props;
        let tel = dispatchManager.accountDetail.activeHandler;
        dispatchManager.dispatcher.calls.notifyRecordOP(tel, audioList[0].recFile, 'play', audioList[0].recFile);
    }
    /**
     * 显示新建录音弹框
     */
    showAddAudio = () => {
        let { title } = this.state;
        let btn;
        btn = (
            <div className="add-record-modal">
                <Input placeholder="请输入文件名" onChange={(e) => { this.inputChange(e) }}></Input>
                <Button className="add-record-btn" onClick={this.modalOk}>录制</Button>
            </div>
        )
        notification.open({
            message: title ? title : '新建录音文件',
            description: '',
            btn,
            key: 'updateAudio',
            duration: 0
        })
    }


    /**
     * 删除录音
     */
    deleteAudio = async (item) => {
        // this.showConfirm(item);
        let param = { id: item.recId, fileType: 20 };
        let data = await apis.record.deleteFile(param);
        if (data.code == 0) {
            message.success("删除成功");
            this.props.loadAudioList();
        }
    }

    /**
     * 编辑接收人
     */
    recMemEdit = (recMems) => {
        let { isCheck, isDel, modalVisible } = this.state
        if (isCheck == true) {
            this.setState({
                modalVisible: false
            })

        } else {
            this.setState({
                modalVisible: true
            })
        }
        this.setState({
            isDel: !isDel,
            isCheck: !isCheck,
        })
    }
    /**
     * 删除接收人
     */
    delRecMems = (item) => {
        let { recMems } = this.props;
        recMems.map((mem, i) => {
            if (mem.orgMemId == item.orgMemId) {
                recMems.splice(i, 1)
            }
        })
        this.props.setRecMems(recMems)
    }
    /**
     * 获取人员选择器 人员
     * @param memData 返回的人员数据
     */
    getMemData = (memData) => {
        let { recMems } = this.props;
        this.setState({
            modalVisible: false,
        })
        this.props.setRecMems(memData)
        // this.props.setRecMems(uniqBy(recMems.concat(memData), 'orgMemId'))
    };

    /**
     * 语音文件列表选择
     */
    listClick = (item) => {
        this.props.setCurSelectAudio(item);
    }

    /**
     * 播放通知音
     */
    playAudio = (item) => {
        let tel = dispatchManager.accountDetail.activeHandler
        dispatchManager.dispatcher.calls.notifyRecordOP(tel, item.recFile, 'play', item.recFile);
    }

    /**
        * 提交
        */
    handleSubmits = (e) => {
        let { curSelectAudio } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { recMems } = this.props;
                let telArr = [];
                recMems.forEach(element => {
                    if (element.memTel) {
                        telArr.push(element.memTel)
                    }
                });
                let type = 'notify';
                let times = values.loopNum;
                let notifyId = dispatchManager.accountDetail.operatorId + "_" + timeUtil.getDaeTimeStr();

                if (JSON.stringify(curSelectAudio) == '{}') {
                    message.error("语音文件不能为空");
                    return false;
                }
                if (!times) {
                    message.error("循环次数不能为空");
                    return false;
                }
                if (telArr.length == 0) {
                    message.error("接收人不能为空");
                    return false;
                }
                dispatchManager.dispatcher.calls.selectNotify(telArr, curSelectAudio.recFile, type, times, notifyId);
            }
        })
    }

    componentDidMount() {

    }
    /**
     * 通知音搜索
     */
    audioSearch = async (value) => {
        let data = await apis.disp.listSerRecordNotify({ searchKey: value });
        data.list.forEach(element => {
            if (element.callLength) {
                element.callLength = timeUtil.calTimelength(element.callLength);
            } else {
                element.callLength = ""
            }
        });
        this.props.setAudioList([...data.list]);
    }

    render() {
        let { loopList, isCheck, isDel, modalVisible, isStartRecord, recordTag, audioTime } = this.state;
        const { audioList, recMems, curSelectAudio, loopTime, addAudioVisible } = this.props
        const { getFieldDecorator } = this.props.form;
        const props = {
            name: 'file',
            action: '/scooper-record/data/notify/upload?token=' + getToken(),
            accept: ".wav",
            showUploadList: false,
            data: this.getParam,
            beforeUpload: this.beforeUpload,
            onChange: this.fileOnchange,
        };
        return (
            <div>
                <Form className='audio-form'>
                    <Row>
                        <Col span={16}>
                            <Form.Item  >
                                <Search
                                    placeholder="请输入名字或号码进行搜索"
                                    className="audio-search"
                                    onSearch={(value) => { this.audioSearch(value) }}
                                    prefix={<i className='icon-search'></i>}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4} style={{ textAlign: "center" }}>
                            <Upload {...props}>
                                <Button className='btn-upload' ghost><i className='icon-upload'></i>上传</Button>
                            </Upload>
                        </Col>
                        <Col span={4} style={{ textAlign: "center" }}>
                            <Button className='btn-record' ghost onClick={this.showAddAudio}><i className='icon-record'></i>录音</Button>
                        </Col>
                    </Row>
                    <Row>
                        {
                            audioList.length > 0 ?
                                <div className='audio-list'>
                                    {
                                        audioList && audioList.map((item) => {
                                            return (
                                                <li className={`list-item ${curSelectAudio.recId == item.recId ? 'list-item-onsel' : ''}`} key={item.recId} onClick={() => { this.listClick(item) }}>
                                                    <span className='item-title'>{item.notifyTab}</span>
                                                    <span className='item-length'>{item.callLength}</span>
                                                    <span className='icon-wrap'>
                                                        <i className='icon-play' onClick={() => { this.playAudio(item) }}></i>
                                                        <Popconfirm
                                                            title="确定删除此条录音文件吗?"
                                                            onConfirm={() => { this.deleteAudio(item) }}
                                                        >
                                                            <i className='icon-delete'></i>
                                                        </Popconfirm>

                                                    </span>
                                                </li>
                                            )
                                        })
                                    }
                                </div>
                                :
                                <div className='none-file'><span>当前无录音文件，请进行上传或录音</span> </div>
                        }
                    </Row>
                    <Row>
                        <Form.Item label="循环次数" {...formIteLayout} >
                            {getFieldDecorator('loopNum', { initialValue: loopTime || '3' })
                                (<Select placeholder="请选择循环次数" style={{ width: '180px', marginLeft: '15px' }}>
                                    {loopList.map(item => (
                                        <Option key={item.id} value={item.value}>{item.text}</Option>
                                    ))}
                                </Select>)
                            }
                        </Form.Item>
                    </Row>
                    <Row className='rec-mems'>
                        <span>接收人</span>
                        {recMems.length > 0 && <span>(共{recMems.length}人)</span>}

                        <span className={`notify-edit ${isCheck == true ? 'notify-edit-ok' : ''}`} onClick={() => { this.recMemEdit(recMems) }} >
                            <i className='icon-notify-edit'></i>{isCheck == true ? '完成' : '编辑'}
                        </span>
                    </Row>
                    <Row className='rec-wrap'>
                        {
                            recMems && recMems.map((item, index) => {
                                return (
                                    <div className="rec-mem-wrap" key={item.orgMemId}>
                                        <span className='rec-mem'>{item.name}</span>
                                        {isDel == true && <i className="icon-delte" onClick={() => this.delRecMems(item)}></i>}
                                    </div>
                                )
                            })
                        }
                    </Row>
                </Form>
                <AddMember modalVisible={modalVisible} getMemData={(mems) => this.getMemData(mems)} chosedMem={recMems} title={groupNotifyTitle} />
                {/* {addAudioVisible && <AddAudio visible={addAudioVisible}/>} */}
            </div>

        );
    }
}

export default Form.create()(AudioFile);