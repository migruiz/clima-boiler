function HotWaterBoostControl(individualValveManager) {
    var boostHandler;




    async function switchValveAsync(mode) {
        var hotWaterNewState = { code: "hotWaterValve", mode: mode };
        await individualValveManager.setValveStateAsync(hotWaterNewState);
    }

    this.startBoostAsync = async function (boostTime) {
        await switchValveAsync(true);
        boostHandler = null;
        var boostTimeMilis = 1000 * boostTime;
        boostHandler=setTimeout(function () {
            this.stopBoost();
        }, boostTimeMilis);
    }

    this.stopBoost =async function () {
        await switchValveAsync(false);
        clearTimeout(boostHandler);
    }
}

exports.newInstance = function (individualValveManager) {
    var instance = new HotWaterBoostControl(individualValveManager);
    return instance;
}