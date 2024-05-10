const express = require('express');
const fs = require('fs');

const app = express();
const config = require("./config.json");
const db = require("./db/manager.js");
const json5 = require("json5");

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
const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  db.InitDB();
  console.log(`Server is running on port ${PORT}`);
});