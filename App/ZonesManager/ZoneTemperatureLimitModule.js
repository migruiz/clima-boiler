var mqtt = require('../mqttCluster.js');
const ZoneModule=require('./ZoneModule.js');
var sqliteRepository = require('../sqliteValvesRepository.js');
class ZoneTemperatureLimitModule extends ZoneModule {
    constructor(zoneCode) {
        super(zoneCode)
        this.LowestAllowedTemperature;
        this.CurrentTemperature;
        this.OnPriority = 90;
        this.OffPriority = 20;
    }

    async initAsync() {
        this.LowestAllowedTemperature=await sqliteRepository.getZoneMinimumTemperatureAsync(this.zoneCode)
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData("zoneClimateChange/"+this.zoneCode, function(content) {
            self.CurrentTemperature=content.temperature
            self.reportStateChange()
        });
        console.log(this.zoneCode)
        console.log(this.LowestAllowedTemperature)
    }
    

    getisCallingForHeat() {
        var underLimit = this.CurrentTemperature < this.LowestAllowedTemperature;
        var moduleActive = this.CurrentTemperature && this.LowestAllowedTemperature ? underLimit : false;
        return moduleActive;
    }

}
module.exports = ZoneTemperatureLimitModule;