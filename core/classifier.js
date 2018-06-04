var { spawn }     = require('child_process');
var { Algorithm } = require('../configuration');
var debugMode     = require('../configuration').db.monitor;
var db            = require('../core/db');
var uniqid        = require('uniqid');
var notification = require('./notification');

var ClasiffierSentences = {}

class Classifier {
    constructor() {
        this.subproccess = spawn(Algorithm.executer, [Algorithm.path], { stdio: 'pipe'});
        this.subproccess.stdout.on('data', (data) => { processRecievedData(data.toString()); });
        this.subproccess.stderr.on('data', (data) => { if (debugMode) console.log('[CLASSIFIER] ' + data.toString()); });
        this.subproccess.on('exit', (data) => { console.log('[CLASSIFIER] been exited'); });
    }

    clasiffy(sentenceData) {
        let identifier = uniqid();
        ClasiffierSentences[identifier] = sentenceData;
        this.subproccess.stdin.write('{"id": "' + identifier + '", "sentence": "' + sentenceData.message.toString() + '"}\n');
        if (debugMode) console.log('[CLASSIFIER] Sentence send to clasification: ' + sentenceData.message);
    }
}

function processRecievedData(data)
{
    try {
        if (debugMode) console.log('[CLASSIFIER] JSON ARRIVED:' + data);
        let obj = JSON.parse(data);
        switch (obj.code) {
            case 1:             // Model have loaded and calssifier ready to start
                console.log('[CLASSIFIER] Finish loading.');
                break;
            case 2:             // Classify sentence been recieved
                if (debugMode) console.log(JSON.stringify(data));
                    /***
                     * @TODO: 
                     *      1. update user
                     *      2. save sentences
                     * 
                     *  Received output from classifier
                     * 
                     * {
                     *  "message": "classification result",
                     *  "code": 2,
                     *  "data":
                     *      {
                     *          "classification": 1,
                     *          "identifier": 1001,
                     *          "sentence": "\u05d0\u05d9\u05d6\u05d4 \u05d9\u05d5\u05dd \u05e9\u05de\u05d7 \u05dc\u05d9 \u05d4\u05d9\u05d5\u05dd"
                     *      }
                     * }
                     * 
                     * ***/
                let sentenceData = ClasiffierSentences[obj.data.identifier];
                delete ClasiffierSentences[obj.data.identifier];
                sentenceData.group = sentenceData.group?1:0;

                switch (obj.data.classification)
                {
                    case 1:
                        notification.Notice('.הורה יקר, ילדך נמצא תחת איום',null, (err, recipient) => {
                            if (err) console.log('[Notify] Failed to notification to client ' + recipient);
                            else console.log('[Notify] Sent to client ' + recipient);
                        });
                    case -1:
                        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + sentenceData.caller + "', '" + sentenceData.callee + "', '" + sentenceData.timestamp + "', '" + sentenceData.group + "', '" + sentenceData.message + "'); ",
                            (err, result) => { 
                                if (err) return err;
                                }
                        );
                        break;
                    default:
                }
                break;
            case 3:             // Script start to run. Loading the model.
                console.log('[CLASSIFIER] Start loading');
                break;
            default:            // Errors
                throw new Error(data);
        }
    }
    catch(err) { console.log('[CLASSIFIER] Error: ' + err); }
}

module.exports = new Classifier();