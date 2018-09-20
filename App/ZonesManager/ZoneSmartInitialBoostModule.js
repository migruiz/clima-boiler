class ZoneSmartInitialBoostModule {
    constructor(zoneManager) {
        this.LowestAllowedTemperature;
        this.CurrentTemperature;
        this.OnPriority = 80;
        this.OffPriority = 30;
        this.ZoneRequestingHeat = false;
        this.OnBoostInterval = false;
    }

    async init() {
        this.LowestAllowedTemperature = await this.zoneManager.getLowestAllowedTemperatureAsync();
        this.zoneManager.on('lowestAllowedTemperatureChanged', newLowestAllowedTemperature => {
            this.LowestAllowedTemperature = LowestAllowedTemperature;
            this.zoneManager.emit('zoneStateChanged');
        });
        this.zoneManager.on('currentTemperatureChanged', newTemperature => {
            this.CurrentTemperature = newTemperature;

            if (this.CurrentTemperature < this.LowestAllowedTemperature) {
                if (this.OnBoostInterval)
                    return;
                this.OnBoostInterval = true;
                this.ZoneRequestingHeat = true;
                this.zoneManager.emit('zoneStateChanged');
                setTimeout(this.onBoostOnIntervalFinished, 1000 * 60 * 5);
            }
        });
    }

    onBoostOnIntervalFinished() {
        this.ZoneRequestingHeat = false;
        this.zoneManager.emit('zoneStateChanged');
        setTimeout(() => { this.OnBoostInterval = false; }, 1000 * 60 * 5);
    }

    getModuleIsActive() {
        var moduleActive = this.CurrentTemperature && this.LowestAllowedTemperature ? this.ZoneRequestingHeat : false;
        return moduleActive;
    }

}