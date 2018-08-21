const Connection = require('tedious').Connection;
const Request    = require('tedious').Request;
const { db }     = require('../configuration');

var connection = new Connection(db.config);

connection.on('connect', (err) => {
    if (err) {
        console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[31mERROR\x1b[0m: Failed connection to server [' + db.config.server + ']\n');
        return;
    } else {
        console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[32mCONNECTION\x1b[0m: Open connection to server [' + db.config.server + ']\n');

        let request = new Request("UPDATE [shieldren].[children] SET qrStatus = 0;", (err) => {
            if (err) console.log("[\x1b[33mSQL SERVER\x1b[0m] \x1b[31mERROR\x1b[0m: Failed initilize children status");
        });
        connection.execSql(request);
    }
    
});
connection.on('debug', function(text) {
    if (db.monitor) console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[36mDEBUG\x1b[0m: ' + text);
});
connection.on('errorMessage', (err) => {
    if (db.monitor) console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[31mERROR\x1b[0m: ' + JSON.stringify(err));
});
connection.on('infoMessage', (err) => {
    if (db.monitor) console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[36mINFO\x1b[0m: ' + JSON.stringify(err));
});
connection.on('end', () => {
    console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[31mCONNECTION\x1b[0m: Connection have been close');
    
    setTimeout(() => {
        connection.reset(() => {
            console.log('[\x1b[33mSQL SERVER\x1b[0m]\x1b[31mCONNECTION\x1b[0m: Restarted.');
            connection = new Connection(db.config);
        });
    },60000);
});

module.exports = {
    run: (command, callback) => {
        if (!command)
            return callback(new Error('Missing Arguments'), null);

        if (db.monitor) console.log('[\x1b[33mSQL SERVER\x1b[0m] \x1b[33mCommand\x1b[0m: ' + command);

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