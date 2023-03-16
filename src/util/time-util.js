/*
 * @File: 时间函数
 * @Author: liulian
 * @Date: 2020-07-31 11:27:11
 * @version: V0.0.0.1
 * @LastEditTime: 2021-03-09 16:11:06
 */
import { PureComponent } from "react";
import { apis } from "./apis";

let timeCount = 0; 
class TimeUtil extends PureComponent {
    serverDate;

    constructor(props) {
        super(props);
        
    }

    setServerDateRul = () => {
        this.startServerDateTimer();
    }
    /**
     * 设置后台服务时间
     */
    setServerDate = (date) => {
        this.serverDate = date;
    }
    /**
     * 获取后台服务时间
     * @return {*}
     */
    getServerDate = () => { 
        return this.serverDate || new Date();
    }
    /**
     * 启动定时获取后台服务时间的定时任务
     */
    startServerDateTimer = () => {

        let serverDate = this.serverDate;
        let _this = this;
        setInterval(function () {
            if (serverDate) {   //当前时间+1s
                serverDate = _this.calTimeAddseconds(serverDate);
            }
            if (timeCount == 0 || timeCount / 100 == 1) {
                apis.disp.getNowTime().then((data)=>{
                    if (data.code == 0) {
                        var timeDate = data.data;
                        serverDate = _this.transDateByDateStr(timeDate);
                    }
                })
              
                timeCount = 0;
            }
            _this.setServerDate(serverDate);
            timeCount++;
        }, 1000);
    }
    /**
     * 时间+秒
     * @param date
     */
    calTimeAddseconds = (date, addCount) => {
        date = date || this.getServerDate();
        addCount = addCount || 1;
        var timeStamp = date.getTime() + addCount * 1000;
        return new Date(timeStamp);
    }

    getServerDate = () => {
        return this.serverDate || new Date();
    }

    /**
     * 时间格式化为 yyyy-MM-dd
     * @param {*} date 
     */
    getDate = (date) => {
        date = date ? date : this.getServerDate();
        let seperator = "-";
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (day >= 0 && day <= 9) {
            day = "0" + day;
        }
        let currentdate = year + seperator + month + seperator + day;
        return currentdate;
    }

