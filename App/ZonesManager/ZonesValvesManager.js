var await = require('asyncawait/await');
var async = require('asyncawait/async');
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
        upstairs: [zones.masterroom, zones.computerroom, zones.masterbathroom, zones.secondbedroom, zones.entrance],
        downstairs: [zones.livingroom]
    };

    function onZoneChangedAsync() {
        var upstairsValveOn = await(valveNeedsToBeOnAsync(valvesZones.upstairs));
        var downstairsValveOn = await(valveNeedsToBeOnAsync(valvesZones.downstairs));

        var upstairsValveNewState = { code: "upstairsValve", mode: upstairsValveOn };
        await(individualValveManager.setValveStateAsync(upstairsValveNewState));

        var downstairsValveNewState = { code: "downstairsValve", mode: downstairsValveOn };
        await(individualValveManager.setValveStateAsync(downstairsValveNewState));
    }


    function isaValidRequest(zonesReadingRequest) {
        var currentTimestamp = Math.floor(new Date() / 1000);
        var requestTimestamp = zonesReadingRequest.timestamp;
        var elapsedTimeSinceRequest = currentTimestamp - requestTimestamp;
        return elapsedTimeSinceRequest < 10;

    }
    this.setZoneValveAutoRegulatedEnabledAsync = function (zoneCode,enabled) {
        var zone = zones[zoneCode];
        await(zone.setZoneValveAutoRegulatedEnabledAsync(enabled));
    }
    this.setZoneTargetTemperatureAsync = function (zoneCode, temperature) {
        var zone = zones[zoneCode];
        await(zone.setZoneTargetTemperatureAsync(temperature));
    }
    function processZoneTemperatureAsync(zoneReadingRequest) {
        if (!isaValidRequest(zoneReadingRequest))
            return;
        var zoneReading = zoneReadingRequest.zoneReading;
        var zone = zones[zoneReading.zoneCode];
        if (zone)
            await(zone.ingestReadingAsync(zoneReading));

    }

    this.startMonitoring = function () {
        queueListener.listenToQueue(global.config.intranetAMQPURI, 'zoneReadingUpdate', { durable: false, noAck: true }, function (ch, msg) {
            var content = msg.content.toString();
            var zoneReadingRequest = JSON.parse(content);
            var asyncFx = async(function () {
                await(processZoneTemperatureAsync(zoneReadingRequest));
            })
            asyncFx();
        });
    }


    function valveNeedsToBeOnAsync(zones) {
        for (var i = 0; i < zones.length; i++) {
            var zone = zones[i];
            if (await(zone.isCallingForHeatAsync())) {
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















