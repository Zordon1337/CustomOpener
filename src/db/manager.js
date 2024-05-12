const mysql = require('mysql');
const cfg = require("../config.json")
const utils = require("../Utils");
const conn = mysql.createConnection({
  host: cfg.dbhost,
  user: cfg.dbuser,
  password: cfg.dbpass,
  database: cfg.dbname
});
const json5 = require("json5");
function InitDB()
{
    conn.connect(function(err){
        if (err) throw err;
        utils.Log("Successfully connected to Database!");
    })
    conn.query(cfg.casestable);
    conn.query(cfg.devicetable);
}
async function FetchCases() {
    return new Promise((resolve, reject) => {
      conn.query('SELECT * FROM cases', (err, rows) => {
        if (err) return reject(err);
        
        const data = rows.map(row => {
          const skins = json5.parse((row.skins));
          return {
            type: row.type,
            name: row.name,
            id: row.id,
            iconURL: row.iconURL,
            tag: row.tag,
            baseColor: row.baseColor,
            showKnives: row.showKnives,
            showPercent: row.showPercent,
            minimalVersion: row.minimalVersion,
            platforms: row.platforms,
            endTime: row.endTime,
            sideBanner: row.sideBanner,
            sideBannerTarget: row.sideBannerTarget,
            cornerLabel: row.cornerLabel,
            premium_only: row.premium_only,
            trialAvailable: row.trialAvailable,
            skins: skins
          };
        });
        
        resolve(data);
      });
    });
  }
function SaveDeviceInfo(playerid,token,uuid,isRooted,deviceModel,os,lang)
{
  const values = {
    playerID: playerid,
    token: token,
    uuid: uuid,
    isRooted: isRooted,
    deviceModel: deviceModel,
    os: os,
    language: lang
  };
  const query = `INSERT INTO deviceinfo(playerID, token, uuid, isRooted, deviceModel, os, language) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  conn.query(query, [values.playerID, values.token, values.uuid, values.isRooted, values.deviceModel, values.os, values.language], (error, results, fields) => {
    if (error) throw error;
    
  });
  
}
function GetCasesAmount(callback) {
  conn.query("SELECT COUNT(*) AS rowCount FROM cases", (error, results, fields) => {
    if (error) {
      console.error('Error counting rows:', error);
      callback(error, null);
    } else {
      if (results && results.length > 0) {
        const rowCount = results[0].rowCount;
        console.warn(rowCount);
        callback(null, rowCount);
      } else {
        callback(null, 0); // Return 0 if no rows found
      }
    }
  });
}

module.exports = { conn, InitDB,FetchCases,SaveDeviceInfo,GetCasesAmount };