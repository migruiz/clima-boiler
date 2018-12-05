var zonesdb = require('./zonesDatabase');
exports.updateValveStateAsync = async function (valveState) {
    await zonesdb.instance().operate(db=>db.runAsync("REPLACE INTO Valves(valveCode,state,stateTimestamp,stateOnLastTimestamp,triggeredBy) values ($valveCode,$state,$stateTimestamp,$stateOnLastTimestamp,$triggeredBy)",
        {
            $valveCode: valveState.valveCode,
            $state: valveState.state,
            $stateTimestamp: valveState.stateTimestamp,
            $stateOnLastTimestamp: valveState.stateOnLastTimestamp,
            $triggeredBy: valveState.triggeredBy
        }));
}
exports.getzoneAutoRegulateEnabledAsync = async function (zoneCode) {
    var result = await zonesdb.instance().operate(db=>db.getAsync("select IFNULL(zoneAutoRegulateEnabled,0) zoneAutoRegulateEnabled  from ZoneValvesSettings where zoneCode=$zoneCode",{
        $zoneCode: zoneCode
    }));
    if (result){
        return result.zoneAutoRegulateEnabled
    }
    else{
        return null
    }
}
exports.getZonesValvesConfig = async function () {
    var result = await zonesdb.instance().operate(db=>db.allAsync("select zoneCode,IFNULL(zoneAutoRegulateEnabled,0) zoneAutoRegulateEnabled ,IFNULL(zoneMinimumTemperature,0) zoneMinimumTemperature from ZoneValvesSettings"));
    return result;
};
exports.getValveStateAsync = async function (valveCode) {

    var result = await zonesdb.instance().operate(db=>db.getAsync("select valveCode valveCode,state state, stateTimestamp stateTimestamp,stateOnLastTimestamp stateOnLastTimestamp,triggeredBy triggeredBy from Valves where valveCode=$valveCode",
        {
            $valveCode: valveCode
        }));
    return result;

}
exports.getZoneValveConfigByZoneCodeAsync = async  function (zoneCode) {
    var result = await zonesdb.instance().operate(db=>db.getAsync(`
            select 
            zoneCode
            ,IFNULL(zoneAutoRegulateEnabled, 0) zoneAutoRegulateEnabled
            ,IFNULL(zoneMinimumTemperature, 0) zoneMinimumTemperature
            ,boostStartTime
            ,boostTime
            ,IFNULL(boostEnabled, 0) boostEnabled
            from ZoneValvesSettings
            where zoneCode= $zoneCode`,
        {
            $zoneCode: zoneCode
        }));
    return result;
};
exports.setZoneValveAutoRegulatedEnabled = async  function (zoneCode, enabled) {
    await zonesdb.instance().operate(db=>db.runAsync("replace into ZoneValvesSettings(zoneCode,zoneAutoRegulateEnabled,zoneMinimumTemperature) values ($zoneCode,$zoneAutoRegulateEnabled,(select zoneMinimumTemperature from ZoneValvesSettings where zoneCode=$zoneCode))",
        {
            $zoneCode: zoneCode,
            $zoneAutoRegulateEnabled: enabled
        }));

}
exports.setZoneValveinimumTemperature = async  function (zoneCode, zoneMinimumTemperature) {
    await zonesdb.instance().operate(db=>db.runAsync("replace into ZoneValvesSettings(zoneCode,zoneAutoRegulateEnabled,zoneMinimumTemperature) values ($zoneCode,(select zoneAutoRegulateEnabled from ZoneValvesSettings where zoneCode=$zoneCode),$zoneMinimumTemperature)",
        {
            $zoneCode: zoneCode,
            $zoneMinimumTemperature: zoneMinimumTemperature
        }));
}

exports.setZoneValveBoostInfo = async  function (zoneCode, boostInfo) {
    await zonesdb.instance().operate(db=>db.runAsync("update  ZoneValvesSettings set boostStartTime=$boostStartTime, boostTime=$boostTime,boostEnabled=1 where zoneCode=$zoneCode",
        {
            $zoneCode: zoneCode,
            $boostStartTime: boostInfo.boostStartTime,
            $boostTime: boostInfo.boostTime
        }));
}
