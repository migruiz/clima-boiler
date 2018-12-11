var mqtt = require('../mqttCluster.js');
const ZoneModule=require('./ZoneModule.js');
var sqliteRepository = require('../sqliteValvesRepository.js');
class ZoneSmartInitialBoostModule extends ZoneModule {
    constructor(zoneCode) {
        super(zoneCode)
        this.LowestAllowedTemperature;
        this.CurrentTemperature;
        this.OnPriority = 80;
        this.OffPriority = 30;
        this.ZoneRequestingHeat = false;
        this.OnBoostInterval = false;
        this.requesingtHeatInterval=null;
        this.coolingOffInterval=null;
    }

    async initAsync() {

        this.LowestAllowedTemperature=await sqliteRepository.getZoneMinimumTemperatureAsync(this.zoneCode)
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData("zoneClimateChange/"+this.zoneCode, this.onCurrentTemperatureChanged.bind(this));
        mqttCluster.subscribeData("zoneLowestAllowedTemperature/"+this.zoneCode, function(content) {
            self.LowestAllowedTemperature=Math.round( content.temperature * 1e1 ) / 1e1;
            self.reset();
            self.checkIfZoneNeedsHeating();
            self.reportStateChange()
        });
        mqttCluster.subscribeData("zoneIsMonitored/"+this.zoneCode,async  function() {
            self.reset();
            self.checkIfZoneNeedsHeating();
            self.reportStateChange()
        }); 
    }

    
    onCurrentTemperatureChanged(content){
        this.CurrentTemperature=Math.round( content.temperature * 1e1 ) / 1e1;
        this.checkIfZoneNeedsHeating()
    }
    checkIfZoneNeedsHeating(){
        if (this.isInRangeOfControl()){
            if (this.OnBoostInterval)
                return;   
            //console.log(this.zoneCode+ " started boost interval")
            this.OnBoostInterval = true;            
            this.ZoneRequestingHeat = true; 
            this.reportStateChange()
            this.requesingtHeatInterval=setTimeout(this.onBoostOnIntervalFinished.bind(this), 1000 * 60 * 5);
        }
        else{
            this.reset();
            this.reportStateChange()
        }
    }
    reset(){
        this.ZoneRequestingHeat = false;
        this.OnBoostInterval = false
        clearTimeout(this.requesingtHeatInterval)
        clearTimeout(this.coolingOffInterval)

    }
    onBoostOnIntervalFinished() {
        this.ZoneRequestingHeat = false;
        this.reportStateChange()
        //console.log(this.zoneCode+ " onBoostOnIntervalFinished")
        var self=this;
        this.coolingOffInterval=setTimeout(() => { 
            self.OnBoostInterval = false;
            this.reportStateChange()
            //console.log(self.zoneCode+ " coolingOffIntervalFinished")
         }, 1000 * 60 * 5);
    }

    getisCallingForHeat() {
        return this.ZoneRequestingHeat;
    }
    getIsActive() {
        return this.isInRangeOfControl()
    }

    isInRangeOfControl() {
        if (!this.LowestAllowedTemperature)           
            return false;
        if (!this.CurrentTemperature)           
            return false;
        var delta=this.LowestAllowedTemperature - this.CurrentTemperature 
        var degreesToReachTarget = Math.round( delta * 1e1 ) / 1e1
        return degreesToReachTarget>0 && degreesToReachTarget<=0.3
    }

}
module.exports = ZoneSmartInitialBoostModule;