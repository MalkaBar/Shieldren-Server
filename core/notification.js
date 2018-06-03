var UrbanAirShip     = require('urban-airship-push');
var { Notification } = require('../configuration');

class Notify {
    constructor(key, secret, masterSecret){
        this.urbanAirshipPush = new UrbanAirshipPush({
            'key': Notification.key,
            'secret': Notification.secret,
            'masterSecret': Notification.masterSecret
        });
    }
    Notice (notification, recipient, callback) {
        if (notification)
        {
            if (!recipient) recipient = 'all';

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
    }
}

module.exports = new Notify()