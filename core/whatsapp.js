var { spawn }     = require('child_process');
var algoController  = require('../controllers/algorithmControler');
var debug           = require('../configuration').db.monitor;
var { Script }      = require('../configuration');

module.exports = class WhatsApp {
    constructor(socket, data) {
        this.uniuqeID = null;
        this.socket = socket;
        
        algoController.pullChildData(data.child, (err, result) => {
            if (err) {
                console.log('WhatsApp Error: ' + err);
                this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
                socket.disconnect(true);
            } else {
                this.childInfo = result;
                this.subproccess = spawn(Script.executer, [Script.path, this.childInfo.phoneNumber], { detached: true });
                this.subproccess.stdout.on('data', (data) => { this.dataReceived(data.toString()); });
                this.subproccess.stderr.on('data', (data) => { console.log('Whatsapp Error: ' + data); });
                this.subproccess.on('exit', (data) => { console.log('Whatsapp: Close connection for ' + this.uniuqeID); });
            }
        });
        
    }

    dataReceived(message) {
        try {
            let obj = JSON.parse(message);
            switch (obj.code) {
                case 0:             //Whatsapp session been logout
                    break;
                case 1:             //Send QR to user
                    this.socket.emit('qrArrived', obj.data.toString());
                    break;
                case 2:             //Notify user about successful scan
                    algoController.qrBeenScanned(this.childInfo.childid, (err) => {
                        if (err) { this.socket.emit('qrError', 'Error while update DB. retry again in 1 minute(s).'); }
                        else {
                            this.socket.emit('qrScanned','QR been scanned. closing session.');
                            this.socket.disconnect(true);
                        }
                    });                    
                    break;
                case 3:             //New message received
                    algoController.save(obj.data, (err) => {
                        if (err) { console.log('Whatsapp Error: ' + err); }
                    });
                    break;
                case 5:             //Child process start to run
                    this.uniuqeID = obj.seesionID;
                    break;
                default:
                    continue;
            }
        }
        catch (err) {
            console.log('Error: ' + err);
            this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
        }
    }
};