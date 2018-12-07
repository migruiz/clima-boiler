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
            mqttCluster.subscribeData("zoneIsMonitored/"+this.zoneCode,async  function(content) {
                self.Monitored=content.Monitored
                await sqliteRepository.setZoneValveAutoRegulatedEnabled(self.zoneCode,content.Monitored)
                self.reportStateChange() 
                self.emit( 'zoneBoilerConfigChange');
            });   
    }
    getIsActive(){
        return true
    }
    getisCallingForHeat() {
        return this.Monitored ? this.Monitored : false;
    }

}
module.exports = ZoneOnOffModule;