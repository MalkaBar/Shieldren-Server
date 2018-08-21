var db = require("../core/db");

function Statistics () {}

Statistics.prototype.verify = (_parentID, _childID) => {
    return new Promise((resolve, reject) => {
        if (!_parentID || !_childID) {
            reject(new Error("Missing Arguments"));
        } else {
            db.run("SELECT * FROM [shieldren].[children] WHERE parentid = '" + _parentID + "' and childid = '" + _childID + "';", (err, data) => {
                if (err) {
                    reject(new Error("Child not found"));
                    return;
                } else {
                    if (data.length == 1) resolve(data[0]);
                    else reject(new Error("Child not found"));
                }
            });
        }
    });
}

Statistics.prototype.get = function (_childReceiverPhone, _startDate, _endDate) {
    return new Promise(function(resolve, reject) {
        let _request = [];
            _request.push("SELECT *");
            _request.push("FROM (SELECT reciever, convert(varchar, timestamp, 102) AS date, count(*) AS count");
            _request.push("FROM [shieldren].[messages]");
            _request.push("WHERE reciever = '" + _childReceiverPhone + "'");
            _request.push("AND convert(DATETIME , '" + _startDate + " 00:00:00.000', 102) <= convert(DATETIME, timestamp ,102)");
            _request.push("AND convert(DATETIME, timestamp ,102) <= convert(DATETIME , '" + _endDate + " 23:59:59.999', 102)");
            _request.push("GROUP BY reciever, convert(varchar, timestamp, 102)) as a");
        db.run(_request.join(" ").toString(), function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

module.exports = new Statistics;