var mqtt = require('./mqttCluster.js');
var zonesCreator = require('./ZonesManager/Zone.js');
global.config = {
    zwaveDriverPath: '/dev/ttyACM0',
    dbPath: 'c:\\valves.sqlite',
    intranetAMQPURI: process.env.TEMPQUEUEURL,
    internetAMQPURI: 'amqp://ikuaqslf:B6blp8fWqyBE4Ya7NBXhhVEk1guTw-M8@impala.rmq.cloudamqp.com/ikuaqslf',
    valves: {
        upstairsValve: { nodeId: 5, instanceId: 1, code: 'upstairsValve' },
        downstairsValve: { nodeId: 5, instanceId: 3, code: 'downstairsValve' },
        testValve: { nodeId: 4, instanceId: 1, code: 'testValve' },
        hotWaterValve: { nodeId: 4, instanceId: 3, code: 'hotWaterValve' }
    }
};
global.zones= {
    masterroom: { sensorId: 'BC', boilerZone: 'upstairs' },    
    livingroom: { sensorId: 'E9', boilerZone: 'downstairs'},
    playroom: { sensorId: 'C1', boilerZone: 'upstairs' },  
    masterbathroom: { sensorId: 'E0', boilerZone: 'upstairs' }, 
    computerroom: { sensorId: 'CC', boilerZone: 'upstairs'},
    secondbedroom: { sensorId: 'C6', boilerZone: 'upstairs' },
    outside: { sensorId: 'CD' },
}



var ZWaveMockMan = require('./ZWaveMock.js');

global.mtqqLocalPath = "mqtt://localhost";
(async function(){
    for (var key in global.zones) {
        var zone=global.zones[key]
        zone.zoneControl=await zonesCreator.newInstanceAsync(key)
        zone.zoneControl.on('stateChanged',function(reportingzone){
            var isCallingForHeat=reportingzone.getisCallingForHeat();
            console.log(reportingzone.zoneCode)
            console.log(isCallingForHeat)
          })
    }
    var mqttCluster=await mqtt.getClusterAsync() 
    mqttCluster.subscribeData('zonesChange', onZoneReadingUpdate);
    async function onZoneReadingUpdate(content) {
        console.log(content)
        var zone=global.zones[content.zoneCode]
        zone.zoneControl.updateCurrentTemperature(content.temperature)
    }
  })();


return;


//var ZWave = require('./node_modules/openzwave-shared/lib/openzwave-shared.js');
var os = require('os');
var individualValvesManagerCreator = require('./individualValveManager.js');
var zonesValvesManagerCreator = require('./ZonesManager/ZonesValvesManager.js');
var individualValveOperationReceiver = require('./individualValveOperationReceiver.js');
var znodeValuesListener = require('./ValvesValueChangesListener.js');
var valvesStateRequestReceiver = require('./valvesStateRequestReceiver.js');
var zonesValvesConfigurationReceiver = require('./zonesValvesConfigurationReceiver.js');
var firebaseSyncReceiver = require('./firebaseSyncReceiver.js');







//var zwave = new ZWave({ ConsoleOutput: false });
var zwave = new ZWaveMockMan.ZWaveMock();


zwave.on('scan complete', function () {
    var individualValveManager = individualValvesManagerCreator.getInstance(zwave);

    var zonesValvesManager = zonesValvesManagerCreator.getInstance(individualValveManager);

    individualValveOperationReceiver.startMonitoring(individualValveManager);
    valvesStateRequestReceiver.startMonitoring(individualValveManager);

    var valvesValueChangesListener = znodeValuesListener.getInstance(individualValveManager);
    zwave.on('value changed', valvesValueChangesListener.handleChange);

    firebaseSyncReceiver.startMonitoring();

    zonesValvesConfigurationReceiver.startMonitoring(zonesValvesManager);
    zonesValvesManager.startMonitoring();
});



zwave.on('driver failed', function () {
    console.log('failed to start driver');
    zwave.disconnect();
    process.exit();
});

zwave.connect(global.config.zwaveDriverPath);
process.on('SIGINT', function () {
    console.log('disconnecting...');
    zwave.disconnect(global.config.zwaveDriverPath);
    process.exit();
});
