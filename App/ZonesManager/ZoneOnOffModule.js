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
            var mqttCluster=await mqtt.getClusterAsync() 
            var self=this
            mqttCluster.subscribeData("zoneIsMonitored/"+this.zoneCode, function(content) {
                self.Monitored=content.Monitored
                self.reportStateChange()
            });   
    }
    getisCallingForHeat() {
        var moduleActive = this.Monitored ? this.Monitored : false;
        return moduleActive;
    }

}
module.exports = ZoneOnOffModule;