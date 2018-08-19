var UrbanAirshipPush = require('urban-airship-push');
var { Notification } = require('../configuration');

class Notify {
    constructor(){
        this.urbanAirshipPush = new UrbanAirshipPush({
            'key': Notification.key,
            'secret': Notification.secret,
            'masterSecret': Notification.masterSecret
        });
    }
    Notice (notification, recipient = "all", callback = null) {
        if (callbakc && typeof callback === 'function')
        {
            if (notification)
            {
                this.urbanAirshipPush.push.send({
                    'device_types': 'all',
                    'audience': recipient,
                    'notification': {
                        'alert': notification
                    }
                 }, (err) => {
                     if (err) callback(err, recipient);
                     else callback(null, recipient);
                 });
            }
            else callback(new Error('No message to sent'), recipient);
        } else {
            return new Promise(function(resolve, reject) {
                if (!notification) {
                    reject(new Error("No notification has received"));
                    return;
                }
                try {
                    let conf = {
                        'device_types': 'all',
                        'audience': recipient,
                        'notification': {
                            'alert': notification
                        }
                    };
                    this.urbanAirshipPush.push.send(conf, function (err, data) { 
                        if (err) reject(err);
                        else     resolve(data);
                    });
                } catch (err) {
                    reject(err);
                    return;
                }
            });
        }
    }
}

module.exports = new Notify()