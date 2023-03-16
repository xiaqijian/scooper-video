/*
 * @File: store配置
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2020-07-10 10:25:27
 */ 
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import reducers from "../reducer";

const reduxDevTools = window.devToolsExtension ? window.devToolsExtension() : f => f;
const store = createStore(reducers, compose(
    applyMiddleware(thunk),
    reduxDevTools
));

export default store;