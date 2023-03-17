/*
 * @Author: zhujj 
 * @Date: 2018-10-25 12:54:10 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-07-09 16:18:12
 */
//该文件创建axios实例，以及设置一些默认配置
import axios, {
    defaults
} from 'axios'
import store from '../store/index';
import {
    message
} from 'antd'
import qs from 'qs'
import {
    mapValues,
    isPlainObject,
    isEmpty
} from 'lodash';

import {
    changeLoading
} from "../reducer/loading-reducer";
import {
    lang
} from 'moment';

const sysUrl = '' //服务 ip地址
const mockURL = '' //mock ip地址

const instance = axios.create({
    transformRequest: [
        (data, headers) => {
            // console.log(data, headers)
            // try {
            //     qs.parse(data)
            //     const res = qs.stringify(data, (k, v) => {
            //         if (typeof v === 'string') {
            //             return v.trim()
            //         }
            //         return v
            //     });
            //     return res
            // } catch (error) {
            //     return data
            // }
            return data
        },
        ...defaults.transformRequest
    ],
    transformResponse: [
        (data) => {
            /* eslint no-param-reassign:0 */
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data, (k, v) => {
                        if (k === '') {
                            return v
                            // 将null转化为undefined
                        } else if (v === null) {
                            return undefined
                        }
                        return v
                    })
                } catch (e) {
                    /* Ignore */
                    console.log(e);
                }
            }
            return data
        }
    ],
});

/**
 * @description 根据参数，判断是get还是post请求
 * @param {{url: string, method: string, data: {[key: string]: string}}} options
 */
const fetch = (options) => {
    console.log(options);
    const {
        method = 'get', data = {}, url
    } = options
    switch (method.toLowerCase()) {
        case 'post':
            return instance.post(url, qs.stringify(data))
        case 'delete':
            return instance.delete(`${url}${!isEmpty(data) ? `&${qs.stringify(data)}` : ''}`)
        case 'postjson':
            return instance.post(url, data, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
        case 'put':
            return instance.put(url, data, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
        case 'postfile':
            return instance.post(url, data);
        default:
            return instance.get(`${url}${!isEmpty(data) ? `&${qs.stringify(data)}` : ''}`)
    }
}

/**
 * @description 对返回的数据做判断，返回异常，则报错，返回正常，则将data值返回
 * @param {{url: string, method: string, data: {[key: string]: string}}} options
 */
function request(options) {
    const tempOptions = {
        ...options
    }
    return fetch(tempOptions)
        .then((response) => {
            // store.dispatch(changeLoading(false));
            let {
                data
            } = response;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data)
                } catch (e) {
                    /* Ignore */
                    console.log(e);
                }
            }
            const {
                code
            } = data

            if (tempOptions.getResp) {
                return data;
            }

            if (!code) { //返回code为0，表示返回数据正常，直接将data返回
                if (tempOptions.getResp) {
                    return data;
                } else {
                    return data.data;
                }
            } else {
                tempOptions.showMessage && message.error(data.message || data.msg) //提示后台错误信息
                throw response
            }
        }).catch((response) => {
            // store.dispatch(changeLoading(false));
            throw response
        })
}

/**
 * @description 创建异步请求函数
 * @param {string} url 请求地址
 * @param {string} method 请求方式（get 或 post）
 * @param {function} getToken
 */
const generateRequest = (url, method, getToken, load, showMessage = true, getResp = false) =>
    async (data = {}) => {
        // !data.token && (data.token = getToken())
        if (load) {
            // store.dispatch(changeLoading(true));
        }

        return request({
            url: url + (url.includes('?') ? '&' : '?') + 'token=' + getToken(),
            method,
            data,
            showMessage,
            getResp
        })
    }

/**
 * @description getService中对于post方法不需要写成对象,直接写字符串就行了
 * @author zhujj
 * @param {string} source
 * @param {function} getToken 获取token的方法
 * @param {{[key:string]: {} | string}} data
 * @param {string} [basePrefix]
 * @returns
 */
function getServices(source, getToken, data, basePrefix) {
    let apiPrefix = sysUrl
    if (basePrefix === 'mock') {
        apiPrefix = mockURL
    }
    return mapValues(data, (val) => { //处理对象中每个元素，返回映射后的对象
        if (isPlainObject(val)) { //检查 val 是否是普通对象，也就是说该对象由 Object 构造函数创建或者 [[Prototype]] 为空。
            const {
                url,
                type = 'post',
                prefix,
                load = true,
                showMessage = true,
                getResp
            } = val
            let api
            switch (prefix) { //考虑会使用mock数据而做的封装
                case 'base':
                    api = pathResolve(sysUrl, source, url)
                    break
                case 'mock':
                    api = pathResolve(mockURL, source, url)
                    break
                default:
                    api = pathResolve(apiPrefix, source, url)
            }
            return generateRequest(api, type, getToken, load, showMessage, getResp)
        }
        return generateRequest(pathResolve(apiPrefix, source, val), 'post', getToken)
    })
}

const pathResolve = (apiPrefix, source, url) => {
    return apiPrefix + source + url
}

export default getServices


//===================DEMO=======
//=======使用说明======
/*const scooper_core_api = getServices('/scooper-core-rest'/!* 该参数作用为将url中的相同前缀提取，减少代码量 *!/, () => sessionStorage.getItem('token'), {
    doLogin: '/data/system/authManage/loginTo', //默认为post请求
    listProgram: { url: '/data/system/permisions/programManage/listProgram', prefix: 'base'/!* base：表示用真实请求，mock：表示用mock数据的服务ip *!/, type: 'get'/!* 不设置type，默认为post *!/ },
    listOrgDept: '/data/contacts/orgDeptManage/listOrgDept', //获取部门数据
    listOrgMember: '/data/contacts/orgMemberManage/listOrgMember', //获取成员数据
}, 'mock' /!* 设置该值，表示以上接口（除去单独设置base请求，如：listProgram）全部为mock请求 *!/)

//==========一般使用方式=========
const scooper_core_api = getServices('/scooper-core-rest', () => sessionStorage.getItem('token')/!** 该参数返回获取token的方法，在接口调用的时候触发 *!/, {
    doLogin: '/data/system/authManage/loginTo', //登录
    listProgram: '/data/system/permisions/programManage/listProgram', //获取项目key
    listOrgDept: '/data/contacts/orgDeptManage/listOrgDept', //获取部门数据
    listOrgMember: '/data/contacts/orgMemberManage/listOrgMember', //获取成员数据
})

const scooper_activiti_api = getServices('/scooper-activiti', () => sessionStorage.getItem('token'), {
    createProcessDefinition: '/data/activiti/createProcessDefinition', // 上传工作流文件
    flow: '/data/flow',//根据流程部署id及任务key获取网关线
})

scooper_core_api.doLogin({
    'accUsername': '',
    'accPassword': ''
}).then(data => {
    //date值为response中的data值
})

scooper_core_api.doLogin(/!* 若不需要参数时也可不填 *!/).then(data => {
    //date值为response中的data值
})*/