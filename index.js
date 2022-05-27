/**
 * 京东自动签到获取京豆
 * by linen
 */

const fs = require("fs").promises,
  https = require("https"),
  { execSync } = require("child_process");

// 读取环境变量
const sckey = process.env.sckey;
cookies = process.env.cookies;
//文件路径配置
const scriptPath = "./script.js",
  resultPath = "./result.txt";

// 写入cookie
async function writeCookie() {

  console.log("开始写入cookie");

  if (cookies) {
    async function downloadScript() {
      let res = ''
      //https.request 配置参数
      const getOptions = {
        hostname: "raw.githubusercontent.com",
        port: 443,
        path: "/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js",
        method: "GET",

      };
      try {
        res = await httpsRequest(getOptions)
        console.log('下载脚本成功');
      } catch (error) {
        throw new Error('脚本下载失败')
      }
      return res
    }


    function cookieToStr() {
      const matched = cookies.match(/.+/gi)
      if (!matched) {
        throw new Error('cookie格式错误')
      }
      function getCookie(name, text) {
        return new RegExp(`${name}=([^;]+)`).exec(text) || [];
      }
      const arr = matched.map(item => {
        const obj = {}
        const jrbody = getCookie('jr_body', item)[1]
        const cookie = `pt_key=${getCookie('pt_key', item)[1]};pt_pin=${getCookie('pt_pin', item)[1]};`
        obj.cookie = cookie
        if (jrbody) {
          obj.jrbody = jrbody
        }
        return obj
      }
      )
      return JSON.stringify(arr)
    }


    const script = await downloadScript()
    const cookieStr = cookieToStr()

    const data = script.replace(/var OtherKey = ``/, `var OtherKey = \`${cookieStr}\``);
    await fs.writeFile(scriptPath, data)
      .catch(e => { throw new Error("写入cookie到脚本失败") })

    console.log("写入cookie到脚本成功");
  } else {
    throw new Error("未配置cookie");
  }

}

//执行签到, 并输出log为文件
function execScript() {
  console.log('开始执行脚本');
  try {
    execSync(`node '${scriptPath}' >> '${resultPath}'`)
  } catch (error) {
    throw new Error(`执行脚本失败, 错误为->${error}`)
  }
  console.log("执行并输出log为文件成功");
}

//server酱推送
async function sendNotify() {
  console.log('开始发送消息');
  if (!sckey) {
    console.log("未配置server酱sckey,任务结束");
    return;
  }

  const desp = await fs.readFile(resultPath, { encoding: 'utf-8' })
    .catch(e => { throw new Error('读取签到结果失败') })


  function genTitle(str) {
    if (str.match(/Cookie失效/)) {
      return '京东cookie失效，请更新'
    } else {
      return `签到成功`
    }
  }

  function strToUrlEncoded(obj) {
    let str = ''
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        str += `${encodeURI(key)}=${encodeURI(element)}&`
      }
    }

    return str.replace(/&$/, '')
  }

  const title = genTitle(desp)
  const postData = strToUrlEncoded({
    title,
    desp
  })
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

writeCookie()
  .then(execScript)
  .then(sendNotify);
