/*
 * @Author: xiaqijian
 * @Date: 2023-03-13 16:41:53
 * @LastEditTime: 2023-03-13 17:01:10
 * @Description: 请填写简介查询正在召开和待召开的会议列表
 */

// 问题

// 查询正在召开和待召开的会议列表
// get /mpgw/meet/reservedMeets

// 问题
// 接口不存在字段区分已召开和未召开

const reservedMeetspost = {
  subject: "", // 会议名称（模糊匹配）
  startTime: "", // 开始时间
  endTime: "", // 结束时间
  pageNum: "", // 当前页码
  pageSize: "", // 每页记录数
};
// ConferenceCategory
// BASE	普通会议
// CASCADE	多级会议
const reservedMeetsres = [
  {
    id: "", //会议Id
    legacyId: "Number", //会议Id(兼容旧版本)
    parentId: "String", //上级会议Id
    subject: "String", //会议主题
    username: "String", //创建者
    accountName: "String", //创建者账户名
    chairmanPassword: "String", //主席密码
    guestPassword: "String", //来宾密码
    scheduleStartTime: "String", //会议开始时间
    timeZoneId: "String", //时区Id
    conferenceTimeType: "ConferenceTimeType", //会议时间类型
    periodConferenceTime: "PeriodConferenceTime", //周期会议时间参数
    duration: "Number", //时长
    category: "ConferenceCategory", //会议类型
  },
];

// 创建会议
// post /mpgw/meet/create

const createpost = {
  conference: "ConferenceReq", //会议基本信息
  multiConferenceService: "MultiConferenceServic", //多点会议请求(可选)
  participants: "List<•ParticipantReq>", //会场列表(可选)
  attendees: "List<•AttendeeReq> ", // 与会人列表(可选)
  subtitleService: "SubtitleServiceReq", //字幕服务请求(可选)
  confPresetParam: "ConferencePresetReq", //会议预置参数(可选)
  businessId: "String", // 业务ID
};
