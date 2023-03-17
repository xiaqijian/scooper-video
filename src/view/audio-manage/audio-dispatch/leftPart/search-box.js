/*
 * @File: 语音调度-左侧-搜索框
 * @Author: liulian
 * @Date: 2020-06-10 17:04:26
 * @version: V0.0.0.1
 * @LastEditTime: 2022-04-06 16:28:54
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { apis } from '../../../../util/apis';
import { setGroupList, setDefaultKey, setMemMapCache, setCurSelectGroup, setSearchResult, setExpandedKeys, setSelectedKeys, setMemList, setCurSelectCore } from '../../../../reducer/audio-handle-reducer'
import { changeLoading } from '../../../../reducer/loading-reducer'
import { Select, message } from 'antd';
import { debounce, isEmpty, uniqBy } from 'lodash';
import { loadOrgMember, loadGroupMember, getDeptName } from '../../../../util/method';

const { Option, OptGroup } = Select;

@connect(
    state => state.audioHandle,
    { setGroupList, setDefaultKey, setMemMapCache, setCurSelectGroup, setSearchResult, setExpandedKeys, setSelectedKeys, setMemList, setCurSelectCore }
)
@connect(
    state => state.loading,
    { changeLoading }
)
class SearchBox extends PureComponent {
    state = {
        // 搜索框用于输入的值
        searchVal: undefined,
        // 部门数据
        deptData: [],
        // 人员数据
        memData: [],
        // 群组数据
        qzData: [],
        // 部门数据当前页码
        deptPageNum: 1,
        // 人员数据当前页码
        memPageNum: 1,
        // 群组数据当前页码
        qzPageNum: 1,
        // 人员总数
        memTotal: 0,
        // 部门总数
        deptTotal: 0,
        // 群组总数
        qzTotal: 0,
        loading: false,

    }
    /**
     * 搜索部门和人员（防抖）
     */
    fetchUser = debounce(searchVal => {
        this.setState({ deptData: [], memData: [], qzData: [] });

        // 不输入字符就不做任何操作
        if (!searchVal || !searchVal.trim()) return;

        this.queryDeptData(searchVal);
        this.queryMemberData(searchVal);
        this.queryQzData(searchVal);
    }, 800)

    // 记录之前调用部门分页查询接口时使用的pageSize
    deptPageSize = 3
    async queryDeptData(searchVal, currentPage = 1, pageSize = 3, isExtend) {
        // 当点击更多部门时，pageSize变化，从第一页开始查
        if (this.deptPageSize !== pageSize) currentPage = 1;

        const queryDeptData = await apis.disp.queryOrgDept({
            currentPage, pageSize, searchKey: searchVal
        });

        const { deptData } = this.state;

        this.setState({
            deptData: isExtend ? uniqBy(deptData.concat(queryDeptData.list), 'id') : queryDeptData.list,   //去重
            deptPageNum: queryDeptData.pageNum,
            searchVal,
            deptTotal: queryDeptData.total
        });

        this.deptPageSize = pageSize;
    }

    // 记录之前调用人员分页查询接口时使用的pageSize
    memPageSize = 3
    async queryMemberData(searchVal, currentPage = 1, pageSize = 3, isExtend) {
        // 当点击更多人员时，pageSize变化，从第一页开始查
        if (this.memPageSize !== pageSize) currentPage = 1;

        const queryMemberData = await apis.core.queryOrgMember({
            currentPage, pageSize, keyword: searchVal
        })

        const { memData } = this.state;

        const newMemData = queryMemberData.list.map(item => ({
            alldeptName: getDeptName(item.deptName, item.dutyName),
            id: item.id,
            pid: item.deptId,
            name: item.name,
            isParent: false,
            dataType: 'orgMember',
            dutyName: item.dutyName,
            deptName: item.deptName,
            memTel: item.memTel,
            orgMemId: item.id
        }));

        this.setState({
            memData: isExtend ? uniqBy(memData.concat(newMemData), 'id') : newMemData,
            memPageNum: queryMemberData.pageNum,
            searchVal,
            memTotal: queryMemberData.total
        });

        this.memPageSize = pageSize;
    }

    // 记录之前调用快捷组分页查询接口时使用的pageSize
    qzPageSize = 3
    async queryQzData(searchVal, currentPage = 1, pageSize = 3, isExtend) {
        // 当点击更多群组时，pageSize变化，从第一页开始查
        if (this.qzPageSize !== pageSize) currentPage = 1;

        const queryDispData = await apis.disp.queryDispGroup({
            currentPage, pageSize, searchKey: searchVal
        })

        const { qzData } = this.state;

        this.setState({
            qzData: isExtend ? uniqBy(qzData.concat(queryDispData.list), 'id') : queryDispData.list,
            qzPageNum: queryDispData.pageNum,
            searchVal,
            qzTotal: queryDispData.total
        });

        this.qzPageSize = pageSize;
    }
    /**
     * 选中某条部门或人员，
     */
    handleChange = async (value, record) => {
        this.props.changeLoading(true);
        this.setState({
            deptData: [],
            memData: [],
            searchVal: undefined,
        });
        this.props.setSearchResult(record.props);
        // 是否有record.props.pid可用来判断点击的是否是成员,, value : orgMemId
        if (record.props.pid) {
            // 点击的是人员
            this.props.setDefaultKey("2");
            this.updateExpands(record.props.pid, record.props.value, 'true');

        } else {
            let value = record.props.value.split("-")[0];
            if (value == 'qz') {
                // 群组
                this.props.setDefaultKey("1");
                this.updateGroup(record.props.value.split("-")[1]);
            } else if (value == 'dept') {
                // 部门
                this.props.setDefaultKey("2");
                this.updateExpands(record.props.value.split("-")[1])
            } else {
                message.error("数据有误！");
                this.props.changeLoading(false);
            }
        }
    }
    /**
     * 选中当前搜索的群组
     */
    async updateGroup(value) {
        let { groupList } = this.props;
        let _this = this;
        // 选中当前组
        if (groupList.length > 0) {
            groupList.map((item) => {
                let arr = groupList.filter(items => items.id == value);
                arr.length > 0 && _this.props.setCurSelectGroup(arr[0]);
            })
        }
        loadGroupMember(value, 1);
        this.props.changeLoading(false);
    }
    /**
     * 更新展开通讯录树节点
     */
    async updateExpands(deptId, orgMemId, isMember) {
        let { expandedKeys } = this.props;
        let datas = await apis.core.findDepartmentPath({ id: deptId });
        if (datas.code == 0) {
            let data = datas.data
            data && data.map((item) => {
                let deptIds = "dept-" + item.id;
                let arr = expandedKeys.filter(items => items == deptIds);
                if (arr.length == 0) {
                    deptIds && expandedKeys.push(deptIds);
                }
            })
            this.props.setExpandedKeys([...expandedKeys]);
            let selectKey = ["dept-" + deptId]
            this.props.setSelectedKeys(selectKey);  //设置选中通讯录树节点
            if (isMember) {
                loadOrgMember(deptId, orgMemId, 1);  //加载该部门的人员数据
            } else {
                loadOrgMember(deptId, "", 1);
                this.props.changeLoading(false);
            }
            let lastData = data[data.length - 1];  //最后一层的数据信息
            let curCore = {
                checked: false,
                data: lastData.orgCode,
                dataType: 'orgDept',
                deptType: lastData.deptType,
                isParent: true,
                id: lastData.id,
                name: lastData.deptName,
                pid: lastData.parentId,

            }
            this.props.setCurSelectCore(curCore);
        } else {
            message.error(datas.message);
            this.props.changeLoading(false);
        }

    }

    /**
     * 跳转至选中的节点
     */
    updateScroll = (deptId, orgMemId, coreMemAll) => {
        let ids = "mem-" + orgMemId
        let a = document.getElementById(ids);
        setTimeout(() => {
            if (a && orgMemId) {
                a.scrollIntoView(false);
                this.props.changeLoading(false);
            } else {
                if (coreMemAll.hasNextPage) {
                    loadOrgMember(deptId, orgMemId, coreMemAll.pageNum + 1);
                }
            }
        }, 100)
    }
    updateView = (coreMemAll) => {
        let { searchResult } = this.props;
        setTimeout(() => {
            if (JSON.stringify(coreMemAll) != '{}' && searchResult) {
                this.updateScroll(searchResult.pid, searchResult.value, coreMemAll);
            }
        }, 100)
    }
    /**
     * 显示更多成员
     */
    showMoreMember = e => {
        e.stopPropagation();
        const { searchVal, memPageNum } = this.state;
        // 由于后台分页实现查询时pageSize必须固定，所以改变分页页码时从第一页重新查
        // 查出来的数据进行去重
        this.queryMemberData(searchVal, memPageNum + 1, 10, true);
    }
    /**
     * 显示更多部门
     */
    showMoreDept = e => {
        e.stopPropagation();
        const { searchVal, deptPageNum } = this.state;
        this.queryDeptData(searchVal, deptPageNum + 1, 10, true);
    }
    /**
     * 显示更多群组
     */
    showMoreqz = e => {
        e.stopPropagation();
        const { searchVal, qzPageNum } = this.state;
        this.queryQzData(searchVal, qzPageNum + 1, 10, true)
    }
    /**
     * 关闭/打开下拉框时的回调
     * @param open 标识下拉框是否打开
     */
    changeVisible = open => {
        if (!open) {
            // 关闭下拉框时，重置组件状态
            this.setState({
                searchVal: undefined,
                deptData: [],
                memData: [],
                qzData: [],
                deptPageNum: 1,
                memPageNum: 1,
                qzPageNum: 1,
                memTotal: 0,
                deptTotal: 0,
                qzTotal: 0,
            });

            this.memPageSize = 3;
            this.deptPageSize = 3;
            this.qzPageSize = 3;
        }
    }

    setSearchValColor(origValue, searchValue, nember) {
        if (origValue == null) {
            origValue = ''
        }
        // {origValue.length > nember ? `${origValue.substring(0, nember)}...` : origValue}
        const index = (origValue += "").indexOf(searchValue);
        let skin = window.scooper.configs.skin;
        const beforeStr = origValue.substr(0, index);
        const afterStr = origValue.substr(index + searchValue.length);
        const realStr = searchValue && index > -1 ? (
            <span id="name">
                {beforeStr}
                {skin == 'science' && <span style={{ color: '#fff' }}>{searchValue}</span>}
                {(skin == 'light') && <span style={{ color: '#0080FF' }}>{searchValue}</span>}
                {skin == 'dark' && <span style={{ color: '#FFA600' }}>{searchValue}</span>}
                {afterStr}
            </span>
        ) : <span id="name">{origValue}</span>;
        return realStr;
    }
    componentWillReceiveProps(nextProps) {//componentWillReceiveProps方法中第一个参数代表即将传入的新的Props
        if (this.props.coreMemAll !== nextProps.coreMemAll) {
            this.updateView(nextProps.coreMemAll)
        }
    }

    render() {
        const { memData, deptData, qzData, searchVal, memTotal, deptTotal, qzTotal } = this.state;
        return (
            <Select
                showSearch
                className="search-user"
                dropdownClassName={`search-user-dropdown ${window.top.style == 'iframe' ? 'dropdown-iframe-modal' : ''}`}
                placeholder="搜索联系人/群组/部门"
                notFoundContent="无搜索结果"
                filterOption={false}
                onSearch={this.fetchUser}
                onSelect={this.handleChange}
                style={{ width: '97%' }}
                value={undefined}
                suffixIcon={<span />}
                onMouseDown={e => e.preventDefault()}
                allowClear
                onDropdownVisibleChange={this.changeVisible}
                clearIcon={<i className="icon-delete" />}
            >
                {!isEmpty(memData) &&
                    <OptGroup
                        label={<span className="mem-group"><i className="icon-mem"></i>联系人</span>}
                        key="mem"
                    >
                        {
                            memData.map(mem => (
                                <Option key={mem.id} pid={mem.pid} value={mem.orgMemId}>
                                    <p className='mem-name'>{this.setSearchValColor(mem.name, searchVal, 15)}</p>
                                    <span className='duty-name'>{mem.alldeptName}</span>
                                </Option>
                            ))
                        }
                    </OptGroup>
                }
                {
                    // 没有查到数据或已展示了全部数据时隐藏“查看更多”
                    !isEmpty(memData) && memTotal !== memData.length &&
                    <Option key="more-mem" style={{ paddingLeft: '1.2rem' }} >
                        <span className='more-mem' onClick={this.showMoreMember}>查看更多相关联系人</span>
                    </Option>
                }

                {!isEmpty(qzData) &&
                    <OptGroup
                        label={<span className="qz-group"><i className="icon-qz"></i>群组</span>}
                        key="qz"
                    >
                        {
                            qzData.map(qz => (
                                <Option key={"qz-" + qz.id} value={"qz-" + qz.id}>
                                    <i className='icon-group-search'></i>
                                    <p className={`qz-name ${qz.groupMems.length > 0 ? 'has-gray-qz' : ''}`}>{this.setSearchValColor(qz.groupName, searchVal, 15)}</p>
                                    <div className={`${qz.groupMems.length > 0 ? 'has-gray' : ''}`}>
                                        {qz.groupMems.length > 0 && <span>包含：</span>}
                                        {(qz.groupMems.length > 0) &&
                                            qz.groupMems.map((item) => {
                                                return (
                                                    <span key={"qzMem-" + item.id} className='qz-duty-name'>{this.setSearchValColor(item.orgMemName, searchVal, 5)} </span>
                                                )
                                            })
                                        }
                                    </div>
                                </Option>
                            ))
                        }
                    </OptGroup>
                }
                {
                    // 没有查到数据或已展示了全部数据时隐藏“查看更多”
                    !isEmpty(qzData) && qzTotal !== qzData.length &&
                    <Option key="more-qz" style={{ paddingLeft: '1.2rem' }}>
                        <span className='more-qz' onClick={this.showMoreqz}>查看更多相关群组</span>
                    </Option>
                }

                {!isEmpty(deptData) &&
                    <OptGroup
                        label={<span className="dept-group"><i className="icon-dept"></i>部门</span>}
                        key="dept"
                    >
                        {
                            deptData.map(dept => (
                                <Option key={"dept-" + dept.id} value={"dept-" + dept.id}>
                                    <p className={`dept-name ${dept.deptMems.length > 0 ? 'has-gray-dept' : ''}`}>{this.setSearchValColor(dept.deptName, searchVal, 15)}</p>
                                    <div className={`${dept.deptMems.length > 0 ? 'has-gray' : ''}`}>
                                        {dept.deptMems.length > 0 && <span>包含：</span>}
                                        {dept.deptMems.length > 0 &&
                                            dept.deptMems.map((item) => {
                                                return (
                                                    <span key={"deptMem-" + item.id} className='dept-duty-name'>{this.setSearchValColor(item.name, searchVal, 5)} </span>
                                                )
                                            })

                                        }
                                    </div>
                                </Option>
                            ))
                        }
                    </OptGroup>
                }
                {
                    !isEmpty(deptData) && deptTotal !== deptData.length &&
                    <Option key="more-dept" style={{ paddingLeft: '1.2rem' }}>
                        <span className='more-dept' onClick={this.showMoreDept}>查看更多相关部门</span>
                    </Option>
                }
            </Select>
        )
    }
}

export default SearchBox;