const mysql = require('mysql');
const cfg = require("../config.json")
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
        console.log("Successfully connected to Database!");
    })
    conn.query(cfg.casestable);
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
module.exports = { conn, InitDB,FetchCases };