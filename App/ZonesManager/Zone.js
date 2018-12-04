const ZoneOnOffModule=require('./ZoneOnOffModule.js');
const ZoneTemperatureLimitModule=require('./ZoneTemperatureLimitModule.js');
class Zone {
    constructor(zoneCode) {
      this.zoneCode=zoneCode;
      this.modules=[];
      this.zoneCode=zoneCode;
    }
    async initAsync(){
      this.modules.push(new ZoneOnOffModule(this.zoneCode));
      this.modules.push(new ZoneTemperatureLimitModule(this.zoneCode));
      for (let index = 0; index < this.modules.length; index++) {
        await this.modules[index].initAsync();
      }
      
    }
    updateCurrentTemperature(temperature){
      for (let index = 0; index < this.modules.length; index++) {
        this.modules[index].updateCurrentTemperature(temperature)
      }
    }

    isCallingForHeat(){
      for (let module in this.modules) {
        
      }

    }
  }

  exports.newInstanceAsync = async function (zoneCode) {
    var instance = new Zone(zoneCode);
    await instance.initAsync();
    return instance;
}