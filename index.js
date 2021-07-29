/**
 * 京东自动签到获取京豆
 * by linen
 */

const fs = require("fs"),
  https = require("https"),
  querystring = require("querystring"),
  { execSync } = require("child_process");

// 读取环境变量
const sckey = process.env.sckey,
  cookie = process.env.cookie,
  dualCookie = process.env.dualCookie,
  otherCookie = process.env.otherCookie;

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

// 写入cookie
function writeCookie(data) {
  if (!cookie) {
    throw new Error("未配置cookie");
  }
  data = data.replace(/var Key = ''/, `var Key = '${cookie}'`);

  if (dualCookie) {
    data = data.replace(/var DualKey = ''/, `var DualKey = '${dualCookie}'`);
  }
  if (otherCookie) {
    data = JSON.stringify(
      otherCookie.split(",").map(cookie => ({ cookie: cookie }))
    );
    data = data.replace(/var OtherKey = ''/, `var OtherKey = '${otherCookie}'`);
  }

  fs.writeFileSync(scriptPath, data, err => {
    if (err) {
      throw new Error("Error writing on cookie replace");
    }
  });
}

//执行签到, 并输出log为文件
function execScript() {
  execSync(`node '${scriptPath}' >> '${resultPath}'`);
}

//server酱推送
function sendNotify() {
  if (!sckey) {
    console.log("未配置server酱key,任务结束");
    return;
  }

  const result = fs.readFileSync(resultPath, "utf8"),
    postData = querystring.stringify({
      title: Date(new Date()),  //未格式化日期
      desp: result,
    }),
    postOptions = {
      //content-length字段依赖上下文生成, 未放置在文件首
      hostname: "sctapi.ftqq.com",
      path: `/${sckey}.send`,
      port: 443,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    };

  httpsRequest(postOptions, postData);
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

httpsRequest(getOptions).then(writeCookie).then(execScript).then(sendNotify);