    /**
     * 获取当前时间
     * @param {*} date （new Date()）
     * @return {*} date : 11:20:14
     */
    getTime = (date) => {
        date = date ? date : this.getServerDate();
        let hour = date.getHours() <= 9 ? date.getHours() : date.getHours();
        let minute = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds();
        let seperator = ":";
        let currenttime = hour + seperator + minute + seperator + second;
        return currenttime;
    }
    /** 
     * 获取date的时间戳
     * @param {*} date 
     */
    getTimeStamp = (date) => {
        date = date ? date : this.getServerDate();
        return date.getTime();
    }
    /**
     * 获取当前日期时间字符串
     * 20200731145629
     */
    getDaeTimeStr = (date) => {
        date = date ? date : this.getServerDate();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = month <= 9 ? "0" + month : month;
        let day = date.getDate() <= 9 ? "0" + date.getDate() : date.getDate();
        let hour = date.getHours() <= 9 ? date.getHours() : date.getHours();
        let minute = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds();
        let currentDataTime = year + month + day + hour + minute + second;
        return currentDataTime;
    }
    /**
     * 获取当前日期时间字符串
     * 2020-07-31 14:56:17
     */
    getDateTimeDate = (date) => {
        date = date ? date : this.getServerDate();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = month <= 9 ? "0" + month : month;
        let day = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
        let hour = date.getHours() <= 9 ? '0' + date.getHours() : date.getHours();
        let minute = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds();
        let dataSeperator = "-";
        let timeSeperator = ":";
        let currentDataTime = year + dataSeperator + month + dataSeperator + day + " "
            + hour + timeSeperator + minute + timeSeperator + second;
        return currentDataTime;
    }
    /**
     * 日期加减 获取计算后的日期
     *  @param calCount 日期计算（0：当天  1：下一天  -1：上一天）
     *  @param date     要被加减的日期
     */
    calculateDate = (calCount, date) => {
        //一天的毫秒数   
        let daySecond = 1000 * 60 * 60 * 24;
        calCount = calCount ? calCount : 0;
        date = date ? date : this.getServerDate();
        //获得当前周的第一天   
        let calDay = new Date(date.getTime() + (daySecond * calCount));
        return this.getDate(calDay);
    }
    /**
     * 获取某周开始日期
     * @param {*} addWeekCount 周数字加成（0：本周； 1：下周；  -1：上周）
     */
    calWeekStartDate = (addWeekCount) => {
        let daySecond = 1000 * 60 * 60 * 24;
        addWeekCount = addWeekCount ? addWeekCount : 0;
        //获取当前时间   
        let now = this.getServerDate();
        //相对于当前日期addWeekCount个周的日期
        let calDay = new Date(now.getTime() + (daySecond * 7 * addWeekCount));
        //返回date是一周中的某一天
        let week = calDay.getDay();
        //减去的天数   
        let minusDay = week != 0 ? week - 1 : 6;
        //获得当前周的第一天   
        let calWeekStartDay = new Date(calDay.getTime() - (daySecond * minusDay));
        return this.getDate(calWeekStartDay);
    }
    /**
     * 计算某月开始日期
     * @param {*} addMonthCount 月数字加成（0：本月； 1：下月； -1：上月）
     */
    calMonthStartDate = (addMonthCount) => {
        addMonthCount = addMonthCount ? addMonthCount : 0;
        //获取当前时间
        let now = this.getServerDate();
        let year = now.getFullYear();
        let month = now.getMonth() + addMonthCount;
        let calMonthStartDay = new Date(year, month, 1);
        return this.getDate(calMonthStartDay);
    }
    /**
     * 将时间戳转换成 yyyy-MM-dd HH:mm:ss字符串
     * @param {*} timeStamp 时间戳
     */
    timeStampTrans = (timeStamp) => {
        let date = new Date(timeStamp);//如果date为13位不需要乘1000
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y + M + D + h + m + s;
    }
    /**
     * 计算当前时间与时间戳的时间差
     * @param {*} timeStamp 时间戳
     * @return {*} String 1时5分6秒
     */
    calTimeStamp = (timeStamp) => {
        let nowTimeStamp = this.getServerDate().getTime();
        let calTime = nowTimeStamp - timeStamp;
        if (calTime <= 0) {
            return '';
        }
        let s = Math.floor(calTime % (60 * 1000) / 1000) + "秒";
        let m = Math.floor(calTime % (3600 * 1000) / (60 * 1000)) > 0 ? Math.floor(calTime % (3600 * 1000) / (60 * 1000)) + "分" : "";
        let h = Math.floor(calTime % (24 * 3600 * 1000) / (3600 * 1000)) > 0 ? Math.floor(calTime % (24 * 3600 * 1000) / (3600 * 1000)) + "时" : "";
        let D = Math.floor(calTime / (24 * 3600 * 1000)) > 0 ? Math.floor(calTime / (24 * 3600 * 1000)) + "天" : "";

        return D + h + m + s;
    }
    /**
     * 计算两个时间戳之间的时间差
     */
    calTimeBetween = (first, second) => {
        let calTime = first - second;
        if (calTime <= 0) {
            return '';
        }
        let s = Math.floor(calTime % (60 * 1000) / 1000) + "秒";
        let m = Math.floor(calTime % (3600 * 1000) / (60 * 1000)) > 0 ? Math.floor(calTime % (3600 * 1000) / (60 * 1000)) + "分" : "";
        let h = Math.floor(calTime % (24 * 3600 * 1000) / (3600 * 1000)) > 0 ? Math.floor(calTime % (24 * 3600 * 1000) / (3600 * 1000)) + "时" : "";
        let D = Math.floor(calTime / (24 * 3600 * 1000)) > 0 ? Math.floor(calTime / (24 * 3600 * 1000)) + "天" : "";

        return D + h + m + s;
    }
    /**
     * 将时间字符串转成Date对象
     * yyyy-MM-dd HH:mm:ss
     */
    transDateByDateStr = (dateStr) => {
        if (!dateStr) return null;
        let dateArr = dateStr.split(' ');
        if (dateArr.length != 2) {
            console.error("func transDateByDateStr, param error");
            return null;
        }
        let dateTimeArr = dateArr[1].split(':');
        let timeStamp = new Date(dateArr[0]).getTime() + dateTimeArr[0] * 3600000 + dateTimeArr[1] * 60000
            + dateTimeArr[2] * 1000 - 8 * 3600 * 1000;
        return new Date(timeStamp);
    }
    /**
     * 计算秒数变成  时长
     */
    calTimelength = (timeLength) => {
        let h = Math.floor(timeLength / (60 * 60));
        let m = Math.floor(timeLength % (60 * 60) / 60);
        let s = Math.floor(timeLength % (60));

        let result = "";
        if (h) {
            result = this.checkInt(h) + ":";
        }
        result += this.checkInt(m) + ":";
        result += this.checkInt(s);
        return result;
    }
    checkInt = (number) => {
        return number <= 9 ? "0" + number : number;
    }
}

const timeUtil = new TimeUtil();
export default timeUtil;

