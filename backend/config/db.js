const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'root',
    database: process.env.MYSQLDATABASE || 'healthhub_db',
    port: process.env.MYSQLPORT || 3306
});
module.exports = pool.promise();
