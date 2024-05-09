const express = require('express');
const fs = require('fs');

const app = express();
const config = require("./config.json");
const db = require("./db/manager.js");
function LoadCustomCases(info,res)
{
  fs.readFile('./responses/customcases.json', 'utf8', (err, customCasesData) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const customCases = JSON.parse(customCasesData);
    info.customCases = customCases;
    res.json(info)
  });
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
    if(config.CustomCases)
    {
        LoadCustomCases(info,res);
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
const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  db.InitDB()
  console.log(`Server is running on port ${PORT}`);
});
