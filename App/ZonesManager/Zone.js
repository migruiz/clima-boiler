const EventEmitter = require( 'events' );
const ZoneOnOffModule=require('./ZoneOnOffModule.js');
const ZoneTemperatureLimitModule=require('./ZoneTemperatureLimitModule.js');
class Zone extends EventEmitter {
    constructor(zoneCode) {
      super()
      this.zoneCode=zoneCode;
      this.modules=[];
      this.zoneCode=zoneCode;
    }
    async initAsync(){
      this.modules.push(new ZoneOnOffModule(this.zoneCode));
      this.modules.push(new ZoneTemperatureLimitModule(this.zoneCode));
      var self=this
      for (let index = 0; index < this.modules.length; index++) {
        var module=this.modules[index];
        await module.initAsync();
        module.on('stateChanged',function(){
          self.emit('stateChanged',self);
        })

      }
      
    }

    getisCallingForHeat(){
      var heatStatePriorities = [];
      for (let index = 0; index < this.modules.length; index++) {
        var module=this.modules[index];
        var isActive=module.getIsActive();
        if (isActive){
          var callingForHeat=module.getisCallingForHeat()
          var priority=callingForHeat?module.OnPriority:module.OffPriority
          heatStatePriorities.push({value:callingForHeat,priority:priority})
        }
      }
      var listOrderedByPriority=heatStatePriorities.sort((a, b) => a.priority-b.priority);
      var hightestPriority=listOrderedByPriority[0]
      return hightestPriority.value;

    }
  }

  module.exports = Zone;