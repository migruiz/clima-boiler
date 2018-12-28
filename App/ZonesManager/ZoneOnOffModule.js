var mqtt = require('../mqttCluster.js');
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
            this.Monitored=await sqliteRepository.getZoneAutoRegulateEnabledAsync(this.zoneCode)      
    }

    async reportZoneIsMonitoredEventAsync(content){
        self.Monitored=content.Monitored
        await sqliteRepository.setZoneValveAutoRegulatedEnabled(this.zoneCode,content.Monitored)
    }

    getIsActive(){
        return true
    }
    getisCallingForHeat() {
        return this.Monitored ? this.Monitored : false;
    }

}
module.exports = ZoneOnOffModule;