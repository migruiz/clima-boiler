
var mqtt = require('./mqttCluster.js');
var Zone = require('./ZonesManager/Zone.js');
class BoilerValve{
    constructor(boilerValve) {
       this.boilerValve=boilerValve;
      this.zones=[];
    }
    addZone(zoneCode){
        this.zones.push(new Zone(zoneCode))  
    }
    async initAsync(){
        var self=this
        for (let index = 0; index < this.zones.length; index++) {
            var zone=this.zones[index];
            await zone.initAsync()
            zone.on('stateChanged',async function(reportingzone){
                var shouldBeOn=self.getValveNeededState();
                var mqttCluster=await mqtt.getClusterAsync() 
                mqttCluster.publishData('automaticboilercontrol/'+self.boilerValve,shouldBeOn)
              })
          }
    }
    getValveNeededState(){
        for (let index = 0; index < this.zones.length; index++) {
            var zone=this.zones[index];
            var zoneCallingForHeat=zone.getisCallingForHeat()
            if (zoneCallingForHeat)
                return true;
          }
          return false
    }
}

module.exports = BoilerValve;