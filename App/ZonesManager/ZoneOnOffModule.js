
class ZoneOnOffModule {
    constructor(zoneManager) {
        this.Monitored = false;
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
    getModuleState() {
        return {
            State: this.Monitored,
            Priority: this.Monitored ? this.OnPriority : this.OffPriority
        };
    }

}