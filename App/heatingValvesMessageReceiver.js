var amqp = require('amqplib');
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
                    await heatingValvesManager.setValvesStateAsync(valvesState);
                }, { noAck: true });
            });


        });
    }).catch(console.warn);
};