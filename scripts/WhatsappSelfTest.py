import json
import time
import sys

def JsonPrint(code, session, message, jsonRecievedData=None):
    data = {}
    data["sessionID"] = str(session)
    data["code"] = code
    data["message"] = str(message)
    if(jsonRecievedData):
         data['data'] = jsonRecievedData
    else:
         data['data'] = "null"
    json_string = json.dumps(data)
    print json_string
    sys.stdout.flush()

def GenerateQR():
    data = {}
    qr = """
    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
    """
    qr = qr.replace('\n    ','').strip()
    chunk_size = 1000
    for index in range(0,(len(qr)/chunk_size+1)):
        chunk = qr[((index) * chunk_size):((index) * chunk_size)+chunk_size]
        data['chunk'] = chunk
        data['len'] = len(chunk)
        if (index == (len(qr)/chunk_size)): 
            data['index'] = -1
        else:
            data['index'] = index
        JsonPrint(1, 1234, "QR", data)

def Main():
    JsonPrint(5, 1234, "Start")
    time.sleep(2)
    GenerateQR()
    time.sleep(2)
    JsonPrint(2, 1234, "Scan Succeeded")
    time.sleep(2)
    while True:
        paramTime = time.strftime("%Y-%m-%d %H:%M:%S")
        data = {
            "caller": '972544665536',
            "callee": '0524592005',
            "timestamp": paramTime,
            "message": 'I want a static message',
            "group": True
        }
        JsonPrint(2, 1234, "userMessage", data)
        time.sleep(5)

Main()