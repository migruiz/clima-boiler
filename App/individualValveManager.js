var await = require('asyncawait/await');
var async = require('asyncawait/async');
var valvesCreator = require('./valve.js');

function IndividualValveManager(zwave) {
    var valvesZConfig = global.config.valves;
    this.valves = {
        upstairsValve: valvesCreator.newInstance({ zwave: zwave, nodeId: valvesZConfig.upstairsValve.nodeId, instanceId: valvesZConfig.upstairsValve.instanceId, code: valvesZConfig.upstairsValve.code }),
        downstairsValve: valvesCreator.newInstance({ zwave: zwave, nodeId: valvesZConfig.downstairsValve.nodeId, instanceId: valvesZConfig.downstairsValve.instanceId, code: valvesZConfig.downstairsValve.code }),
        testValve: valvesCreator.newInstance({ zwave: zwave, nodeId: valvesZConfig.testValve.nodeId, instanceId: valvesZConfig.testValve.instanceId, code: valvesZConfig.testValve.code }),
        hotWaterValve: valvesCreator.newInstance({ zwave: zwave, nodeId: valvesZConfig.hotWaterValve.nodeId, instanceId: valvesZConfig.hotWaterValve.instanceId, code: valvesZConfig.hotWaterValve.code })

    };
    this.setValveStateAsync = function (valveState) {
        var targetValve = this.valves[valveState.code];
        await(targetValve.setStateAsync(valveState.mode));
    };
    this.handleValveStateChange = function (valveReading) {
        for (var valveKey in this.valves) {
            this.valves[valveKey].handleValveStateChange(valveReading);
        }
    }
    this.requestValvesState = function () {
        zwave.requestNodeState(4);
        zwave.requestNodeState(5);
    }
}


exports.getInstance = function (zwave) {
    var manager = new IndividualValveManager(zwave);
    return manager;
};