const EventEmitter = require( 'events' );
class ZoneTemperatureLimitModule extends EventEmitter {
    constructor(zoneCode) {
        super()
        this.zoneCode=zoneCode;
        this.LowestAllowedTemperature;
        this.CurrentTemperature;
        this.OnPriority = 90;
        this.OffPriority = 20;
    }

    async initAsync() {
    }
    updateCurrentTemperature(temperature){
        this.CurrentTemperature=temperature
        this.emit( 'stateChanged');
    }

    getModuleIsActive() {
        var underLimit = this.CurrentTemperature < this.LowestAllowedTemperature;
        var moduleActive = this.CurrentTemperature && this.LowestAllowedTemperature ? underLimit : false;
        return moduleActive;
    }

}
module.exports = ZoneTemperatureLimitModule;