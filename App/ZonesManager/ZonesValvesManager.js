var zonesCreator = require('./Zone.js')
var queueListener = require('./../rabbitQueueListenerConnector.js')


function ZonesValvesManager(individualValveManager) {
    var zones = {
        masterroom: zonesCreator.newInstance('masterroom',onZoneChangedAsync),
        computerroom: zonesCreator.newInstance('computerroom',onZoneChangedAsync),
        secondbedroom: zonesCreator.newInstance('secondbedroom',onZoneChangedAsync),
        masterbathroom: zonesCreator.newInstance('masterbathroom',onZoneChangedAsync),
        livingroom: zonesCreator.newInstance('livingroom',onZoneChangedAsync),
        entrance: zonesCreator.newInstance('entrance',onZoneChangedAsync)
    }
    var valvesZones = {
        upstairs: [zones.masterroom, zones.computerroom, zones.masterbathroom, zones.secondbedroom],
        downstairs: [zones.livingroom, zones.entrance]
    };

    async function onZoneChangedAsync() {
        var upstairsValveOn = valveNeedsToBeOnAsync(valvesZones.upstairs);
        var downstairsValveOn = valveNeedsToBeOnAsync(valvesZones.downstairs);

        var upstairsValveNewState = { code: "upstairsValve", mode: upstairsValveOn };
        await individualValveManager.setValveStateAsync(upstairsValveNewState);

        var downstairsValveNewState = { code: "downstairsValve", mode: downstairsValveOn };
        await individualValveManager.setValveStateAsync(downstairsValveNewState);
    }


    function isaValidRequest(zonesReadingRequest) {
        var currentTimestamp = Math.floor(new Date() / 1000);
        var requestTimestamp = zonesReadingRequest.timestamp;
        var elapsedTimeSinceRequest = currentTimestamp - requestTimestamp;
        return elapsedTimeSinceRequest < 10;

    }
    this.setZoneValveAutoRegulatedEnabledAsync = async function (zoneCode, enabled) {
        var zone = zones[zoneCode];
        await zone.setZoneValveAutoRegulatedEnabledAsync(enabled);
    }


    this.processZoneCommandAsync = async function (command) {
        var zone = zones[command.zoneCode];
        if (command.type == "boostZone") {
            if (command.boostEnabled) {
                zone.startBoost(command.boostTime);
            }
            else {
                zone.stopBoost();
            }
        }
        else if (command.type == "autoRegulateEnabled") {
            await zone.setZoneValveAutoRegulatedEnabledAsync(enabled);
        }
        else if (command.type == "targetAutoRegulatedTemperature") {
            await zone.setZoneTargetTemperatureAsync(command.targetTemperature);
        }
    }

    this.setZoneTargetTemperatureAsync = async function (zoneCode, temperature) {
        var zone = zones[zoneCode];
        await zone.setZoneTargetTemperatureAsync(temperature);
    }
    async function processZoneTemperatureAsync(zoneReadingRequest) {
        if (!isaValidRequest(zoneReadingRequest))
            return;
        var zoneReading = zoneReadingRequest.zoneReading;
        var zone = zones[zoneReading.zoneCode];
        if (zone)
            await zone.ingestReadingAsync(zoneReading);

    }

    this.startMonitoring = function () {
        queueListener.listenToQueue(global.config.intranetAMQPURI, 'zoneReadingUpdate', { durable: false, noAck: true }, async function (ch, msg) {
            var content = msg.content.toString();
            var zoneReadingRequest = JSON.parse(content);
            await processZoneTemperatureAsync(zoneReadingRequest);
        });
    }


    async function valveNeedsToBeOnAsync(zones) {
        for (var i = 0; i < zones.length; i++) {
            var zone = zones[i];
            if (await zone.isCallingForHeatAsync()) {
                return true;
            }
        }
        return false;
    }
}







exports.getInstance = function (individualValveManager) {
    var manager = new ZonesValvesManager(individualValveManager);
    return manager;
}















