var amqp = require('amqplib');
var await = require('asyncawait/await');
var async = require('asyncawait/async');
exports.startMonitoring = function (heatingValvesManager) {
    amqp.connect(process.env.TEMPQUEUEURL).then(function (conn) {
        process.once('SIGINT', function () { conn.close(); });
        return conn.createChannel().then(function (ch) {

            var ok = ch.assertQueue('heatingValves', { durable: false });

            ok = ok.then(function (_qok) {
                return ch.consume('heatingValves', function (msg) {
                    var content = msg.content.toString();
                    console.log(" [x] Received '%s'", content);
                    var valvesState = JSON.parse(content);
                    var asyncFx = async(function () {
                        await(heatingValvesManager.setValvesStateAsync(valvesState));
                    });
                    asyncFx();
                }, { noAck: true });
            });


        });
    }).catch(console.warn);
};