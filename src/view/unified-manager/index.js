/*
 * @File: 加载其他模块
 * @Author: liulian
 * @Date: 2020-09-08 19:22:37
 * @version: V0.0.0.1
 * @LastEditTime: 2022-08-04 14:56:16
 */
import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import $ from 'jquery'

@withRouter
class UnfiedManager extends PureComponent {
    render() {
        let { src, keys, isShow, togth, selectKeys,isThreeType } = this.props;
        let realSrc = "";
        if (this.props.location.state && this.props.location.state.faxsrc) {
            realSrc = this.props.location.state.faxsrc
        } else if (this.props.location.state && this.props.location.state.smssrc) {
            realSrc = this.props.location.state.smssrc
        } else {
            realSrc = src
        }
        // let isInDispatch = document.getElementById("dispatch-head"); 
        // console.log(isInDispatch)
        if (keys == 'dispatch' && isShow == 'show') {
            // console.log("11111")
            window.top.style = 'iframe'
        }

        // if(keys == "gis"){
        //     let Doms = document.getElementsByClassName("iframe-gis");
        //     let dom =(Doms && Doms.length>0) ? Doms[0] :''
        //     if(dom){
        //         dom.onload = () => {
        //             let b = dom.contentWindow.document;
        //             console.log(b)
        //             console.log($(b).find("body"));
        //             console.log($(b).find(".left-part"));
        //             console.log($(b).find(".common-gis-search"));
        //             $(b).find("#camera-ztree").css('color','red');
        //         }
        //     }
        // }
        
        if (selectKeys && $(".iframe-" + selectKeys)) {
            if ($(".iframe-" + selectKeys).hasClass("checked-style")) {
                $(".iframe-" + selectKeys).removeClass("checked-style")
            }
            $(".iframe-" + selectKeys).addClass("checked-style");
        }

        return (
            <iframe className={`content-fream iframe-${keys} ${keys == selectKeys ?'show' :''} ${isThreeType?'threeShow':''}`}  id={this.props.id} width="100%" frameBorder="0"
                scrolling="yes" marginWidth="0" marginHeight="0"
                src={realSrc}>
            </iframe>
        );
    }
}

export default UnfiedManager;