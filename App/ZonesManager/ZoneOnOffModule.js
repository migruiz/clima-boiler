const ZoneModule=require('./ZoneModule.js');
var zonesdb = require('../zonesDatabase');
class ZoneOnOffModule extends ZoneModule {
    constructor(zoneCode) {
        super(zoneCode)
        this.Monitored;
        this.OnPriority = 100;
        this.OffPriority = 10;

    }
    async initAsync() {
        var result = await zonesdb.instance().operate(db=>db.getAsync("select IFNULL(zoneAutoRegulateEnabled,0) zoneAutoRegulateEnabled  from ZoneValvesSettings where zoneCode=$zoneCode",{
            $zoneCode: this.zoneCode
        }));
        if (result){
            this.Monitored=result.zoneAutoRegulateEnabled
            console.log(this.zoneCode)
            console.log(this.Monitored)
        }
    }
    updateCurrentTemperature(temperature){}
    getCallingForHeatPriority() {
        var moduleActive = this.Monitored ? this.Monitored : false;
        return moduleActive;
    }

}
module.exports = ZoneOnOffModule;