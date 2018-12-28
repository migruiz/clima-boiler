var mqtt = require('../mqttCluster.js');
const ZoneModule=require('./ZoneModule.js');
var sqliteRepository = require('../sqliteValvesRepository.js');
class ZoneTemperatureLimitModule extends ZoneModule {
    constructor(zoneCode) {
        super(zoneCode)
        this.LowestAllowedTemperature=0
        this.CurrentTemperature=0
        this.OnPriority = 90;
        this.OffPriority = 20;
    }

    async initAsync() {
        this.LowestAllowedTemperature=await sqliteRepository.getZoneMinimumTemperatureAsync(this.zoneCode)
    }
    
    reportZoneClimateChangedEvent(content){
        this.CurrentTemperature=Math.round( content.temperature * 1e1 ) / 1e1
    }
    async reportZoneLowestAllowedTemperatureEventAsync(content){
        var roundedTemp=Math.round( content.temperature * 1e1 ) / 1e1
        this.LowestAllowedTemperature=roundedTemp       
        await sqliteRepository.setZoneValveinimumTemperature(this.zoneCode,roundedTemp)           
    }

    getisCallingForHeat() {
        if (!this.LowestAllowedTemperature)           
            return false;
        if (!this.CurrentTemperature)           
            return false;
        return Math.round( this.CurrentTemperature * 1e1 ) / 1e1 < Math.round( this.LowestAllowedTemperature * 1e1 ) / 1e1
    }
    getIsActive() {
        return true
    }

}
module.exports = ZoneTemperatureLimitModule;