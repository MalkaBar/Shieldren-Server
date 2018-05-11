const { spawn }     = require('child_process');
var algoController  = require('../controllers/algorithmControler');
var debug           = require('../configuration').db.monitor;

module.exports = class WhatsApp {
    constructor(socket, phone) {
        this.uniuqeID = null;
        this.socket = socket;
        this.subproccess = spawn('python',["c:\\Omer\\Studies\\WebSocket\\script.py", phone], { detached: true });
        this.subproccess.stdout.on('data', (data) => { this.dataReceived(data.toString()); });
        this.subproccess.stderr.on('data', (data) => { console.log('ERR: ' + data); });
        this.subproccess.on('exit', (data) => { console.log('Close connection for ' + this.uniuqeID); });
    }

    dataReceived(data) {
        try {
            data = JSON.parse(data);
            switch (data.code) {
                case 0:
                    break;
                case 1:             //Send QR to user
                    this.socket.emit('qrArrived', data.data.toString());
                    break;
                case 2:             //Notify user about successful scan
                    this.socket.emit('qrScanned', "");
                    break;
                case 3:
                    algoController.save(data.data);
                    break;
                case 5:
                    this.uniuqeID = data.seesionID;
                    break;
                default:
                    throw newError();
            }
        }
        catch (ex) {
            this.socket.emit('ProcessError', 'Error received. close process.');
            this.subproccess.kill();
        }
    }
};