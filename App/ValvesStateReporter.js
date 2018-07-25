var amqp = require('amqplib');

function broacastToChannel(uri,valveReading) {
    amqp.connect(uri).then(function (conn) {
        return conn.createChannel().then(function (ch) {
            var ex = 'valveReadingChangeMock';
            var msg = JSON.stringify(valveReading);

            var ok = ch.assertExchange(ex, 'fanout', { durable: false });

            return ok.then(function (_qok) {
                // NB: `sentToQueue` and `publish` both return a boolean
                // indicating whether it's OK to send again straight away, or
                // (when `false`) that you should wait for the event `'drain'`
                // to fire before writing again. We're just doing the one write,
                // so we'll ignore it.
                ch.publish(ex, '', Buffer.from(msg));
                return ch.close();
            });
        }).finally(function () { conn.close(); });
    }).catch(console.warn);
}



function broadcastChange(valveReading) {
    var internetAMQPURI = global.config.internetAMQPURI;
    var intranetAMQPURI = global.config.intranetAMQPURI;
    broacastToChannel(internetAMQPURI, valveReading);
   // broacastToChannel(intranetAMQPURI, valveReading);    
}
exports.broadcastChange = broadcastChange;

