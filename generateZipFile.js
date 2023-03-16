/*
 * @Author: xiaqijian
 * @Date: 2023-03-15 15:58:23
 * @LastEditTime: 2023-03-15 15:58:23
 * @Description: 请填写简介
 */
"use strict";
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const packageJson = require(resolveApp("package.json"));
//版本号
const version = `r${packageJson.version}`;
//生成时间
const time = moment().format("YYYYMMDDHH");
//生成版本文件
fs.createWriteStream(`build/version.json`);
fs.writeFile("build/version.json", `${version}_${time}`, {}, function (err) {
  if (err) {
    console.log(`创建版本文件失败:${err}`);
    return;
  }
  console.log(`创建版本文件成功:${version}_${time}`);
});
var projectName = packageJson.name;
var releaseAddress = packageJson.releaseAddress;
// 请求模块
var archiver = require("archiver");

// 创建生成的压缩包路径
var output = fs.createWriteStream(
  `${releaseAddress}/${projectName}_${version}_${time}.zip`
); //__dirname +
var archive = archiver("zip", {
  zlib: {
    level: 9,
  }, // 设置压缩等级
});

// 'close' 事件监听
output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

// 'end' 事件监听
output.on("end", function () {
  console.log("Data has been drained");
});

// 'warnings' 事件监听
archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    // 打印警告
    console.warn(err);
  } else {
    // throw error
    throw err;
  }
});

// 'error' 事件监听
archive.on("error", function (err) {
  throw err;
});

// pipe 方法
archive.pipe(output);

// 添加一个目录，且文件包含在新目录中
archive.directory("./build", projectName);

//执行
archive.finalize();
