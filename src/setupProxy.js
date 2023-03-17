/*
 * @Author: xiaqijian
 * @Date: 2023-03-09 14:44:50
 * @LastEditTime: 2023-03-09 14:53:40
 * @Description: 请填写简介
 */
const { createProxyMiddleware } = require("http-proxy-middleware");

const url = "https://59.203.26.163:9999";
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/dispatch-web", {
      target: url,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/dispatch-web": "/dispatch-web",
      },
    })
  );
  app.use(
    createProxyMiddleware("/scooper-core-rest", {
      target: url,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/scooper-core-rest": "/scooper-core-rest",
      },
    })
  );
  app.use(
    createProxyMiddleware("/scooper-record", {
      target: url,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/scooper-record": "/scooper-record",
      },
    })
  );
  app.use(
    createProxyMiddleware("/scooper-mits-conf", {
      target: url,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/scooper-mits-conf": "/scooper-mits-conf",
      },
    })
  );
  app.use(
    createProxyMiddleware("/mpgw", {
      target: url,
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/mpgw": "/mpgw",
      },
    })
  );
};
