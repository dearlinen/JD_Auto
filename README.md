# 效果
- 自动完成京东的每日任务, 并推送消息到微信

# 使用指南
- 点击右上角 `Fork` 项目；
- `Settings` -> `Secrets` 中添加京东cookie、Server 酱sckey
  - `cookie`：京东 cookie
  - `dualCookie`：第二个 cookie
  - `otherCookie`：其他 cookie,可填多个,用英文逗号隔开每个
  - `sckey`：Server 酱 sckey
- 为了保证任务没有遗漏,任务每天自动运行两次, 配置之后也可以在`Actions`选项中手动运行


## 获取 Server 酱 SCKEY

- 在[Server酱官网](https://sct.ftqq.com/) 注册, 建议使用企业微信通道

- 拷贝 sckey

## 获取Cookie
- 安装浏览器插件`EditThisCookie`
- 在此[页面](https://bean.m.jd.com/bean/signIndex.action)登录, 然后用插件选取字段`pt_key`,`pt_pin`的值
- 在`Settings`->`Secrets`中配置cookie, 格式为`pt_key=xxxxxx;pt_pin=yyyyyy`

## 参考项目

- [NobyDa/Script/JD-DailyBonus](https://github.com/NobyDa/Script/blob/master/JD-DailyBonus/JD_DailyBonus.js)
