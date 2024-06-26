const express = require('express');
const fs = require('fs');
const app = express();
const config = require("./config.json");
const db = require("./db/manager.js");
const json5 = require("json5");
const utils = require("./Utils.js");
const path = require("path");
const webinx = require("./web/index.js");
const PORT = process.env.PORT || config.port;
var loggedin = 0;
var serverstarttimestamp = 0;
async function generateJSON() {
  try {
    const jsonData = await db.FetchCases(); 
    return jsonData; 
  } catch (error) {
    console.error('Error:', error);
    throw error; 
  }
}
async function LoadCustomCases(info, res) {
  try {
    const jsonData = await generateJSON(); 
    const customCases = jsonData.map(row => {
      const skins = json5.parse(JSON.stringify(row.skins));
      const receive = [
        {
          "type": "coins",
          "price": -100000,
          "amount": 1000
        }
      ];
      const lang = {
            "chinesesimplified": row.name,
            "russian": row.name,
            "polish": row.name
          }
      return {
        ...row,
        skins: skins,
        receive: receive,
        translatedName: lang
      };
    });
    info.customCases = customCases;
    res.json(info);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
app.use((req, res, next) => {
  console.log(`Path: ${req.path}, Time: ${new Date().toISOString()}`);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.set("Static","./static");
app.set("static","./static"); // not sure which one works
app.get('/getInfo.php', (req, res) => {
  loggedin++;
  fs.readFile('src/responses/info.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const info = JSON.parse(data);
    if(config.CustomCases) {
      LoadCustomCases(info, res);
    } else {
      res.json(info);
    }
  });
});
app.get('/auth/getForbiddenWords.php', (req, res) => {
  fs.readFile('src/responses/forbiddenwords.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const info = JSON.parse(data);
    res.json(info);
  });
});
app.get("/php_redis/getShop.php",(req,res)=>{
  fs.readFile('src/responses/shop.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const info = JSON.parse(data);
    res.json(info);
  });
})
app.get("/",(req,res)=>{
  webinx.DrawIndex(req,res,fs,serverstarttimestamp,loggedin);
})
app.get("/index.html",(req,res)=>{
  
  webinx.DrawIndex(req,res,fs,serverstarttimestamp,loggedin);
})
app.get("/editor",(req,res)=>{res.sendFile(path.resolve("src/static/editor.html"))})
app.get("/editor.css",(req,res)=>{res.sendFile(path.resolve("src/static/editor.css"))})
app.get("/style.css",(req,res)=>{res.sendFile(path.resolve("src/static/style.css"))})
app.post("/v1/users/sendDeviceInfo",(req,res)=>{
  var playerID = req.body.playerID
  var token = req.body.token
  var uuid = req.body.uuid
  var isRooted = req.body.isRooted
  var deviceModel = req.body.deviceModel
  var os = req.body.operatingSystem
  var systemLang = req.body.systemLanguage
  if(config.logdeviceinfo)
    {
      utils.Debug("Received user device, uuid: "+uuid+", Root status: "+isRooted+" with language: "+systemLang+"\n with os "+os);
      db.SaveDeviceInfo(playerID,token,uuid,isRooted,deviceModel,os,systemLang);
    }
  res.status(204);
})
app.post("/saveedit",(req,res)=>{
  var caseid = req.body.caseid;
  var newjson = req.body.json;
  db.conn.query(`UPDATE cases SET skins='${newjson}' WHERE id = '${caseid}'`)
  res.redirect("/")
})
app.listen(PORT, () => {
  serverstarttimestamp = Date.now();
  db.InitDB();
  utils.Log(`Server is running on port ${PORT}`);
});