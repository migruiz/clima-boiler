
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
            zone.on('stateChanged',function(reportingzone){
                var shouldBeOn=self.getValveNeededState();
                console.log(self.boilerValve)
                console.log(shouldBeOn)
              })
          }
    }
    reportTemperaturaChange(zoneCode,temperature){
        for (let index = 0; index < this.zones.length; index++) {
            var zone=this.zones[index];
            if (zone.zoneCode===zoneCode)
            {
                zone.updateCurrentTemperature(temperature)
                return
            }
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