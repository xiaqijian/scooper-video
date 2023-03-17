/*
 * @File: 会议调度-左侧-搜索框
 * @Author: liulian
 * @Date: 2020-06-10 17:04:26
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-09 16:49:15
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Input, Select, message } from 'antd';
import { setMeetDetailList, setCurMeet } from '../../../../reducer/meet-handle-reduce'
import { debounce, isEmpty, uniqBy } from 'lodash';

const { Option, OptGroup } = Select;

@connect(
    state => state.meetHandle,
    { setMeetDetailList, setCurMeet }
)
class SearchBox extends PureComponent {
    state = {
        resultData: [],
        searchVal: '',
        memTotal: ''
    }
    /**
     * 搜索部门和人员（防抖）
     */
    fetchUser = debounce(searchVal => {
        if (!searchVal || !searchVal.trim()) return;
        let { meetDetailList } = this.props;
        let searchResultList = [];
        meetDetailList.map((item) => {
            if ((item.subject && item.subject.indexOf(searchVal) > -1) ||
                (item.id && item.id.toString().indexOf(searchVal) > -1 && item.id.toString().indexOf('none-') == -1)) {
                searchResultList.push(item);
            }
        })
        this.setState({
            resultData: searchResultList,
            searchVal
        })
    }, 800)

    /**
     * 选中某条部门或人员，
     */
    handleChange = async (value, record) => {
        let { meetDetailList } = this.props;
        this.setState({
            resultData: [],
            searchVal: undefined,
        });
        const curMeet = meetDetailList.find(meet => meet.id == record.key);
        this.props.setCurMeet(curMeet)
    }
    /**
     * 关闭/打开下拉框时的回调
     * @param open 标识下拉框是否打开
     */
    changeVisible = open => {
        if (!open) {
            // 关闭下拉框时，重置组件状态
            this.setState({
                resultData: [],
            });
        }
    }
    showMoreMember = () => {

    }
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
                {(skin == 'light') && <span style={{ color: '#0080FF' }}>{searchValue}</span>}
                {skin == 'dark' && <span style={{ color: '#FFA600' }}>{searchValue}</span>}
                {afterStr}
            </span>
        ) : <span id="name">{origValue}</span>;
        return realStr;
    }


    render() {
        const { resultData, searchVal, memTotal } = this.state;
        return (
            <Select
                showSearch
                className="search-user"
                dropdownClassName={`search-meet-dropdown ${window.top.style == 'iframe' ? 'dropdown-iframe-modal' : ''}`}
                placeholder="搜索会议名称"
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
                {!isEmpty(resultData) &&
                    <OptGroup key="会议">
                        {resultData.map(mem => (
                            <Option key={mem.id} >
                                <i className={`${mem.conferenceTimeType == 'EDIT_CONFERENCE' ? 'icon-prevMeet' : 'icon-meet'}`}></i>
                                <span className='meet-name over-ellipsis'>{this.setSearchValColor(mem.subject || mem.id, searchVal)}</span>
                            </Option>
                        ))}
                    </OptGroup>
                }
            </Select>
        )
    }
}

export default SearchBox;