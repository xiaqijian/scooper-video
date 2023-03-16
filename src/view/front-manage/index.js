/*
 * @File: 头部
 * @Author: liulian
 * @Date: 2020-09-11 08:57:51
 * @version: V0.0.0.1
 * @LastEditTime: 2022-04-08 13:55:17
 */
import React, { PureComponent } from "react";
import { Spin, message } from "antd";
import { devMode, getToken, platUrl, skin } from "../../config/constants";
import { setConfigData, setNavArr, setShowHeadContent } from '../../reducer/loading-reducer'
import SysHeader from "../../component/sys-header";
import Loadable from "react-loadable";
import UnfiedManager from '../unified-manager'
import { connect } from "react-redux";
import $ from 'jquery'

function Loading(error) {
    return (
        <Spin size="large" className="global-spin1" />
    );
}
const AudioDispatch = Loadable({
    loader: () => import('../audio-manage/audio-dispatch'),
    loading: Loading
});
@connect(
    state => state.loading,
    { setConfigData, setNavArr, setShowHeadContent }
)
class FrontManage extends PureComponent {
    render() {
        let { navArr, configData } = this.props
        return (
            <div style={{ height: '100%' }}>
                <SysHeader />
                {/* {JSON.stringify(configData) !== '{}' && configData.set["disp.set.module.loadTogether"] == 3 &&
                    <Spin size="large" className={"global-spin3 test"} spinning={this.props.loading}>
                        <AudioDispatch />
                    </Spin>
                } */}
                {JSON.stringify(configData) !== '{}' && configData.set["disp.set.module.loadTogether"] == 1 &&
                    navArr && navArr.map((item, index) => {
                        if (item.key == configData.nav['disp.nav.default']) {
                            if ("dispatch" === item.key) {
                                setTimeout(function () {
                                    // TODO 这里写死了打包的时候记得改
                                    let url = configData.nav["disp.nav.dispatch.url"];
                                    // let url = '/#/main/dispatch';
                                    if (url.indexOf('token=') > -1) {
                                        devMode && console.log("dispatch模块携带token参数，不自动追加登录账号标识！")
                                    } else if (url.indexOf("?") >= 0) {
                                        url = url + '&token=' + getToken();
                                    } else {
                                        url = url + '?token=' + getToken();
                                    }
                                    if (url.indexOf('skin=') > -1) {
                                        devMode && console.log("dispatch模块携带skin参数，不自动追加登录账号标识！")
                                    } else if (url.indexOf("?") >= 0) {
                                        url = url + '&skin=' + skin;
                                    } else {
                                        url = url + '?token=' + skin;
                                    }
                                    $("#content_dispatch").attr("src", url);
                                }, 500);
                                return (
                                    <UnfiedManager id={"content_" + item.key} keys={item.key} isShow='show' togth="1" key={'iframe-' + index} selectKeys={configData.nav['disp.nav.default']} />
                                )
                            }
                            else {
                                return (
                                    <UnfiedManager src={item.url} keys={item.key} isShow='show' togth="1" key={'iframe-' + index} selectKeys={configData.nav['disp.nav.default']} />
                                )
                            }
                        }
                        else {
                            return (
                                <UnfiedManager src="" keys={item.key} isShow='show' togth="1" key={'iframe-' + index} selectKeys={configData.nav['disp.nav.default']} />
                            )
                        }

                    })
                }
            </div>
        )
    }
}

export default FrontManage;