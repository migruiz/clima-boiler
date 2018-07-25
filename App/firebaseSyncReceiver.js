var queueListener = require('./rabbitQueueListenerConnector.js');
var rp = require('request-promise');
var FbCentralProjectURL = 'https://centralstation-cdc47.firebaseio.com/';

function SendChangetoFirebaseAsync(valveReading) {
    return rp({
        url: FbCentralProjectURL + 'valvesChanges/' + valveReading.code + '/' + valveReading.timestamp.toString() + '.json',
        method: 'PUT',
        json: valveReading
    });
}


exports.startMonitoring = function () {
    return;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    queueListener.listenToQueue(intranetAMQPURI, 'firebaseSyncQueue', { durable: true, noAck: false }, async function (ch, msg) {
        console.log("firebase");
        var content = msg.content.toString();
        var valveReading = JSON.parse(content);
        console.log(valveReading);
        try {
            await SendChangetoFirebaseAsync(valveReading);
            ch.ack(msg);
        }
        catch (err) {
            console.log(err);
            setTimeout(function () {
                ch.reject(msg, true);
            }, 1000);
        }
    });
}