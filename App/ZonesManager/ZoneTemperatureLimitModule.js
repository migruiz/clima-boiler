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
        mqttCluster.subscribeData("zoneLowestAllowedTemperature/"+this.zoneCode, function(content) {
            self.LowestAllowedTemperature=content.temperature
            self.reportStateChange()
        });
        console.log(this.zoneCode)
        console.log(this.LowestAllowedTemperature)
    }
    

    getisCallingForHeat() {
        if (!this.LowestAllowedTemperature)           
            return false;
        if (!this.CurrentTemperature)           
            return false;
        return this.CurrentTemperature < this.LowestAllowedTemperature;
    }
    getIsActive() {
        return true
    }

}
module.exports = ZoneTemperatureLimitModule;