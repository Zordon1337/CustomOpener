const express = require('express');
const fs = require('fs');
const app = express();
const config = require("./config.json");
const db = require("./db/manager.js");
const json5 = require("json5");
const utils = require("./Utils.js");
const PORT = process.env.PORT || config.port;
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
app.get('/getInfo.php', (req, res) => {
  fs.readFile('./responses/info.json', 'utf8', (err, data) => {
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
  fs.readFile('./responses/forbiddenwords.json', 'utf8', (err, data) => {
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
  fs.readFile('./responses/shop.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const info = JSON.parse(data);
    res.json(info);
  });
})
app.post("/v1/users/sendDeviceInfo",(req,res)=>{
  var playerID = req.body.playerID
  var token = req.body.token
  var uuid = req.body.uuid
  var isRooted = req.body.isRooted
  var deviceModel = req.body.deviceModel
  var os = req.body.operatingSystem
  var systemLang = req.body.systemLanguage
  utils.Debug("Received user device, uuid: "+uuid+", Root status: "+isRooted+" with language: "+systemLang+"\n with os "+os);
  db.SaveDeviceInfo(playerID,token,uuid,isRooted,deviceModel,os,systemLang);
  res.status(204);
})
app.listen(PORT, () => {
  db.InitDB();
  utils.Log(`Server is running on port ${PORT}`);
});