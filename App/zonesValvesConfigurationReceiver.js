var amqp = require('amqplib');
var queueListener = require('./rabbitQueueListenerConnector.js')
var sqlRepository = require('./sqliteValvesRepository');

async function monitorRegulateSettingQueue(amqpURI, zonesValvesManager) {

    queueListener.listenToQueue(amqpURI, 'zoneRegulateSetting', { durable: false, noAck: true },async function (ch, msg) {
        var content = msg.content.toString();
        console.log(" [x] Received '%s'", content);
        var zoneRegulateChange = JSON.parse(content);
        await zonesValvesManager.setZoneValveAutoRegulatedEnabledAsync(zoneRegulateChange.zoneCode, zoneRegulateChange.enabled);
        await broadcastCurrentSettingsAsync();
    });
}

async function monitorTargetTemperatureQueue(amqpURI, zonesValvesManager) {
    queueListener.listenToQueue(amqpURI, 'zoneMinimumTemperatureSetting', { durable: false, noAck: true }, async function (ch, msg) {
        var content = msg.content.toString();
        console.log(" [x] Received '%s'", content);
        var zoneTargetTemperatureChange = JSON.parse(content);
        await zonesValvesManager.setZoneTargetTemperatureAsync(zoneTargetTemperatureChange.zoneCode, zoneTargetTemperatureChange.zoneMinimumTemperature.toFixed(1));
        await broadcastCurrentSettingsAsync();
    });
}
async function monitorGetZonesConfig(amqpURI) {

    queueListener.listenToQueue(amqpURI, 'getZoneSetting', { durable: false, noAck: true }, async function (ch, msg) {
        await broadcastCurrentSettingsAsync();
    });
}

async function monitorZoneCommand(amqpURI) {

    queueListener.listenToQueue(amqpURI, 'zoneCommand', { durable: false, noAck: true },async function (ch, msg) {
        var content = msg.content.toString();
        console.log(" [x] Received '%s'", content);
        var zoneCommand = JSON.parse(content);
        await zonesValvesManager.processZoneCommandAsync(zoneCommand);
        await broadcastCurrentSettingsAsync();
    });
}



exports.startMonitoring = function (zonesValvesManager) {
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    monitorRegulateSettingQueue(internetAMQPURI, zonesValvesManager);
    monitorRegulateSettingQueue(intranetAMQPURI, zonesValvesManager);
    monitorTargetTemperatureQueue(intranetAMQPURI, zonesValvesManager);
    monitorTargetTemperatureQueue(internetAMQPURI, zonesValvesManager);
    monitorGetZonesConfig(intranetAMQPURI, zonesValvesManager);
    monitorGetZonesConfig(internetAMQPURI, zonesValvesManager);
}




function broacastToChannel(uri, ZoneValvesSettings) {
    amqp.connect(uri).then(function (conn) {
        return conn.createChannel().then(function (ch) {
            var ex = 'ZoneValvesSettingsZoneValvesSettings';
            var msg = JSON.stringify(ZoneValvesSettings);

            var ok = ch.assertExchange(ex, 'fanout', { durable: false });

            return ok.then(function (_qok) {
                // NB: `sentToQueue` and `publish` both return a boolean
                // indicating whether it's OK to send again straight away, or
                // (when `false`) that you should wait for the event `'drain'`
                // to fire before writing again. We're just doing the one write,
                // so we'll ignore it.
                ch.publish(ex, '', Buffer.from(msg));
                return ch.close();
            });
        }).finally(function () { conn.close(); });
    }).catch(console.warn);
}



async function broadcastCurrentSettingsAsync() {
    var zoneValveSettings = await sqlRepository.getZonesValvesConfig();
    var jsonObject = { list: zoneValveSettings };
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    broacastToChannel(internetAMQPURI, jsonObject);
    broacastToChannel(intranetAMQPURI, jsonObject);
}