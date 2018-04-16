const Connection              = require('tedious').Connection;
const Request                 = require('tedious').Request;
const { dbConfig, SQLDebug }  = require('../configuration');

var connection = new Connection(dbConfig);

connection.on('connect', (err) => {
    if (err) {
        console.log('\033[0;31m[SQL SERVER]\033[0m Faile connection to server [' + dbConfig.server + ']\n');
    } else {
        console.log('\033[0;32m[SQL SERVER]\033[0m Open connection to server [' + dbConfig.server + ']\n'); 
    }
});
connection.on('debug', function(text) {
    if (SQLDebug) console.log('\033[0;35m[SQL DEBUG]\033[0m' + text);
});
connection.on('errorMessage', (err) => {
    if (SQLDebug) console.log('\031[0;31m[SQL ERROR]\033[0m' + JSON.stringify(err));
});
connection.on('infoMessage', (err) => {
    if (SQLDebug) console.log('\036[0;34m[SQL INFO]\033[0m' + JSON.stringify(err));
});
module.exports = {
    run: (command, callback) => {
        if (!command)
            return callback(new Error('Missing Arguments'), null);

        console.log('\033[0;33m[SQL SERVER] COMMAND\033[0m: ' + command);

        var result = [];

        request = new Request(command, (err, value) => {
            if (err) return callback(err,null);
            else { return callback(null, result) }
        });
        request.on('row', (columns) => {
            var row = {};
            columns.forEach((column) => {
                row[column.metadata.colName] = column.value;
            });
            result.push(row);
        });
       
        connection.execSql(request);
    }
};