var { spawn }      = require('child_process');
var algoController = require('../controllers/algorithmControler');
var debugMode      = require('../configuration').db.monitor;
var { Script }     = require('../configuration');
var notification   = require('./notification');

module.exports =
class WhatsApp {
    constructor(socket, data) {
        this.uniuqeID = null;
        this.socket = socket;

        algoController.pullChildData(data.child, (err, result) => {
            if (err) {
                if (debugMode) errorMessage(err);
                this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
            } else {
                var buffer = "";
                this.childInfo = result;
                this.subproccess = spawn(Script.executer, [Script.path, this.childInfo.phoneNumber], { detached: true });
                this.subproccess.stdout.on('data', (data) => {
                    try {
                        this.dataReceived(JSON.parse(data.toString()));
                        buffer = "";
                    } catch (err) {
                        try {
                            this.dataReceived(JSON.parse(buffer + data.toString()));
                            buffer = "";
                        } catch (err){
                            buffer += data.toString();
                        }
                    }
                }); 
                this.subproccess.stderr.on('data', (data) => { errorMessage('Error: ' + data); });
                this.subproccess.on('exit', (data) => {
                    errorMessage('Close connection for ' + this.uniuqeID + "[" + data + "]");
                    algoController.qrBeenClosed(this.childInfo.childid, (err, data) => {
                        if (err) { errorMessage(err); }
                        else debugMessage("Exit Reason: " + data);
                    });
                    notification.Notice('.הורה יקר, ילדך התנתק מהמערכת, על כן ילדך אינו מוגן',null, (err, recipient) => {
                        if (err) console.log('[Notify] Failed to notification to client ' + recipient);
                        else console.log('[Notify] Sent to client ' + recipient);
                     });
                });
            }
        });
    }

    dataReceived(json) {
        switch (json.code) {
            case -1:
                this.subproccess.kill('SIGTERM');
                break;
            case 1:             //Send QR to user
                this.socket.emit('qrArrived', json.data);
                break;
            case 2:             //Notify user about successful scan
                algoController.qrBeenScanned(this.childInfo.childid, (err) => {
                    if (err) {
                         this.socket.emit('qrError', 'Error while update DB.');
                    } else {
                        this.socket.emit('qrScanned','QR been scanned. closing session.');
                        this.socket.disconnect(true);
                    }
                });                    
                break;
            case 3:             //New message received
                debugMessage("Message been sent to classifier: " + JSON.stringify(json.data))
                algoController.sentenceRecieved(json.data);
                break;
            case 5:             //Child process start to run
                normalMessage('Start Whatsapp session [' + json.sessionID + ']')
                this.uniuqeID = json.sessionID;
                break;
            default:
                debugMessage('Default: ' + message);
                break;
        }
    }
};

function debugMessage(message)  { if (debugMode) console.log("[\x1b[35mWHATSAPP\x1b[0m] \x1b[36mDEBUG\x1b[0m: " + message); }
function errorMessage(message)  { console.log("[\x1b[35mWHATSAPP\x1b[0m] \x1b[36mERROR\x1b[0m: " + message); }
function normalMessage(message) { console.log("[\x1b[35mWHATSAPP\x1b[0m] " + message); }