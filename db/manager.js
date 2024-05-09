const mysql = require('mysql');
const cfg = require("../config.json")
const conn = mysql.createConnection({
  host: cfg.dbhost,
  user: cfg.dbuser,
  password: cfg.dbpass,
  database: cfg.dbname
});
function InitDB()
{
    conn.connect(function(err){
        if (err) throw err;
        console.log("Successfully connected to Database!");
    })
    conn.query(cfg.casestable);
}

module.exports = { conn, InitDB };