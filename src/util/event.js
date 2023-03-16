/*
 * @File: 
 * @Author: liulian
 * @Date: 2020-07-31 09:59:14
 * @version: V0.0.0.1
 * @LastEditTime: 2021-02-22 16:58:52
 */
import { devMode } from "../config/constants";

 


/**
 * 事件基类：提供事件注册及派发
 */
export default class EventDispatcher {
    eventMap = {};

    register(event, handler) {
        if (!this.eventMap[event]) {
            this.eventMap[event] = [];
        }
        this.eventMap[event].push(handler);
        // this.eventMap[event] = this.eventMap[event].slice(0, 5);
    }

    unregister(event, handler) {
        let handlers = this.eventMap[event];
        if (!handlers) {
            return;
        }

        let index = handlers.indexOf(handler);
        if (index === -1) {     // -1 is meaningful as index.
            return;
        }
        handlers.splice(index, 1);
    }

    fire(event, data) {
        let handlers = this.eventMap[event];
       
            devMode && console.log(`%c网页调度event: ${event} | handlers: ${(handlers && handlers.length) || 0}`, "color: #888888; font-style: italic", data);
   

        if (!handlers) {
            return;
        }

        handlers.forEach(handler => {
            try {
                handler.call(this, data);
            } catch (error) {
                console.error(error);
            }
        });

       
    }
}
