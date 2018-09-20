class ZoneTemperatureLimitModule {
    constructor(zoneManager) {
        this.LowestAllowedTemperature;
        this.CurrentTemperature;
        this.OnPriority = 90;
        this.OffPriority = 20;
    }

    async init() {
        this.LowestAllowedTemperature = await this.zoneManager.getLowestAllowedTemperatureAsync();
        this.zoneManager.on('lowestAllowedTemperatureChanged', newLowestAllowedTemperature => {
            this.LowestAllowedTemperature = LowestAllowedTemperature;
            this.zoneManager.emit('zoneStateChanged');
        });
        this.zoneManager.on('currentTemperatureChanged', newTemperature => {
            this.CurrentTemperature = newTemperature;
            this.zoneManager.emit('zoneStateChanged');
        });
    }

    getModuleIsActive() {
        var underLimit = this.CurrentTemperature < this.LowestAllowedTemperature;
        var moduleActive = this.CurrentTemperature && this.LowestAllowedTemperature ? underLimit : false;
        return moduleActive;
    }

}