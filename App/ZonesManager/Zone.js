class Zone {
    constructor() {
      this.modules=[];
    }
    init(){
      this.modules.push(new ZoneOnOffModule());
      this.modules.push(new ZoneTemperatureLimitModule());
    }

    isCallingForHeat(){
      for (let module in this.modules) {
        
      }

    }
  }