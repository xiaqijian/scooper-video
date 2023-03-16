/**
 * @file 404跳转页面
 * @author XXX
 * @date 2019/10/16
 * @version:v1.1.0
 */

import { Button, Result } from 'antd';
import {withRouter} from "react-router-dom";
import React from 'react';

function NoFoundPage(props) {

    return <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Button type="primary" onClick={() => props.history.push('/main')}>
                    返回
                </Button>
            } />
    };

export default withRouter(NoFoundPage);