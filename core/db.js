const Connection    = require('tedious').Connection;
const Request       = require('tedious').Request;
const { dbConfig, debug }  = require('../configuration');

var connection = new Connection(dbConfig);

connection.on('connect', (err) => {
    if (err) {
        console.log('\033[0;31m[SQL SERVER]\033[0m Faile connection to server [' + dbConfig.server + ']\n');
    } else {
        console.log('\033[0;32m[SQL SERVER]\033[0m Open connection to server [' + dbConfig.server + ']\n'); 
    }
});
connection.on('debug', function(text) {
    if (debug) console.log('\033[0;35m[SQL DEBUG]\033[0m' + text);
});
connection.on('errorMessage', (err) => {
    if (debug) console.log('\031[0;31m[SQL ERROR]\033[0m' + JSON.stringify(err));
});
connection.on('infoMessage', (err) => {
    if (debug) console.log('\036[0;34m[SQL INFO]\033[0m' + JSON.stringify(err));
});
module.exports = {
    run: (command, callback) => {
        if (!command)
            return callback(new Error('Missing Arguments'), null);

        console.log('\033[0;33m[SQL SERVER] COMMAND\033[0m: ' + command);

        var result = [];
        var pass = false;

        request = new Request(command);

        request.on ('doneProc', (rowCount, more, returnStatus) => {
            if (returnStatus == 2627) { return callback(new Error('DUPLICATE KEY')); }
            else { return callback(null, result); }
        });

        request.on('row', (columns) => {
            var row = {};
            columns.forEach((column) => {
                row[column.metadata.colName] = column.value;
            });
            result.push(row);
        });
        request.on('error', (err) => {
            return callback(err, null);
        });
        connection.execSql(request);
    }
};