const { spawn } = require('child_process');

module.exports = {
    start: (socket, phone) => {
        var bool = false;

        const _child = spawn('python',['c:/Program Files (x86)/WebWhatsAPI-master/sample/sample.py', phone], {
            detached: true,
        });

        console.log("Start python code");

        _child.on('error', (err) => {
            console.log('EXEC ERROR: ' + err);
            socket.emit('response',{'message': 'qr', 'value': 'error', 'data':  err.message});
        });
        _child.on('exit', function(code, signal) {
            if (signal) { console.log('EXEC EXIT: Code = ' + code + ' | Signal' + signal); }
            else { console.log('EXEC EXIT: Code = ' + code); }
            socket.emit('response',{'message': 'qr', 'value': 'exit'});
        });
        _child.stdout.on('data', (data) => {
            if (bool) {
                console.log('RETRIEVE DATA: ' + data);
            } else {
                if (data.toString().trim() == 'Scan Succeeded') {
                    console.log("EXEC: Start writing to database");
                    socket.emit('response', {'message': 'qr', 'value': 'success'});
                    bool = !bool;
                    socket.emit('response', {'message': 'qr', 'value': 'success'});
                } else {
                    console.log('SEND QR: ' + data);
                    socket.emit('response', {'message': 'qr', 'value': 'scan', 'data': data});
                }
            }
        });
        _child.stderr.on('data', (data) => {
            console.log('EXEC: Exit with error');
            process.exit(1);
        });
    }
};
