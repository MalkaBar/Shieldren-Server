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
    Notice (notification, client) {
        if (notification)
            this.urbanAirshipPush.push.send({
                'device_types': 'all',
                'audience': 'all',
                'notification': {
                    'alert': notification
                }
             }, (err) => {
                 if (err) return console.log('[Notify] Failed to notification to client ' + client);
                 return console.log('[Notify] Sent to client ' + client);
             });
    }
}

module.exports = new Notify()