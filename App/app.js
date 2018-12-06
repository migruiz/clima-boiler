var mqtt = require('./mqttCluster.js');
const BoilerValve=require('./BoilerValve')
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
//global.mtqqLocalPath = "mqtt://localhost";
global.mtqqLocalPath = process.env.MQTTLOCAL;
//global.dbPath= 'c:\\valves.sqlite';
global.dbPath = '/ClimaBoiler/valves.sqlite';
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
    mqttCluster.subscribeData('automaticboilercontrol/upstairs',function(content) {
        console.log('automaticboilercontrol/upstairs')
        console.log(content)
    })
    mqttCluster.subscribeData('automaticboilercontrol/downstairs',function(content) {
        console.log('automaticboilercontrol/downstairs')
        console.log(content)
    })
  }

process.on('SIGINT', function () {
    process.exit();
});
