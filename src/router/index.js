/*
 * @File:
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-09 14:57:06
 */

import React, { Component } from "react";
import { Route, withRouter } from "react-router-dom";
import { setConfigData } from "../reducer/loading-reducer";
import { ROUTER_CFG, commonData } from "../config/config";
import { getUrlRealParam } from "../util/method.js";
import Main from "../Main";
import Login from "../view/login/index";
import { apis } from "../util/apis";
import { connect } from "react-redux";
import qs from "qs";

const { LOGIN, MAIN_PAGE } = ROUTER_CFG;
let flag = 1;
@withRouter
@connect((state) => state.loading, { setConfigData })
class AppRouter extends Component {
  constructor(props) {
    super(props);
  }
  loadConfig = async () => {
    let data = await apis.disp.config();
    if (data) {
      this.props.setConfigData(data);
    }
    if (data.set["disp.set.header.title"]) {
      document.title = data.set["disp.set.header.title"];
    }
    if (getUrlRealParam("skin")) {
      window.scooper.configs.skin = getUrlRealParam("skin");
    } else if (commonData.getCommonData("skin")) {
      window.scooper.configs.skin = commonData.getCommonData("skin");
    } else if (data.set["disp.set.skin.default"]) {
      window.scooper.configs.skin = data.set["disp.set.skin.default"];
    } else {
      window.scooper.configs.skin = "light";
    }
  };
  componentWillUpdate(nextProps) {
    let url = window.location.href.split("#")[1];
    let fix = qs.stringify(commonData.getCommonData("urlParams"));

    let pathname = url.split("?")[0];
    if (pathname === "/login" || fix == "") return;

    if (url.indexOf("?") === -1) {
      url += `?${qs.stringify(commonData.getCommonData("urlParams"))}`;
      nextProps.history.push(url);
    }
  }
  componentDidMount() {
    if (this.props.location.pathname === "/") {
      this.props.history.push("/login");
    }
    try {
      setTimeout(() => {
        document.getElementsByTagName('iframe')[0].style.display = 'none'

      }, 1000);

    } catch (error) {

    }
    // this.loadConfig();
  }
  render() {
    return (
      <div className="page-content">
        <Route path={LOGIN} component={Login} />
        <Route path={MAIN_PAGE} component={Main} />
      </div>
    );
  }
}

export default AppRouter;
