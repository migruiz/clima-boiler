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
    }

    
    reportZoneClimateChangedEvent(content){
        this.CurrentTemperature=Math.round( content.temperature * 1e1 ) / 1e1;
        this.checkIfZoneNeedsHeating()
    }

    async reportZoneLowestAllowedTemperatureEventAsync(content){
        this.LowestAllowedTemperature=Math.round( content.temperature * 1e1 ) / 1e1;
        this.reset();
        this.checkIfZoneNeedsHeating();   
    }

    async reportZoneIsMonitoredEventAsync(content){
        this.reset();
        this.checkIfZoneNeedsHeating();
    }


    checkIfZoneNeedsHeating(){
        if (this.isInRangeOfControl()){
            if (this.OnBoostInterval)
                return;   
            //console.log(this.zoneCode+ " started boost interval")
            this.OnBoostInterval = true;            
            this.ZoneRequestingHeat = true; 
            this.requesingtHeatInterval=setTimeout(this.onBoostOnIntervalFinished.bind(this), 1000 * 60 * 5);
        }
        else{
            this.reset();
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