function ZWaveMock(){
    this.requestNodeState= function (nodeId) {
        action(nodeid, comclass, value);
    }
    var valves = {
        4: {
            1: 0,
            3: 0
        },
        5: {
            1: 0,
            3: 0
        },
    };
    
    this.setValue = function (nodeId, commandId, instanceId, subId, state) {
        val[nodeId][instanceId] = state;
        valueChangedHandler(nodeId, commandId, state);
    }
    var valueChangedHandler;
    this.on= function (command, action) {
        if (command.localeCompare('scan complete')) {
            action();
        }
        else if (command.localeCompare('value changed')) {
            valueChangedHandler = action;
        }
    }
}