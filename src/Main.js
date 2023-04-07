/*
 * @File: 主入口文件
 * @Author: liulian
 * @Date: 2019-11-20 19:11:49
 * @version: V0.0.0.1
 * @LastEditTime: 2023-03-13 15:20:18
 */
import React, { PureComponent } from "react";
import { Spin, message } from "antd";
import { connect } from "react-redux";
import { apis } from "./util/apis";
import PageRoute from "./router/page-route";
import Loadable from "react-loadable";
import { commonData } from "./config/config";
import { urlParam, getToken, devMode } from "./config/constants";
import { getUrlRealParam } from "./util/method.js";
import { loadMeetList } from "./util/meet-method";
import {
  changeLoading,
  setConfigData,
  setNavArr,
  setAccPmPermsList,
} from "./reducer/loading-reducer";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import qs from "qs";

let timefunc = null;


function Loading(error) {
  if (error) {
    return null;
  }
  return <Spin size="large" className="global-spin1" />;
}
const SysHeader = Loadable({
  loader: () => import("./component/sys-header"),
  loading: Loading,
});
@connect((state) => state.loading, {
  changeLoading,
  setConfigData,
  setNavArr,
  setAccPmPermsList,
})
class NavPage extends PureComponent {
  constructor(props) {
    super(props);
  }
  loadConfig = async () => {
    const promiseArr = [];
    promiseArr.push(apis.disp.config());
    promiseArr.push(apis.core.getAccPmPerms()); // 修改权限列表
    const resultArr = await Promise.all(promiseArr);
    let data = resultArr[0];
    let permsList = resultArr[1];
    if (data) {
      this.props.setConfigData(data);
    }
    if (permsList) {
      this.props.setAccPmPermsList(permsList);
    }

    if (data.set["disp.set.header.title"]) {
      let title = document.getElementsByTagName("title")[0];
      document.title = data.set["disp.set.header.title"];
    }
    if (getUrlRealParam("skin")) {
      window.scooper.configs.skin = getUrlRealParam("skin");
    } else if (data.set["disp.set.skin.default"]) {
      window.scooper.configs.skin = data.set["disp.set.skin.default"];
    } else {
      window.scooper.configs.skin = "light";
    }
    this.defaultRouter(data, permsList);
    this.getCurUrlParams();
  };
  getCurUrlParams() {
    const { pathname } = this.props.location;
    let urlParams = qs.parse(window.location.href.replace("?", "&"));
    if (!urlParams.skin) return;

    Object.keys(urlParams).forEach((item) => {
      if (item.indexOf(pathname) !== -1) {
        delete urlParams[item];
      }
    });
    commonData.setCommonData("urlParams", urlParams);
  }
  /**
   * 格式化路由信息
   */
  defaultRouter = (data, permsList) => {
    if (JSON.stringify(data) !== "{}") {
      sessionStorage.setItem(
        "queryPageSize",
        data.set["disp.set.core.load.size"]
      ); //设置通讯录的每页加载数
      sessionStorage.setItem(
        "defaultTelStatus",
        data.set["disp.set.show.defaultTelStatus"]
      ); //默认号码状态（callst_none）
      sessionStorage.setItem(
        "defaultTelStatusDesc",
        data.set["disp.set.show.defaultTelStatusDesc"]
      ); //默认号码状态描述（空闲）

      let items = data.nav["disp.nav.items"]; // "dispatch,appMsg..."
      let itemsArr = items.split(","); // ["dispatch","appMsg"]
      let configArr = [];
      itemsArr.forEach((element) => {
        if (
          permsList &&
          permsList.length > 0 &&
          permsList.indexOf("/" + element) > -1
        ) {
          let itemTitle = "disp.nav." + element + ".title";
          let itemUrl = "disp.nav." + element + ".url";
          let param = {
            key: element,
            title: data.nav[itemTitle],
            url: data.nav[itemUrl],
          };
          // token
          if (param.url.indexOf("token=") > -1) {
            devMode &&
              console.log(
                param.title + "模块携带token参数，不自动追加登录账号标识！"
              );
          } else if (param.url.indexOf("?") >= 0) {
            param.url = param.url + "&token=" + getToken();
          } else {
            param.url = param.url + "?token=" + getToken();
          }
          // 皮肤
          if (param.url.indexOf("skin") >= 0) {
            devMode &&
              console.log(
                param.title + "模块携带skin参数，不自动追加登录账号标识！"
              );
          } else {
            param.url =
              param.url + "&skin=" + data.set["disp.set.skin.default"];
          }
          configArr.push(param);
        }
      });
      this.props.setNavArr(configArr);
    }
  };
  getAllData = () => {
    let _this = this;
    let setIntervaltime = urlParam.setIntervaltime || 3000;
    clearInterval(timefunc)
    timefunc = setInterval(() => {
      loadMeetList()
    }, setIntervaltime)
  }
  componentWillMount() {
    this.loadConfig();
    this.getAllData();
    let token = urlParam.token;
    if (token) {
      sessionStorage.setItem("dispWebToken", token);
    }
    if (!sessionStorage.getItem("dispWebToken")) {
      message.error("请先登录！");
      localStorage.clear();
      sessionStorage.clear();
      // 去掉登录校验
      // window.location.href = "/scooper-dispatch-web";
      // this.props.history.push('/login');
    }
  }
  componentWillUnmount() {
    clearInterval(timefunc)

  }
  render() {
    const url = this.props.match.url;
    let { configData } = this.props;
    const body = window.document.body;
    body.className = "skin-science";
    return (
      <ConfigProvider locale={zhCN}>
        <Spin
          size="large"
          className={"global-spin2 test"}
          // spinning={this.props.loading}
          spinning={false}
        >
          <PageRoute url={url} />
        </Spin>
      </ConfigProvider>
    );
  }
}

export default NavPage;
