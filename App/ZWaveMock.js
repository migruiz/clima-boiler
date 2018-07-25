function ZWaveMock(){
    this.requestNodeState = function (nodeId) {
        broacastState(nodeId);
    }
    var valves = {
        4: {
            1: false,  //testValve
            3: false //hotwater
        },
        5: {
            1: false,  //upstaisvalve
            3: false  //downstairsvalve
        },
    };
    
    this.setValue = function (nodeId, commandId, instanceId, subId, state) {
        valves[nodeId][instanceId] = state;
        valueChangedHandler(nodeId, 37, state);
    }
    var valueChangedHandler;
    this.on = function (command, action) {
        console.log("mock on " + command);
        if (command.localeCompare('scan complete')==0) {
            action();
        }
        else if (command.localeCompare('value changed')==0) {
            valueChangedHandler = action;
        }
    }
    this.disconnect = function () {
        console.log("mock disconnecting");
    }
    this.connect = function () {
        console.log("mock connect");
    }

    function broacastState(nodeId) {
        var node = valves[nodeId];
        for (var instance in node) {
            var state = node[instance];
            valueChangedHandler(nodeId, 37, { value: state, instance: instance, class_id: 37 });
        }
    }
}


exports.ZWaveMock = ZWaveMock;