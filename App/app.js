var mqtt = require('./mqttCluster.js');
const BoilerValve=require('./BoilerValve')
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
global.zonesConfiguration= {
    masterroom: 'upstairs',   
    livingroom:  'downstairs',
    playroom:  'upstairs', 
    masterbathroom:  'upstairs',
    computerroom:  'upstairs',
    secondbedroom: 'upstairs'
}
global.boilerValves={
    upstairs:new BoilerValve('upstairs'),
    downstairs:new BoilerValve('downstairs')
}


var ZWaveMockMan = require('./ZWaveMock.js');

global.mtqqLocalPath = "mqtt://localhost";
(async function(){
    for (var key in global.zonesConfiguration) {
        var zoneConfig=global.zonesConfiguration[key]
        var boilerValve=global.boilerValves[zoneConfig]
        boilerValve.addZone(key) 
    }
    await global.boilerValves.upstairs.initAsync();
    await global.boilerValves.downstairs.initAsync();
    var mqttCluster=await mqtt.getClusterAsync() 
    subscribeToEvents(mqttCluster)

  })();

  function subscribeToEvents(mqttCluster){
    mqttCluster.subscribeData('zonesChange', function(content) {
        global.boilerValves.upstairs.reportTemperaturaChange(content.zoneCode,content.temperature)
        global.boilerValves.downstairs.reportTemperaturaChange(content.zoneCode,content.temperature)
    });
    mqttCluster.subscribeData('automaticboilercontrol/upstairs',function(content) {
        console.log('automaticboilercontrol/upstairs')
        console.log(content)
    })
    mqttCluster.subscribeData('automaticboilercontrol/downstairs',function(content) {
        console.log('automaticboilercontrol/downstairs')
        console.log(content)
    })
  }

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
