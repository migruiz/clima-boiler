var queueListener = require('./rabbitQueueListenerConnector.js')

function monitorQueue(amqpURI, individualValveManager) {
    queueListener.listenToQueue(amqpURI, 'valvesStateRequestMock', { durable: false, noAck: true }, async function (ch, msg) {
        await individualValveManager.requestValvesState();
    });
}

exports.startMonitoring = function (individualValveManager) {
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    monitorQueue(internetAMQPURI, individualValveManager);
    //monitorQueue(intranetAMQPURI, individualValveManager);






};