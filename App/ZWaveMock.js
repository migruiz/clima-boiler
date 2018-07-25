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
}


exports.ZWaveMock = ZWaveMock;