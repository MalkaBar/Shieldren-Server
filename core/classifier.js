var { spawn }     = require('child_process');
var { Algorithm } = require('../configuration');
var db = require('../core/db');
var uniqid = require('uniqid');

var ClasiffierSentences = {}

class Classifier {
    constructor() {
        this.subproccess = spawn(Algorithm.executer, [Algorithm.path], { stdio: 'pipe'});
        this.subproccess.stdout.on('data', (data) => { processRecievedData(data.toString()); });
        this.subproccess.stderr.on('data', (data) => { console.log('[Classifier] ' + data.toString()); });
        this.subproccess.on('exit', (data) => { console.log('[Classifier] been exited'); });
    }

    clasiffy(sentenceData) {
        let identifier = uniqid();
        ClasiffierSentences[identifier] = sentenceData;
        this.subproccess.stdin.write('{"id": ' + identifier + ', "sentence": "' + sentenceData.sentence + '"}\n');
        console.log('[Classifier] Sentence send to clasification: ' + sentenceData.sentence);
    }
}

function processRecievedData(data)
{
    try {
        console.log('[CLASSIFIER] JSON ARRIVED:' + data);
        let obj = JSON.parse(data);
        switch (obj.code) {
            case 1:             // Model have loaded and calssifier ready to start
                console.log('[Classifier] Finish loading.');
                break;
            case 2:             // Classify sentence been recieved
                console.log(JSON.stringify(data));
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

                    if (obj.data.classification == 1)
                    {
                        let sentenceData = ClasiffierSentences[identifier];
                        delete ClasiffierSentences[identifier];
                        sentenceData.group = sentenceData.group?1:0; 
                        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + sentenceData.caller + "', '" + sentenceData.callee + "', '" + sentenceData.timestamp + "', '" + sentenceData.group + "', '" + sentenceData.message + "'); ",
                            (err, result) => { 
                                if (err) return err;
                             }
                        );
                    }
                break;
            case 3:             // Script start to run. Loading the model.
                console.log('[Classifier] Start loading');
                break;
            default:            // Errors
                throw new Error(data);
        }
    }
    catch(err) { console.log('[Classifier] Error: ' + err); }
}

module.exports = new Classifier();