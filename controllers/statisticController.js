var db      = require("../core/db");
var moment  = require("moment");

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
            _request.push("FROM (SELECT convert(varchar, timestamp, 103) AS date, count(*) AS count");
            _request.push("FROM [shieldren].[messages]");
            _request.push("WHERE reciever = '" + _childReceiverPhone + "'");
            _request.push("AND convert(DATETIME , '" + _startDate + " 00:00:00.000', 102) <= convert(DATETIME, timestamp ,102)");
            _request.push("AND convert(DATETIME, timestamp ,102) <= convert(DATETIME , '" + _endDate + " 23:59:59.999', 102)");
            _request.push("GROUP BY reciever, convert(varchar, timestamp, 103)) as a");
        db.run(_request.join(" ").toString(), function (err, data) {
            if (err) {
                reject(err);
            } else {
                var result = {};
                let start = new Number(new Date(_startDate)) + 0;
                let end = new Number(new Date(_endDate)) + 0;
                for (; start <= end;  start += (1000*60*60*24)) {
                    let dd = new Date(start).getDate();
                    let mm = new Date(start).getMonth() + 1;
                    let yyyy = new Date(start).getFullYear();
                    result[(dd < 10 ? '0':'') + dd.toString() + '/' + (mm < 10?'0':'') + mm.toString() + '/' + yyyy.toString()] = 0;
                }
                for(key in data) {
                    result[data[key].date] = data[key].count;
                }
                resolve(result);
            }
        });
    });
}

Statistics.prototype.last = function(_childReceiverPhone, _last_X_sentences) {
    return new Promise(function(resolve, reject) {
        let _request = [];
            _request.push("SELECT TOP " + _last_X_sentences + "*");
            _request.push("FROM [shieldren].[messages]");
            _request.push("WHERE reciever = '" + _childReceiverPhone + "';");
        db.run(_request.join(" ").toString(), function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

module.exports = new Statistics;