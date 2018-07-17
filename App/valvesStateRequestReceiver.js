var await = require('asyncawait/await');
var async = require('asyncawait/async');
var queueListener = require('./rabbitQueueListenerConnector.js')

function monitorQueue(amqpURI, individualValveManager) {
    queueListener.listenToQueue(amqpURI, 'valvesStateRequest', { durable: false, noAck: true }, function (ch, msg) {
        var asyncFx = async(function () {
            await(individualValveManager.requestValvesState());
        })
        asyncFx();
    });
}

exports.startMonitoring = function (individualValveManager) {
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    monitorQueue(internetAMQPURI, individualValveManager);
    monitorQueue(intranetAMQPURI, individualValveManager);






};