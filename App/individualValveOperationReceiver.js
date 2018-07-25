var amqp = require('amqplib');
var queueListener = require('./rabbitQueueListenerConnector.js')

function monitorQueue(amqpURI, individualValveManager) {

    queueListener.listenToQueue(amqpURI, 'individualValveMock', { durable: false, noAck: true },async function (ch, msg) {
        var content = msg.content.toString();
        console.log(" [x] Received '%s'", content);
        var valveState = JSON.parse(content);
        await individualValveManager.setValveStateAsync(valveState);
    });
}

exports.startMonitoring = function (individualValveManager) {
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    monitorQueue(internetAMQPURI, individualValveManager);
   // monitorQueue(intranetAMQPURI, individualValveManager);
}