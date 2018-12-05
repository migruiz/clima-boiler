const EventEmitter = require( 'events' );
class ZoneModule extends EventEmitter {
    constructor(zoneCode) {
      super()
      this.zoneCode=zoneCode;
    }
    async initAsync() {}
    
    getCallingForHeatPriority(){}
    reportStateChange(){
      this.emit( 'stateChanged');
    }

  }
  module.exports = ZoneModule;
 