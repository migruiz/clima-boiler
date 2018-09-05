var await = require('asyncawait/await');
var async = require('asyncawait/async');
var sqliteDb = require('./db-sqlite.js');
exports.updateValveStateAsync = function (valveState) {
    await(sqliteDb.database().operateDatabaseAsync(function (db) {
        await(db.runAsync("REPLACE INTO Valves(valveCode,state,stateTimestamp,stateOnLastTimestamp,triggeredBy) values ($valveCode,$state,$stateTimestamp,$stateOnLastTimestamp,$triggeredBy)",
            {
                $valveCode: valveState.valveCode,
                $state: valveState.state,
                $stateTimestamp: valveState.stateTimestamp,
                $stateOnLastTimestamp: valveState.stateOnLastTimestamp,
                $triggeredBy: valveState.triggeredBy
            }));
    }));
}
exports.getZonesValvesConfig = function () {
    var result = await(sqliteDb.database().operateDatabaseAsync(function (db) {
        var valveData = await(db.allAsync("select zoneCode,IFNULL(zoneAutoRegulateEnabled,0) zoneAutoRegulateEnabled ,IFNULL(zoneMinimumTemperature,0) zoneMinimumTemperature from ZoneValvesSettings"));
        return valveData;
    }));
    return result;
};
exports.getValveStateAsync = function (valveCode) {

    var result = await(sqliteDb.database().operateDatabaseAsync(function (db) {
        var valveData = await(db.getAsync("select valveCode valveCode,state state, stateTimestamp stateTimestamp,stateOnLastTimestamp stateOnLastTimestamp,triggeredBy triggeredBy from Valves where valveCode=$valveCode",
            {
                $valveCode: valveCode
            }));
        return valveData;
    }));
    return result;

}
exports.getZoneValveConfigByZoneCodeAsync = function (zoneCode) {
    var result = await(sqliteDb.database().operateDatabaseAsync(function (db) {
        var valveData = await(db.getAsync("select zoneCode,IFNULL(zoneAutoRegulateEnabled,0) zoneAutoRegulateEnabled ,IFNULL(zoneMinimumTemperature,0) zoneMinimumTemperature from ZoneValvesSettings where zoneCode=$zoneCode",
            {
                $zoneCode: zoneCode
            }));
        return valveData;
    }));
    return result;
};
exports.setZoneValveAutoRegulatedEnabled = function (zoneCode, enabled) {
    await(sqliteDb.database().operateDatabaseAsync(function (db) {
        await(db.runAsync("replace into ZoneValvesSettings(zoneCode,zoneAutoRegulateEnabled,zoneMinimumTemperature) values ($zoneCode,$zoneAutoRegulateEnabled,(select zoneMinimumTemperature from ZoneValvesSettings where zoneCode=$zoneCode))",
            {
                $zoneCode: zoneCode,
                $zoneAutoRegulateEnabled: enabled
            }));
    }));
}
exports.setZoneValveinimumTemperature = function (zoneCode, zoneMinimumTemperature) {
    await(sqliteDb.database().operateDatabaseAsync(function (db) {
        await(db.runAsync("replace into ZoneValvesSettings(zoneCode,zoneAutoRegulateEnabled,zoneMinimumTemperature) values ($zoneCode,(select zoneAutoRegulateEnabled from ZoneValvesSettings where zoneCode=$zoneCode),$zoneMinimumTemperature)",
            {
                $zoneCode: zoneCode,
                $zoneMinimumTemperature: zoneMinimumTemperature
            }));
    }));
}
