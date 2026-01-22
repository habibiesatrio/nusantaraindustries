// const mysql = require('mysql');
const dbConfig = require('../services/db-config');

let connection;

function getConnection() {
    if (!connection) {
        connection = mysql.createConnection(dbConfig);
    }
    return connection;
}

module.exports = getConnection;
