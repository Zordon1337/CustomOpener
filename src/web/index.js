
const { json } = require("body-parser");
const db = require("../db/manager.js");
function getAllCases(callback)
{
    db.conn.query("SELECT * FROM cases", (error, results, fields) => {
        if (error) {
          console.error('Error fetching cases:', error);
          callback(error, null);
        } else {
          callback(null, results);
        }
      });
}
var cases = "";
function DrawCases(callback)
{
    
      getAllCases((error, cases) => {
        if (error) {
          cases = ("Error: " + error.message);
        } else {
          let tableHtml = "<table align='center'><tr><th>ID</th><th>Skins</th><th>Description</th></tr>";
          cases.forEach((item) => {
            var skins = JSON.parse(item.skins);
            var htmlskins = "";
            skins.forEach((skin)=>{
                htmlskins += `${skin.weapon} | ${skin.skin} ${skin.chances}% <br/>`;
            });
            tableHtml += `<tr><td>${item.id}</td><td>${htmlskins}</td><td>${item.description}</td></tr>`;
          });
          tableHtml += "</table>";
          callback(null,tableHtml);
        }
      });
}
function DrawIndex(req,res,fs,serverstarttimestamp,loggedin)
{
    
    fs.readFile('src/static/index.html', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        
        
        
        DrawCases((error,casesarr)=>{
            db.GetCasesAmount((error, casesAmount) => {
                if (error) {
                  res.send("Error: " + error.message);
                } else {
                  res.send(data.replace("%userlogs%", loggedin)
                               .replace("%serverruntime%", (Date.now() - serverstarttimestamp) / 1000)
                               .replace("%cases%", casesAmount)
                              .replace("%casetables%",casesarr));
                }
              });
        });
      });
}
module.exports = {DrawIndex}