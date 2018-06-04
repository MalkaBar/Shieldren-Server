import json
import time
import sys

while True:
    paramTime = time.strftime("%Y-%m-%d %H:%M:%S")
    data = {
        "sessionID": "123456",
        "code": 3,
        "message": "userMessage",
        "data": {
            # did the the action
            "caller": '972544665536',
            # send to
            "callee": '0524592005',
            "timestamp": paramTime,
            "message": 'I want a static message',
            "group": True
        }
    }
    json_string = json.dumps(data)
    print json_string
    sys.stdout.flush()
    time.sleep(30)