
var sqlRepository = require('./../sqliteValvesRepository');


function SmartBoostZoneControl() {

    var moduleActive;
    var callForHeatController;
    var targetTemperature;
    var currentTemperature;

    this.setTargetTemperature = function (newTargetTemperature) {
        console.log('targetTemperature');
        console.log(targetTemperature);
        console.log('newTargetTemperature');
        console.log(newTargetTemperature);
        console.log('currentTemperature');
        console.log(currentTemperature);
        var targetTemperatureChanged = currentTemperature && newTargetTemperature != targetTemperature;
        targetTemperature = newTargetTemperature;
        if (targetTemperatureChanged) {
            console.log('setTargetTemperature.targetTemperatureChanged');
            terminateModule();
        }
        onStateChanged();
    }

    this.shouldStopCallingForHeat = function () {
        if (!moduleActive)
            return false;
        var heatControllCallingForHeat = callForHeatController.isCallingForHeat();
        if (!heatControllCallingForHeat)
            return true;
        return false;
    };

    function getModuleShouldBeActive() {
        if (!targetTemperature)
            return false;
        if (!currentTemperature)
            return false;
        if (currentTemperature >= targetTemperature) {
            return false;
        }
        else {
            var delta = targetTemperature - currentTemperature;
            delta = delta.toFixed(1);
            if (delta <= 0.2) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    this.onNewZoneReading = function (newTemperature) {
        currentTemperature = newTemperature;
        onStateChanged();
    }
    function onStateChanged() {
        var moduleShouldBeActive = getModuleShouldBeActive();
        if (moduleShouldBeActive) {
            startModule();
        }
        else {
            terminateModule();
        }
    }
    function startModule() {
        if (moduleActive)
            return;
        moduleActive = true;
        callForHeatController = new CallForHeatController(function () {
            terminateModule();
        });
        callForHeatController.start();
    }
    function terminateModule() {
        moduleActive = false;
        callForHeatController = null;
    }



    function CallForHeatController(afterTempControllerTimesOut) {
        var callingForHeat;
        this.isCallingForHeat = function () {
            return callingForHeat;
        }
        this.start = function () {
            console.log("smart boost Started");
            console.log(Math.floor(new Date() / 1000));
            callingForHeat = true;
            setTimeout(afterInitialBoost, 1000 * 60 * 10);
        }

        function afterInitialBoost() {
            callingForHeat = false;
            setTimeout(function () {
                afterTempControllerTimesOut();
            }, 1000 * 60 * 20);
        }
    }






}

function DeadZoneSensorControl() {
    var zoneDownBecuaseZoneDead = false;
    var zoneNotAliveHandler;

    this.onNewZoneReading = function () {
        clearTimeout(zoneNotAliveHandler);
        zoneDownBecuaseZoneDead = false;
        zoneNotAliveHandler = setTimeout(function () {
            zoneDownBecuaseZoneDead = true;
        }, 1000 * 60 * 30);
    }
    this.isZoneDead = function () {
        return zoneDownBecuaseZoneDead;
    }
}

function BoostZoneControl(zoneCode, boostInfo) {
    var callingForHeat;
    var boostHandler;

    constructor(boostInfo);

    function constructor(boostInfo) {
        if (!boostInfo.boostEnabled)
            return;
        var currentTime = Math.floor(new Date() / 1000);
        var projectedFinishTime = boostInfo.boostStartTime + boostInfo.boostTime;
        var timeToFinish = projectedFinishTime - currentTime;
        var enabled = timeToFinish > 0;
        if (enabled) {
            startBoostInternally(timeToFinish);
        }
    }

    this.startBoostAsync = async function (boostTime) {
        var boostStartTime = Math.floor(new Date() / 1000);
        startBoostInternally(boostTime);
        var boostNewInfo = {
            boostTime: boostTime,
            boostStartTime: boostStartTime
        };
        await sqlRepository.setZoneValveBoostInfo(zoneCode, boostNewInfo);

    }
    function startBoostInternally(boostTime) {
        callingForHeat = true;
        boostHandler = null;
        var boostTimeMilis = 1000 * boostTime;
        boostHandler = setTimeout(function () {
            this.stopBoost();
        }, boostTimeMilis);
    }
    this.stopBoost = function () {
        clearTimeout(boostHandler);
        callingForHeat = false;
    }
    this.isCallingForHeat = function () {
        return callingForHeat;
    }
}

async function Zone(zoneCode, onZoneChangedAsync) {
    var lastReading;
    var deadZoneControl = new DeadZoneSensorControl();
    var smartBoostZoneControl = new SmartBoostZoneControl();
    var boostZoneControl;
    var zoneRegulatinSetting;

    var zoneConfig = await sqlRepository.getZoneValveConfigByZoneCodeAsync(zoneCode);
    smartBoostZoneControl.setTargetTemperature(zoneConfig.zoneMinimumTemperature);
    zoneRegulatinSetting = zoneConfig;
    var boostInfo = {
        boostTime: zoneConfig.boostTime,
        boostStartTime: zoneConfig.boostStartTime,
        boostEnabled: zoneConfig.boostEnabled
    };
    boostZoneControl = new BoostZoneControl(zoneCode, boostInfo);
    this.startBoost = boostZoneControl.startBoost;
    this.stopBoost = BoostZoneControl.stopBoost;



    this.ingestReadingAsync = async function (zoneReading) {
        lastReading = zoneReading;
        deadZoneControl.onNewZoneReading();
        smartBoostZoneControl.onNewZoneReading(zoneReading.temperature);
        await onZoneChangedAsync();
    }
    this.setZoneTargetTemperatureAsync =async function (temperature) {
        await(sqlRepository.setZoneValveinimumTemperature(zoneCode, temperature));
        zoneRegulatinSetting = await(sqlRepository.getZoneValveConfigByZoneCodeAsync(zoneCode));
        smartBoostZoneControl.setTargetTemperature(zoneRegulatinSetting.zoneMinimumTemperature);
        await onZoneChangedAsync();
    }
    this.setZoneValveAutoRegulatedEnabledAsync =async function (enabled) {
        await(sqlRepository.setZoneValveAutoRegulatedEnabled(zoneCode, enabled));
        zoneRegulatinSetting = await(sqlRepository.getZoneValveConfigByZoneCodeAsync(zoneCode));
        smartBoostZoneControl.setTargetTemperature(zoneRegulatinSetting.zoneMinimumTemperature);
        await onZoneChangedAsync();
    }
    this.isCallingForHeatAsync = function () {
        if (boostZoneControl.isCallingForHeat()) {
            return true;
        }
        if (!lastReading)
            return false;
        if (!zoneRegulatinSetting.zoneAutoRegulateEnabled) {
            return false;
        }
        else {
            if (lastReading.temperature < zoneRegulatinSetting.zoneMinimumTemperature) {
                var controlsWantToStopHeat = getControlsWantToStopHeat();
                if (controlsWantToStopHeat)
                    return false;
                return true;
            }
        }
        return false;
    }
    function getControlsWantToStopHeat() {
        if (deadZoneControl.isZoneDead()) {
            console.log("zone reported dead");
            console.log(Math.floor(new Date() / 1000));

            return true;
        }
        if (smartBoostZoneControl.shouldStopCallingForHeat()) {
            console.log("smart boost turned zone off");
            console.log(Math.floor(new Date() / 1000));
            return true;
        }
        return false;
    }
}
exports.newInstance = function (zoneCode, onZoneChangedAsync) {
    var instance = new Zone(zoneCode, onZoneChangedAsync);
    return instance;
}