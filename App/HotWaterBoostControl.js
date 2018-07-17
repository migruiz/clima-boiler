function HotWaterBoostControl(individualValveManager) {
    var boostHandler;




    function switchValveAsync(mode) {
        var hotWaterNewState = { code: "hotWaterValve", mode: mode };
        await(individualValveManager.setValveStateAsync(hotWaterNewState));
    }

    this.startBoostAsync = function (boostTime) {
        await(switchValveAsync(true));
        boostHandler = null;
        var boostTimeMilis = 1000 * boostTime;
        boostHandler=setTimeout(function () {
            this.stopBoost();
        }, boostTimeMilis);
    }

    this.stopBoost = function () {
        await(switchValveAsync(false));
        clearTimeout(boostHandler);
    }
}

exports.newInstance = function (individualValveManager) {
    var instance = new HotWaterBoostControl(individualValveManager);
    return instance;
}