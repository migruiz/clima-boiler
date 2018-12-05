const ZoneModule=require('./ZoneModule.js');
var sqliteRepository = require('../sqliteValvesRepository.js');
class ZoneOnOffModule extends ZoneModule {
    constructor(zoneCode) {
        super(zoneCode)
        this.Monitored;
        this.OnPriority = 100;
        this.OffPriority = 10;

    }
    async initAsync() {
            this.Monitored=await sqliteRepository.getzoneAutoRegulateEnabledAsync(this.zoneCode)
            console.log(this.zoneCode)
            console.log(this.Monitored)
        
    }
    updateCurrentTemperature(temperature){}
    getCallingForHeatPriority() {
        var moduleActive = this.Monitored ? this.Monitored : false;
        return moduleActive;
    }

}
module.exports = ZoneOnOffModule;