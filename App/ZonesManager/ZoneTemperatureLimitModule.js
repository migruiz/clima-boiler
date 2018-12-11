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
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData("zoneClimateChange/"+this.zoneCode, function(content) {
            self.CurrentTemperature=Math.round( content.temperature * 1e1 ) / 1e1
            self.reportStateChange()
        });
        mqttCluster.subscribeData("zoneLowestAllowedTemperature/"+this.zoneCode,async function(content) {
            var roundedTemp=Math.round( content.temperature * 1e1 ) / 1e1
            self.LowestAllowedTemperature=roundedTemp       
            await sqliteRepository.setZoneValveinimumTemperature(self.zoneCode,roundedTemp)               
            self.reportStateChange()
            self.emit( 'zoneBoilerConfigChange');
        });
        //console.log(this.zoneCode)
        //console.log(this.LowestAllowedTemperature)
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