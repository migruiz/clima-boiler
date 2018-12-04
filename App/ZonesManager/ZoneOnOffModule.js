const EventEmitter = require( 'events' );
class ZoneOnOffModule extends EventEmitter {
    constructor(zoneCode) {
        super()
        this.zoneCode=zoneCode;
        this.Monitored;
        this.OnPriority = 100;
        this.OffPriority = 10;

    }
    async initAsync() {
    }
    updateCurrentTemperature(temperature){}
    getModuleIsActive() {
        var moduleActive = this.Monitored ? this.Monitored : false;
        return moduleActive;
    }

}
module.exports = ZoneOnOffModule;