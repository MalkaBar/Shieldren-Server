const { spawn }     = require('child_process');
var algoController  = require('../controllers/algorithmControler');
var debug           = require('../configuration').db.monitor;

module.exports = {
    start: (socket, phone) => {
        var bool = false;

        const _child = spawn('python',["c:\\Program Files (x86)\\WebWhatsAPI-master\\sample\\sample.py", phone], {
            detached: true,
        });

        if (debug) console.log("Start python code");

        _child.on('error', (err) => {
            if (debug) console.log('EXEC ERROR: ' + err);
            socket.emit('response',{'message': 'qr', 'value': 'error', 'data':  err.message});
        });
        _child.on('exit', function(code, signal) {
            if (debug) {
                if (signal) { console.log('EXEC EXIT: Code = ' + code + ' | Signal' + signal); }
                else { console.log('EXEC EXIT: Code = ' + code); }
            }
            socket.emit('response',{'message': 'qr', 'value': 'exit'});
        });
        _child.stdout.on('data', (data) => {
            if (bool) {
                console.log('RETRIEVE DATA: ' + data);
                var str = '{"timestamp": "2018-04-27 13:29:08", "caller": "0586664440", "callee": "0544665536", "message": "u\'\\u05d2\\u05e9\'", "group": true }';
                
                try { algoController.save(str, (err, data) => {
                    if (err) { console.log("Error while insert data to db."); }
                }); }
                catch (err) { console.log("Error while parsing data."); }
            } else {
                if (data.toString().trim() == 'Scan Succeeded') {
                    bool = !bool;
                    socket.emit('response', {'message': 'qr', 'value': 'success'});
                    socket.disconnect(true);
                    if (debug) console.log("EXEC: Start writing to database");
                } else {
                    if (debug) console.log('SEND QR: ' + data);
                    socket.emit('response', {'message': 'qr', 'value': 'scan', 'data': data.toString()});
                }
            }
        });
        _child.stderr.on('data', (data) => {
            if (debug) console.log('EXEC: Exit with error');
        });
    }
};
