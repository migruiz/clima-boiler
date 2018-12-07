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
global.mtqqLocalPath = "mqtt://piscos.tk";
//global.mtqqLocalPath = process.env.MQTTLOCAL;
global.dbPath= 'c:\\valves.sqlite';
//global.dbPath = '/ClimaBoiler/valves.sqlite';
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
    mqttCluster.subscribeData("AllZonesConfigRequest",async () =>{
        var zonesConfigList=[];
        var zones=global.boilerValves.upstairs.zones.concat(global.boilerValves.downstairs.zones)
        for (var key in zones) {
            var zone=zones[key]
            var zoneConfig=zone.getZoneBoilerConfig()
            zonesConfigList.push(zoneConfig)
        }
        var mqttCluster=await mqtt.getClusterAsync() 
        mqttCluster.publishData("AllZonesConfigResponse",zonesConfigList)
    });
  }

process.on('SIGINT', function () {
    process.exit();
});
