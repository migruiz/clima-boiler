var amqp = require('amqplib');
var await = require('asyncawait/await');
var async = require('asyncawait/async');
var queueListener = require('./rabbitQueueListenerConnector.js')

function monitorQueue(amqpURI, individualValveManager) {

    queueListener.listenToQueue(amqpURI, 'individualValve', { durable: false, noAck: true }, function (ch, msg) {
        var content = msg.content.toString();
        console.log(" [x] Received '%s'", content);
        var valveState = JSON.parse(content);
        var asyncFx = async(function () {
            await(individualValveManager.setValveStateAsync(valveState));
        })
        asyncFx();
    });
}

exports.startMonitoring = function (individualValveManager) {
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    monitorQueue(internetAMQPURI, individualValveManager);
    monitorQueue(intranetAMQPURI, individualValveManager);
}