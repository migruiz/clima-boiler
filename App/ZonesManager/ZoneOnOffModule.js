
class ZoneOnOffModule {
    constructor(zoneManager) {
        this.Monitored;
        this.OnPriority = 100;
        this.OffPriority = 10;

    }
    async init() {
        this.Monitored = await this.zoneManager.getCurrentMonitoredStateAsync();
        this.zoneManager.on('monitoredStateChanged', newState => {
            this.Monitored = newState;
            this.zoneManager.emit('zoneStateChanged');
        });
    }
    getModuleIsActive() {
        var moduleActive = this.Monitored ? this.Monitored : false;
        return moduleActive;
    }

}