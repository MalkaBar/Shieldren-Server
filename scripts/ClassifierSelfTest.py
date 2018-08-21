#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import threading
import json
import time

print '{ "code": 3, "message": "Start load model.", "data": null }'
sys.stdout.flush()


class Classify (threading.Thread):
    def __init__(self, sentence, id):
        threading.Thread.__init__(self)
        self.ID = id
        self.sentence = sentence
        self.classification = -1

    def run(self):
        if (self.sentence == None):
            self.printJson()
        else:
            self.classification = 1
            self.printJson()

    def printJson(self):
        result = {
            "code": 2,
            "message": "classification result",
            "data": {
                "identifier":  self.ID,
                "classification": self.classification
            }
        }
        print json.dumps(result)
        sys.stdout.flush()


threads = []

time.sleep(10)
print '{ "code": 1, "message": "End load model. Start waiting for sentences.", "data": null }'
sys.stdout.flush()

while True:
    stringInput = raw_input()
    if (stringInput == None):
        pass
    else:
        try:
            jsonData = json.loads(stringInput)
            if (len(jsonData[jsonData.keys()[1]]) <= 0):
                pass
            else:
                thread = Classify(jsonData[jsonData.keys()[1]], jsonData[jsonData.keys()[0]])
                thread.start()
                threads.append(thread)
        except Exception as err:
            print '{ "code": -1, "message": "%s", "data": null }' % sys.exc_info()[0]
            sys.stdout.flush()
