const mysql = require('mysql');
const dbConfig = require('./db-config');

let connection;

function getConnection() {
    if (!connection) {
        connection = mysql.createConnection(dbConfig);
    }
    return connection;
}

module.exports = getConnection;
