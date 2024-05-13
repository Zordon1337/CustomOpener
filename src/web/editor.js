var db = require("../db/manager");
function GetSkinsJson(value) {
    return new Promise((resolve, reject) => {
        db.conn.query(`SELECT * FROM skins WHERE id = ?`, [value], (error, results, fields) => {
            if (error) {
                reject(error); 
            } else {
                resolve(results); 
            }
        });
    });
}
function DrawEditor(req,res,fs)
{
    
    fs.readFile('src/static/editor.html', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        
        
        
    });

}
module.exports = {GetSkinsJson}