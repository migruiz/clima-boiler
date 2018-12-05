const EventEmitter = require( 'events' );
var Zone = require('./ZonesManager/Zone.js');
class BoilerValve  extends EventEmitter {
    constructor(zoneCode) {
      this.zones=[];
    }
    addZone(zoneCode){
        zones.push(new Zone(zoneCode))  
    }
    async initAsync(){
        for (let index = 0; index < this.zones.length; index++) {
            var zone=this.zones[index];
            await zone.initAsync()
            var self=this
            zone.on('stateChanged',function(reportingzone){
                self.emit('stateChanged',self);
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