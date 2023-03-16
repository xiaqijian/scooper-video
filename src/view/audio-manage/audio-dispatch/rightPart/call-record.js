/*
 * @File: 语音调度-右侧通话记录
 * @Author: liulian
 * @Date: 2020-06-10 10:06:03
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-12 16:45:56
 */
import React, { Component } from "react";
import { Button, Badge, Input, DatePicker, message, Form } from "antd";
import { connect } from 'react-redux';
import { setShowContent, setCallInMissCount } from '../../../../reducer/callRecord-handle-reduce';
import RecordList from './record-list';
import MissList from './miss-list'
import BlackList from './black-list';
import MoreModal from './moreRecord/more-modal'
import { loadCallRecord, loadCallInMiss } from "../../../../util/method";
import { apis } from "../../../../util/apis";

const { Search } = Input;
const dateFormat = 'YYYY/MM/DD';
const FormItem = Form.Item;
@connect(
    state => state.callRecordHandle,
    { setShowContent, setCallInMissCount }
)
class CallRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recordType: 'all',    // 记录类型 all/miss
            moreModalVisible: false,
            isShowDate: false,  //是否显示时间选择器
            searchVal: '',    //搜索关键字
            timeMin: '', //起始时间
            timeMax: '', //终止时间
            searchParam: {},  //搜索参数
            canEditDate: 1, //时间选择器是否可以编辑 1可以   2不可以
        }
    }
    /**
     * 所有通话记录
     */
    getAllRecord = () => {
        this.setState({
            recordType: 'all'
        })
        let params = {
            pageNum: 1,
            pageSize: 10,
        }
        loadCallRecord(params)
    }
    /**
     * 呼入未接记录
     */
    getMissRecord = () => {
        let params = {
            pageNum: 1,
            pageSize: 10
        }
        loadCallInMiss(params);
        this.setState({
            recordType: 'miss'
        })

    }
    /**
     * 打开黑名单管理
     */
    openBlackList = () => {
        this.props.setShowContent('blackList')
    }
    /**
     * 打开更多记录弹框
     */
    openMoreModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            moreModalVisible: true
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
     * 搜索框获取焦点
     */
    searchFocus = () => {
        let { isShowDate } = this.state;
        this.setState({
            isShowDate: true,
        })
    }

    onChange = (e) => {
        if (e.target) {
            this.setState({
                searchVal: e.target.value
            })
        } else {
            this.setState({
                searchVal: ''
            })
        }
        if (e.target.value.toString().length >= 1) {
            // 搜索框必须输入内容才允许搜索
            this.setState({
                canEditDate: 2
            })
        } else {
            this.props.form.resetFields();
            this.setState({
                canEditDate: 1,
                timeMax:'',
                timeMin:''
            })
        }
    }
    pressEnter = (e) => {
        this.onSearch(e);
    }
    // 起始时间
    setTimeMin = (value) => {
        let { timeMax } = this.state;
        if (value != '' && value != null) {
            this.setState({
                timeMin: value.format('YYYY-MM-DD') + ' 00:00:00'
            })
            if (timeMax && timeMax >= value.format('YYYY-MM-DD')) {
                this.onSearch()
            }
        } else {
            this.setState({
                timeMin: ''
            })
        }
    }
    // 终止时间
    setTimeMax = (value) => {
        let { timeMin } = this.state;
        if (value != '' && value != null) {
            this.setState({
                timeMax: value.format('YYYY-MM-DD') + ' 23:59:59'
            })
            if (timeMin && value.format('YYYY-MM-DD HH:mm:ss') >= timeMin) {
                this.onSearchByDate(value.format('YYYY-MM-DD') + ' 23:59:59')
            } else {
                message.error("时间段选择错误！")
            }
        } else {
            this.setState({
                timeMax: ''
            })
        }
    }
    onSearchByDate = (paramDate) => {
        let { searchVal, timeMax, timeMin, recordType } = this.state;
        let params = {
            searchKey: searchVal,
            timeMin,
            timeMax: paramDate || timeMax,
            pageNum: 1,
            pageSize: 10
        }
        this.setState({
            searchParam: params
        })
        if (recordType == 'all') {
            loadCallRecord(params);
        } else {
            loadCallInMiss(params);
        }
        if (searchVal == '' && timeMax == '' && timeMin == '') {
            this.setState({
                isShowDate: false
            })
        }
    }
    onSearch = (e,clear) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let { searchVal, timeMax, timeMin, recordType } = this.state;
        let params = {
            searchKey: searchVal,
            timeMin,
            timeMax: timeMax,
            pageNum: 1,
            pageSize: 10
        }
        if(clear){
            params.searchKey='';
            params.timeMax = '';
            params.timeMin = ''
        }
        this.setState({
            searchParam: params
        })
        if (recordType == 'all') {
            loadCallRecord(params);
        } else {
            loadCallInMiss(params);
        }
        if (searchVal == '' && timeMax == '' && timeMin == '') {
            this.setState({
                isShowDate: false
            })
        }
    }

    loadCount = async () => {
        let data = await apis.disp.countCallInMiss();
        if (data) {
            this.props.setCallInMissCount(data)
        }
    }
    componentWillMount() {
        this.loadCount();
    }

    render() {
        let { recordType, moreModalVisible, isShowDate, searchParam, canEditDate,} = this.state;
        let { showContent, callInMissCount } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className='right-second'>
                {showContent == 'callRecord' ?
                    <div className='call-record-wrap'>
                        <div className="call-header">
                            <i className="icon-callRecord"></i>
                            <span className="title">通话记录</span>
                            <Button className={`all-record ${recordType == 'all' ? 'onsel' : ''}`} onClick={() => { this.getAllRecord() }}> 全部</Button>
                            <Button className={`miss-record ${recordType == 'miss' ? 'onsel' : ''}`} onClick={() => { this.getMissRecord() }}><Badge count={callInMissCount} offset={[8, -13]} /> 未接</Button>
                            <span className="btn-more" onClick={(e) => this.openMoreModal(e)}>更多<i className="icon-more"></i></span>
                        </div>

                        <div className="search-wrap">
                            <Search
                                placeholder="搜索号码/成员名称"
                                prefix={<i className="icon-record-search"></i>}
                                onFocus={this.searchFocus}
                                onSearch={value => this.onSearch(value)}
                                onChange={this.onChange}
                                onPressEnter={this.pressEnter}
                                className={`record-search ${isShowDate == true ? 'record-show' : ''}`}
                                allowClear
                            />
                            {isShowDate && <Button className='record-search-btn' onClick={this.onSearch}></Button>}

                            <Button className="black-menu" title="黑名单管理" onClick={() => { this.openBlackList() }}></Button>
                            {isShowDate &&
                                <div className="date-search">
                                    <Form layout='inline'>
                                        <FormItem>
                                            {getFieldDecorator('timeMin')(
                                                <DatePicker format={dateFormat} onChange={this.setTimeMin} disabled={canEditDate == 1 ? true : false} />
                                            )}
                                        </FormItem>
                                        <FormItem>
                                            <span className="divider-line">-</span>
                                        </FormItem>
                                        <FormItem>
                                            {getFieldDecorator('timeMax')(
                                                <DatePicker format={dateFormat} onChange={this.setTimeMax} disabled={canEditDate == 1 ? true : false} />
                                            )}
                                        </FormItem>
                                    </Form>
                                </div>
                            }
                        </div>
                        {recordType == 'all' && <RecordList isShowDate={isShowDate} searchParam={searchParam} />}
                        {recordType == 'miss' && <MissList isShowDate={isShowDate} searchParam={searchParam} />}

                    </div> :
                    <BlackList />
                }
                {moreModalVisible && <MoreModal visible={moreModalVisible} hidePop={this.hidePop} />}
            </div>
        );
    }
}

export default Form.create()(CallRecord);