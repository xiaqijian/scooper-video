/*
 * @File: 
 * @Author: liulian
 * @Date: 2020-07-29 17:12:28
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-17 11:59:39
 */
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend'
import {getTelStatus} from './util/method'
import moment from 'moment';
import 'moment/locale/zh-cn';
import store from "./store";
import AppRouter from './router/index';

import './less/normalize.less';
import './less/main.less';

import './less/light/index.less'  //白色
import './less/science/index.less'  //科技风
import './less/dark/index.less'  //黑色

import * as serviceWorker from './serviceWorker';
import { message } from 'antd';
moment.locale('zh-cn');

// window.onbeforeunload = function(e){
//     let tel = sessionStorage.getItem('dispAccountTel')
//     alert("jjjjjj");
//     return "fff";
//     // if (tel && getTelStatus(tel) == 'callst_doubletalk') {
//     //     // message.error("当前正在通话中，离开中断通话，确定离开吗？")
//     //     // const dialogText = "当前正在通话中，离开中断通话，确定离开吗？";
//     //     // e = e || window.event;
//     //     // if(e){
//     //     //     e.returnValue = dialogText;
//     //     // }
       
//     //     //  return "当前正在通话中，离开中断通话，确定离开吗？";
//     // }
// }


ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
            <DndProvider backend={Backend}>
                <AppRouter />
            </DndProvider>
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below.
// Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();


