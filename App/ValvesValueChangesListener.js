function ValvesValueChangesListener(individualValveManager) {

    this.handleChange = function (nodeid, comclass, value) {
        var valveReading = {
            nodeId: nodeid,
            instanceId: value.instance,
            value: value.value,
            commandType: value.class_id,
            timestamp: Math.floor(new Date() / 1000)
        };
        individualValveManager.handleValveStateChange(valveReading);
    }
}

exports.getInstance = function (individualValveManager) {
    var listener = new ValvesValueChangesListener(individualValveManager);
    return listener;
};