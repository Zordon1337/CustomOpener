const express = require('express');
const fs = require('fs');

const app = express();

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
    res.json(info);
  });
});
app.get('/getInfo.php', (req, res) => {
  fs.readFile('./responses/info.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const info = JSON.parse(data);
    fs.readFile('./responses/customcases.json', 'utf8', (err, customCasesData) => {
      if (err) {
        console.error('Error reading file:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      const customCases = JSON.parse(customCasesData);
      info.customCases = customCases;
      res.json(info);
    });
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
