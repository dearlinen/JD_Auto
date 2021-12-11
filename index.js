/**
 * 京东自动签到获取京豆
 * by linen
 */

const fs = require("fs"),
  https = require("https"),
  querystring = require("querystring"),
  { execSync } = require("child_process");

// 读取环境变量
const sckey = formatString(process.env.sckey),
  cookies = formatString(process.env.cookies);

//文件路径配置
const scriptPath = "./script.js",
  resultPath = "./result.txt";

//https.request 配置参数
const getOptions = {
  hostname: "raw.githubusercontent.com",
  port: 443,
  path: "/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js",
  method: "GET",
};

// 格式化用户输入
function formatString(string) {
  return string.replace(/\s/g, "");
}

// 写入cookie
function writeCookie(data) {
  if (data) {
    console.log("脚本下载成功");
  }

  if (cookies) {
    let cookieStr = "";
    cookieStr = JSON.stringify(
      cookies.split(",").map(str => {
        const arr = str.split("@");
        const obj = {
          cookie: arr[0],
        };
        if (arr[1]) {
          obj.jrBody = arr[1];
        }
        return obj;
      })
    );
    data = data.replace(/var OtherKey = ``/, `var OtherKey = \`${cookieStr}\``);
  } else {
    throw new Error("未配置cookie");
  }

  fs.writeFileSync(scriptPath, data, err => {
    if (err) {
      throw new Error("写入cookie到脚本失败");
    }
  });
  console.log("写入cookie到脚本成功");
}

//执行签到, 并输出log为文件
function execScript() {
  execSync(`node '${scriptPath}' >> '${resultPath}'`);
  console.log("执行并输出log为文件成功");
}

//server酱推送
function sendNotify() {
  if (!sckey) {
    console.log("未配置server酱key,任务结束");
    return;
  }

  const result = fs.readFileSync(resultPath, "utf8")
  const title =
    result.match(/Cookie失效/)
      ? '京东cookie失效，请更新'
      : result.match(/(?<=【账号总计】:)\d*/)
        ? '签到成功，共获得' + result.match(/(?<=【账号总计】:)\d*/) + '京豆'
        : '签到失败，请查看GitHub Actions日志'


  const postData = `${encodeURI('title')}=${encodeURI(title)}&${encodeURI('desp')}=${encodeURI(result)}`
  const postOptions = {
    hostname: "sctapi.ftqq.com",
    path: `/${sckey}.send`,
    port: 443,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
    },
  };

  httpsRequest(postOptions, postData).then(
    () => {
      console.log("推送消息发送成功");
    },
    err => {
      console.log("推送消息发送失败, 错误为->", err);
    }
  );
}

//https.request 封装
function httpsRequest(params, postData) {
  return new Promise(function (resolve, reject) {
    const req = https.request(params, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error("statusCode=" + res.statusCode));
      }
      let body = [];
      res.on("data", function (chunk) {
        body.push(chunk);
      });
      res.on("end", function () {
        try {
          body = Buffer.concat(body).toString();
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });
    });
    req.on("error", function (err) {
      reject(err);
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

httpsRequest(getOptions)
  .then(writeCookie, err => {
    console.log("脚本下载失败, 错误为->", err);
  })
  .then(execScript)
  .then(sendNotify);
