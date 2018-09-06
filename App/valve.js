var await = require('asyncawait/await');
var async = require('asyncawait/async');
var locks = require('locks');
var amqp = require('amqplib');
var sqlRepository = require('./sqliteValvesRepository');
var valvesStateReporter = require('./ValvesStateReporter');
function Valve(valveConfig) {
    var zwaveOnOffCommandId = 37;
    var zwave = valveConfig.zwave;
    this.config = valveConfig;
    var setValveStatemutex = locks.createMutex();
    var valveStateListenerMutex = locks.createMutex();
    this.handleValveStateChange = function (valveReading) {
        if (this.config.nodeId == valveReading.nodeId && this.config.instanceId == valveReading.instanceId && zwaveOnOffCommandId == valveReading.commandType) {
            var valveChange = { code: this.config.code, value: valveReading.value, timestamp: valveReading.timestamp };
            var asyncFx = async(function () {
                await(onMyValveStateChangedAsync(valveChange));
            });
            asyncFx();

        }
    }
    function onMyValveStateChangedAsync(valveChange) {
        return new Promise(function (resolve, reject) {

            valveStateListenerMutex.lock(function () {
                try {
                    await(handleMyValvesStateChangeAsync(valveChange));
                    resolve();
                }
                catch (err) {
                    return reject(err);
                }
                finally {
                    valveStateListenerMutex.unlock();
                }
            });
        });
    }
    function handleMyValvesStateChangeAsync(valveChange) {
        valvesStateReporter.broadcastChange(valveChange);
        var storedValveData = await(sqlRepository.getValveStateAsync(valveChange.code));
        if (!storedValveData) {
            await(updateDatabaseAsync(valveChange.timestamp, null, valveChange.value));
        }
        else {
            if (storedValveData.stateTimestamp < valveChange.timestamp) {
                if (storedValveData.state != valveChange.value) {
                    var lastOnTimeStamp = valveChange.value ? valveChange.timeStamp : storedValveData.stateOnLastTimestamp;                    
                    await(updateDatabaseAsync(valveChange.timestamp, lastOnTimeStamp, valveChange.value));
                    sendChangeToFirebasSync(global.config.intranetAMQPURI, valveChange);
                }
            }
        }
    }
    function validateSetStateRequest() {
        if (!state.requestTimestamp) {
            console.log("did not send timestamp");
            zwave.requestNodeState(valveConfig.nodeId);
            return false;
        }
        var currentTimeStamp = Math.floor(new Date() / 1000);
        var deltaSecs = currentTimeStamp - state.requestTimestamp;
        if (deltaSecs > 20) {
            console.log("old request");
            console.log(currentTimeStamp);
            console.log(state.requestTimestamp);
            return false;
        }
        return true;
    }
    this.setStateAsync = function (state) {
        //if (!validateSetStateRequest(state))
        //    return;
        return new Promise(function (resolve, reject) {

            setValveStatemutex.lock(function () {
                try {
                    await(setStateImplementationAsync(state));
                    resolve();
                }
                catch (err) {
                    return reject(err);
                }
                finally {
                    setValveStatemutex.unlock();
                }
            });
        });

    }

    function setStateImplementationAsync(state) {
        var storedValveData = await(sqlRepository.getValveStateAsync(valveConfig.code));
        if (!storedValveData) {
            zwave.setValue(valveConfig.nodeId, zwaveOnOffCommandId, valveConfig.instanceId, 0, state);
        }
        else {
            if (storedValveData.state == state) {
                return;
            }
            var currentTimeStamp = Math.floor(new Date() / 1000);
            var deltaSecs = currentTimeStamp - storedValveData.stateTimestamp;
            if (deltaSecs > 20) {
                zwave.setValue(valveConfig.nodeId, zwaveOnOffCommandId, valveConfig.instanceId, 0, state);
            }
            else {
                console.log("valve locked");
                zwave.requestNodeState(valveConfig.nodeId);
                return;
            }
        }
    }



    function updateDatabaseAsync(timeStamp, stateOnLastTimestamp, state) {
        var lastOnTimeStamp = state ? timeStamp : stateOnLastTimestamp;
        var dbInfo = {
            valveCode: valveConfig.code,
            state: state,
            stateTimestamp: timeStamp,
            stateOnLastTimestamp: lastOnTimeStamp,
            triggeredBy: 'control'
        };
        await(sqlRepository.updateValveStateAsync(dbInfo));
        console.log("db.updated");
        console.log(dbInfo);
    }
}

function sendChangeToFirebasSync(intranetAMQPURI, valveReading) {
    amqp.connect(intranetAMQPURI).then(function (conn) {
        return conn.createChannel().then(function (ch) {
            var q = 'firebaseSyncQueue';
            var msg = JSON.stringify(valveReading);

            var ok = ch.assertQueue(q, { durable: true });

            return ok.then(function (_qok) {
                ch.sendToQueue(q, Buffer.from(msg));
                return ch.close();
            });
        }).finally(function () { conn.close(); });
    }).catch(console.warn);
}

exports.newInstance = function (valveConfig) {
    var valve = new Valve(valveConfig);
    return valve;
}
exports.getValveDataAsync = function (valveCode) {
    var data = await(sqlRepository.getValveStateAsync(valveCode));
    return data;
};