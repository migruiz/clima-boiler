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
        console.log(this.zoneCode)
        console.log(this.LowestAllowedTemperature)
    }
    updateCurrentTemperature(temperature){
        this.CurrentTemperature=temperature
        super.reportStateChange()
    }

    getisCallingForHeat() {
        var underLimit = this.CurrentTemperature < this.LowestAllowedTemperature;
        var moduleActive = this.CurrentTemperature && this.LowestAllowedTemperature ? underLimit : false;
        return moduleActive;
    }

}
module.exports = ZoneTemperatureLimitModule;