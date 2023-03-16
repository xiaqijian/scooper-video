/*
 * @File: reducer集合
 * @Author: liulian
 * @Date: 2020/06/08 16:50:06 
 * @Version:0.0.0.1
 */

import {combineReducers} from 'redux';

import {authReducer as auth} from './auth-reducer';
import {loadingReducer as loading} from './loading-reducer';
import {audioHandleReducer as audioHandle} from './audio-handle-reducer'
import {callInHandleReducer as callInHandle} from './callIn-handle-reduce'
import {callRecordHandleReducer as callRecordHandle} from './callRecord-handle-reduce'
import {meetHandleReducer as meetHandle} from './meet-handle-reduce'

export default combineReducers({auth, loading,audioHandle,callInHandle,callRecordHandle,meetHandle})

