/*
 * @File: 页面路由定义
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-08 19:35:37
 */
import React, { PureComponent, Component } from "react";
import { Route, Switch } from "react-router-dom";
import Loadable from "react-loadable";
import { Spin } from "antd";
import { setConfigData, setNavArr } from "../reducer/loading-reducer";
import { connect } from "react-redux";
import UnfiedManager from "../view/unified-manager";

function Loading(error) {
  if (error) {
    return null;
  }
  return <Spin size="large" className="global-spin1" />;
}
const FrontComponent = Loadable({
  loader: () => import("../view/front-manage"),
  loading: Loading,
});
const AudioDispatch = Loadable({
  loader: () => import("../view/audio-manage/audio-dispatch/index"),
  loading: Loading,
});

@connect((state) => state.loading, { setConfigData, setNavArr })
class PageRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { url, showHeader, configData, navArr } = this.props;
    return (
      <Switch>
        <Route path={`${url}/front`} component={FrontComponent} />

        <Route path={`${url}/dispatch/audio`} component={AudioDispatch} />
        <Route path={`${url}/dispatch`} component={AudioDispatch} />
      </Switch>
    );
  }
}

export default PageRoute;
