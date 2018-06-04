var { spawn }      = require('child_process');
var algoController = require('../controllers/algorithmControler');
var debugMode      = require('../configuration').db.monitor;
var { Script }     = require('../configuration');

module.exports = class WhatsApp {
    constructor(socket, data) {
        this.uniuqeID = null;
        this.socket = socket;
        
        algoController.pullChildData(data.child, (err, result) => {
            if (err) {
                if (debugMode) console.log('[WHATSAPP] Error: ' + err);
                this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
                socket.disconnect(true);
            } else {
                this.childInfo = result;
                this.subproccess = spawn(Script.executer, [Script.path, this.childInfo.phoneNumber], { detached: true });
                this.subproccess.stdout.on('data', (data) => { this.dataReceived(data.toString()); });
                this.subproccess.stderr.on('data', (data) => { if (debugMode) console.log('[WHATSAPP] Error: ' + data); });
                this.subproccess.on('exit', (data) => { console.log('[WHATSAPP] Close connection for ' + this.uniuqeID); });
            }
        });    
    }

    dataReceived(message) {
        try {
            if (debugMode) console.log('[WHATSAPP] JSON ARRIVED:' + message);
            let obj = JSON.parse(message);
            switch (obj.code) {
                case -1:
                    this.subproccess.kill('SIGTERM');
                case 0:             //Whatsapp session been logout
                    break;
                case 1:             //Send QR to user
                    this.socket.emit('qrArrived', obj.data.toString());
                    break;
                case 2:             //Notify user about successful scan
                    algoController.qrBeenScanned(this.childInfo.childid, (err) => {
                        if (err) { return this.socket.emit('qrError', 'Error while update DB.'); }
                        this.socket.emit('qrScanned','QR been scanned. closing session.');
                        this.socket.disconnect(true);
                    });                    
                    break;
                case 3:             //New message received
                    if (debugMode) console.log('[Whatsapp] message been sent to classifier: ' + JSON.stringify(data));
                    algoController.sentenceRecieved(obj.data);
                    break;
                case 5:             //Child process start to run
                    this.uniuqeID = obj.seesionID;
                    break;
                default:
                    if (debugMode) console.log('[WHATSAPP] DEBUG:' + message);
            }
        }
        catch (err) {
            console.log('[WHATSAPP] Error: ' + err);
            this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
        }
    }
};