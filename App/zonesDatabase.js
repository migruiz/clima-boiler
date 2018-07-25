var sqlite = require('./db-sqlite.js');

var versionHistory = [];
versionHistory.push(`CREATE TABLE Valves (
        id integer primary key
        ,valveCode text not null collate nocase
        ,state int
        ,stateTimestamp int
        ,stateOnLastTimestamp int
        ,triggeredBy text not null collate nocase
        );`);
versionHistory.push('CREATE UNIQUE INDEX IX_Valves ON Valves (valveCode ASC);');
versionHistory.push(`CREATE TABLE ZoneValvesSettings (
        id integer primary key
        ,zoneCode text not null collate nocase
        ,zoneAutoRegulateEnabled int
        ,zoneMinimumTemperature real
        );`);
versionHistory.push('CREATE UNIQUE INDEX IX_zoneCode ON ZoneValvesSettings (zoneCode ASC);');

versionHistory.push('alter table ZoneValvesSettings add boostTime int');
versionHistory.push('alter table ZoneValvesSettings add boostStartTime int');
versionHistory.push('alter table ZoneValvesSettings add boostEnabled int');


var singleton;
exports.instance = function () {
        if (!singleton) {
                singleton = new sqlite.SQLDB(global.config.dbPath, versionHistory);
        }
        return singleton;
}