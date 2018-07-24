function ZWaveMock(){
    this.requestNodeState = function (nodeId) {

        
        var node = valves[nodeId];
        for (var instance in node) {
            var state = node[instance];
            valueChangedHandler(nodeId, 37, new { value: state, instance: instance, class_id: 37 });
        }
    }
    var valves = {
        4: {
            1: 0,  //testValve
            3: 0 //hotwater
        },
        5: {
            1: 0,  //upstaisvalve
            3: 0  //downstairsvalve
        },
    };
    
    this.setValue = function (nodeId, commandId, instanceId, subId, state) {
        val[nodeId][instanceId] = state;
        valueChangedHandler(nodeId, 37, state);
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