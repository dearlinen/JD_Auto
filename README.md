# 脚本描述

- 基于`Github Actions`和`server酱`自动完成京东的每日任务, 并推送消息到微信

## 使用指南

- 点击右上角 `Fork` 项目；
- `Settings` -> `Secrets` 中添加京东cookie和Server 酱sckey
  - `cookies`:放置所有cookie的环境变量，其内容格式必须为`pt_key=xxx;pt_pin=xxx;@jrBody=xxx`
    - `pt_key;pt_pin;`为京东cookie，必填，注意`pt_key`和`pt_pin`结束必须加上`;`
    - `jrBody`为京东金融签到body，可选填，如果需要，必须在京东cookie之后加上`@`
    - 每个签到账号结束必须要加上`,`
  - `sckey`：Server 酱 sckey
- 为了保证任务没有遗漏,任务每天自动运行两次, 配置之后也可以在`Actions`选项中手动运行

## 获取 Server 酱 SCKEY

- 在[Server酱官网](https://sct.ftqq.com/) 注册, 建议使用企业微信通道

- 拷贝 sckey

## 获取Cookie

- 安装浏览器插件`EditThisCookie`
- 在此[页面](https://bean.m.jd.com/bean/signIndex.action)登录, 然后用插件选取字段`pt_key`,`pt_pin`的值
- 在`Settings`->`Secrets`中添加环境变量`cookies`, 格式为`pt_key=xxxxxx;pt_pin=yyyyyy;`
- 如需获取京东金融签到Body, 可进入"京东金融"APP, 在"首页"点击"签到"并签到一次, 返回抓包app搜索关键字 `h5/m/appSign` 复制请求体填入json串数据内即可

## 参考项目

- [NobyDa/Script/JD-DailyBonus](https://github.com/NobyDa/Script/blob/master/JD-DailyBonus/JD_DailyBonus.js)
