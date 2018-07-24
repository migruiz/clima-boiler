var valvesCreator = require('./valve.js');

function HeatingValvesManager(valvesZConfig,zwave) {
    this.valves = {
        upstairsValve: valvesCreator.newInstance({ zwave: zwave, nodeId: valvesZConfig.upstairsValve.nodeId, instanceId: valvesZConfig.upstairsValve.instanceId, code: valvesZConfig.upstairsValve.code }),
        downstairsValve: valvesCreator.newInstance({ zwave: zwave, nodeId: valvesZConfig.downstairsValve.nodeId, instanceId: valvesZConfig.downstairsValve.instanceId, code: valvesZConfig.downstairsValve.code })
    };
    this.setValvesStateAsync =async function (valvesState) {
        await this.valves.upstairsValve.setStateAsync(valvesState.upstairsValveMode);
        await this.valves.downstairsValve.setStateAsync(valvesState.downstairsValveMode);
    };
}


exports.getInstance = function (valvesZConfig, zwave) {
    var manager = new HeatingValvesManager(valvesZConfig, zwave);
    return manager;
}