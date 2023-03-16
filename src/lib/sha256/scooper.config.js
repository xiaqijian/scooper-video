/*
 * @File:
 * @Author: liulian
 * @Date: 2020-09-03 14:40:59
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-10 17:12:31
 */
var define = window.define;
/**
 * SCOOPER JavaScript config library
 * Load configure from server side
 */

(function (root, factory) {
  // if (typeof define === 'function' && define.amd) {
  //     // AMD
  //     define(['jquery'], factory);
  // } else
  if (typeof exports === "object") {
    // Node, CommonJS之类的
    module.exports = factory(require("jquery"));
  } else {
    // 浏览器全局变量(root 即 window)
    root.scooper = root.scooper || {};

    root.scooper.SCMap = factory(root.jQuery);
  }
})(this, function ($) {
  // define('scooper.config',
  // ['jquery'],
  // function($){
  "use strict";

  window.scooper = window.scooper || {};
  if (window.scooper.config) return;

  // 从服务端加载配置信息，并放置在 scooper.config.dataJson 中。
  // 默认加载 {context_path}/conf/data
  // 可在 scooper.config.initailize(fn,file) 的第二个参数中指定加载其它位置的配置。

  function Config() {
    var self = this;
    //
    var dataMap = {};
    //
    this.getJson = function (file) {
      file = file || self.dataFile;
      return dataMap[file];
    };
    //
    this.dataJson = {};
    //
    this.dataFile = window.scooper.configs.platurl
      ? window.scooper.configs.platurl + "/scooper-video/conf/data"
      : "../scooper-video/conf/data";
    this.callback = function (data) {};
    /**
     * 可根据不同 file 加载不同的参数信息
     * @param fn    加载完成回调函数
     * @param file  加载数据的url地址
     * @param param 附加参数
     */
    this.initialize = function (fn, file, param) {
      var url = self.dataFile;
      if (typeof file != "undefined" && file) {
        url = file;
      }
      var callback = self.callback;
      if (fn) {
        callback = fn;
      }
      param = param || null;
      $.getJSON(url, param, function (data) {
        //
        dataMap[url] = data;
        //
        if (url == self.dataFile) {
          self.dataJson = data;
        }
        //
        if (callback) {
          callback(data);
        }
      });
    };
    this.init = this.initialize;
    this.toString = function () {
      return JSON.stringify(self.dataJson);
    };
  }

  return (window.scooper.config = new Config());
});
