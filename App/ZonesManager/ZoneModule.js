const EventEmitter = require( 'events' );
class ZoneModule extends EventEmitter {
    constructor(zoneCode) {
      super()
      this.zoneCode=zoneCode;
    }
    async initAsync() {}
    
    getCallingForHeatPriority(){}

  }
  module.exports = ZoneModule;
 