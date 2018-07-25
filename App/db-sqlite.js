function SQLDB(path, structure) {
    function getAsync(sql, params) {
        return new Promise(function (resolve, reject) {
            db.get(sql, params, function (err, data) {
                if (err !== null) return reject(err);
                resolve(data);
            });
        });
    };
    this.getAsync = getAsync;
    function allAsync(sql, params) {
        return new Promise(function (resolve, reject) {
            db.all(sql, params, function (err, data) {
                if (err !== null) return reject(err);
                resolve(data);
            });
        });
    };
    this.allAsync = allAsync;
    function runAsync(sql, params) {
        return new Promise(function (resolve, reject) {
            db.run(sql, params, function (err) {
                if (err !== null) return reject(err);
                resolve();
            });
        });
    };
    this.runAsync = runAsync;
    function createInstance() {

        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database(path);
        return db;
    }

    var db = createInstance();
    createStructureAsync();

    async function createStructureAsync() {
        var data = await getAsync("PRAGMA USER_VERSION");
        var currentVersionNo = data.user_version;
        var newVersionNo = structure.length;
        if (newVersionNo > currentVersionNo) {
            await runAsync("BEGIN IMMEDIATE TRANSACTION");
            try {
                await applyDatabaseConfigurationChangesAsync(currentVersionNo, versionHistory);
                await runAsync("PRAGMA USER_VERSION=" + newVersionNo.toString());
                await runAsync("COMMIT TRANSACTION");
            }
            catch (err) {
                await runAsync("ROLLBACK");
                throw err;
            }

        }


    }
    async function applyDatabaseConfigurationChangesAsync(currentVersion, versions) {
        for (var i = currentVersion; i < versions.length; i++) {
            var expr = versions[i];
            await runAsync(expr);
        }
    }



}







exports.SQLDB = SQLDB;

