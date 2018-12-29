var mqtt = require('../mqttCluster.js');
const EventEmitter = require( 'events' );
const ZoneOnOffModule=require('./ZoneOnOffModule.js');
const ZoneTemperatureLimitModule=require('./ZoneTemperatureLimitModule.js');
const ZoneSmartInitialBoostModule=require('./ZoneSmartInitialBoostModule.js');
class Zone extends EventEmitter {
    constructor(zoneCode) {
      super()
      this.zoneCode=zoneCode;
      this.modules=[];
      this.zoneCode=zoneCode;
      this.onOffModule=new ZoneOnOffModule(this.zoneCode);
      this.limitModule=new ZoneTemperatureLimitModule(this.zoneCode)
    }
    getZoneBoilerConfig(){
      var zoneConfig={zoneCode:this.zoneCode, regulated:this.onOffModule.Monitored,targetTemperature:this.limitModule.LowestAllowedTemperature}
      return zoneConfig
    }
    getLimitModuleTargetTemperature(){
        return this.limitModule.LowestAllowedTemperature
    }
    async initAsync(){
      this.modules.push(this.onOffModule);
      this.modules.push(this.limitModule);
      this.modules.push(new ZoneSmartInitialBoostModule(this.zoneCode));
      var self=this


      for (let index = 0; index < this.modules.length; index++) {
        var module=this.modules[index];
        await module.initAsync();
        module.on('stateChanged',function(){
          self.emit('stateChanged',self);
        })
      }

      var mqttCluster=await mqtt.getClusterAsync() 
      mqttCluster.subscribeData("zoneIsMonitored/"+this.zoneCode,async function(content) {
        for (let index = 0; index < self.modules.length; index++) {
          var module=self.modules[index];
          if (module.reportZoneIsMonitoredEventAsync){
           await module.reportZoneIsMonitoredEventAsync(content)
          }
        }
        var zoneConfig=self.getZoneBoilerConfig()
        mqttCluster.publishData("zoneBoilerChange",zoneConfig)
        self.emit('stateChanged',self);
      }); 

      mqttCluster.subscribeData("zoneClimateChange/"+this.zoneCode,function(content) {
        for (let index = 0; index < self.modules.length; index++) {
          var module=self.modules[index];
          if (module.reportZoneClimateChangedEvent){
            module.reportZoneClimateChangedEvent(content)
          }
        }
        self.emit('stateChanged',self);
      }); 
      mqttCluster.subscribeData("zoneLowestAllowedTemperature/"+this.zoneCode,async function(content) {
        for (let index = 0; index < self.modules.length; index++) {
          var module=self.modules[index];
          if (module.reportZoneLowestAllowedTemperatureEventAsync){
           await module.reportZoneLowestAllowedTemperatureEventAsync(content)
          }
        }
        var zoneConfig=self.getZoneBoilerConfig()
        mqttCluster.publishData("zoneBoilerChange",zoneConfig)
        self.emit('stateChanged',self);
      });
      
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