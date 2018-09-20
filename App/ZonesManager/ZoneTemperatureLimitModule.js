class ZoneTemperatureLimitModule {
    constructor(zoneManager) {
        this.LowestAllowedTemperature = 21;
        this.CurrentTemperature = null;
        this.OnPriority = 90;
        this.OffPriority = 20;
    }

    async init() {
        this.Monitored = await this.zoneManager.getLowestAllowedTemperatureAsync();
        this.zoneManager.on('lowestAllowedTemperatureChanged', newLowestAllowedTemperature => {
            this.LowestAllowedTemperature = LowestAllowedTemperature;
            this.zoneManager.emit('zoneStateChanged');
        });
        this.zoneManager.on('currentTemperatureChanged', newTemperature => {
            this.CurrentTemperature = newTemperature;
            this.zoneManager.emit('zoneStateChanged');
        });
    }

    getModuleState() {
        var underLimit=this.CurrentTemperature<this.LowestAllowedTemperature;
        var moduleActive=this.CurrentTemperature?underLimit:false;
        return {
            State: moduleActive,
            Priority: moduleActive? this.OnPriority : this.OffPriority
        };
    }

}