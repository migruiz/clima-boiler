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
            mqttCluster.subscribeData("zoneIsMonitored/"+this.zoneCode, async function(content) {
                self.Monitored=content.Monitored
                self.reportStateChange() 
                var mqttCluster=await mqtt.getClusterAsync()               
                mqttCluster.publishData('zoneBoilerRegulatedChanged',{zoneCode:this.zoneCode,regulated:this.Monitored});
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