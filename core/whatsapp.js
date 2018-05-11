const { spawn }     = require('child_process');
var algoController  = require('../controllers/algorithmControler');
var debug           = require('../configuration').db.monitor;

module.exports = class WhatsApp {
    constructor(socket, phone) {
        this.uniuqeID = null;
        this.socket = socket;
        this.subproccess = spawn('python',["C:\\Program Files (x86)\\WebWhatsAPI-master\\sample\\sample.py", phone], { detached: true });
        this.subproccess.stdout.on('data', (data) => { this.dataReceived(data.toString()); });
        this.subproccess.stderr.on('data', (data) => { console.log('ERR: ' + data); });
        this.subproccess.on('exit', (data) => { console.log('Close connection for ' + this.uniuqeID); });
    }

    dataReceived(message) {
        try {
            let obj = JSON.parse(message);
            switch (obj.code) {
                case 0:
                    break;
                case 1:             //Send QR to user
                    console.log('QR: Send to user [' + obj.data.toString() + ']');
                    this.socket.emit('qrArrived', obj.data.toString());
                    break;
                case 2:             //Notify user about successful scan
                    this.socket.emit('qrScanned', "scanned");
                    this.socket.disconnect(true);
                    break;
                case 3:
                    algoController.save(obj.data, (err) => {
                        if (err) { console.log('Error: ' + ex); }
                    });
                    break;
                case 5:
                    this.uniuqeID = obj.seesionID;
                    break;
                default:
                    throw newError();
            }
        }
        catch (ex) {
            console.log('Error: ' + ex);
            this.socket.emit('qrError', 'Error received. close process.');
        }
    }
};