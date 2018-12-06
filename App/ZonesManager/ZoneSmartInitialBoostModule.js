class ZoneSmartInitialBoostModule {
    constructor(zoneManager) {
        this.LowestAllowedTemperature;
        this.CurrentTemperature;
        this.OnPriority = 80;
        this.OffPriority = 30;
        this.ZoneRequestingHeat = false;
        this.OnBoostInterval = false;
        this.requesingtHeatInterval=null;
        this.coolingOffInterval=null;
    }

    async init() {

        this.LowestAllowedTemperature=await sqliteRepository.getZoneMinimumTemperatureAsync(this.zoneCode)
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData("zoneClimateChange/"+this.zoneCode, onCurrentTemperatureChanged);
        mqttCluster.subscribeData("zoneLowestAllowedTemperature/"+this.zoneCode, function(content) {
            self.LowestAllowedTemperature=content.temperature
            this.reset();
            self.reportStateChange()
        });
    }

    
    onCurrentTemperatureChanged(content){
        if (isInRangeOfControl()){
            if (this.OnBoostInterval)
                return;   
            this.OnBoostInterval = true;            
            this.ZoneRequestingHeat = true; 
            this.reportStateChange()
            this.requesingtHeatInterval=setTimeout(this.onBoostOnIntervalFinished, 1000 * 60 * 5);
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
        coolingOffInterval=setTimeout(() => { this.OnBoostInterval = false; }, 1000 * 60 * 5);
    }

    getisCallingForHeat() {
        return this.ZoneRequestingHeat;
    }
    getIsActive() {
        return isInRangeOfControl()
    }

    isInRangeOfControl() {
        if (!this.LowestAllowedTemperature)           
            return false;
        if (!this.CurrentTemperature)           
            return false;
        var degreesToReachTarget =this.LowestAllowedTemperature-this.CurrentTemperature;
        return degreesToReachTarget>0 && degreesToReachTarget<0.3
    }

}