/**
 * Import base packages
 */
const amqp = require('amqplib');

/**
 * Global rabbitmq channel
 */
let rabbitmqChannel = null;

/**
 * Main application loop
 */
const run = async () => {
    const connection = await amqp.connect('amqp://localhost');
    console.log(`[RabbitMQ] Connected: amqp://localhost`);
    rabbitmqChannel = await connection.createChannel();
    console.log(`[RabbitMQ] Created Channel`);
    await rabbitmqChannel.assertExchange('local_exchange', 'direct', { durable: false });
    console.log(`[RabbitMQ] Asserted Exchange: local_exchange`);
    await rabbitmqChannel.assertQueue('local_api_worker', { durable: false });
    console.log(`[RabbitMQ] Asserted Queue: local_api_worker`);
    await rabbitmqChannel.bindQueue('local_api_worker', 'local_exchange', 'local_api_worker');
    console.log(`[RabbitMQ] Bound Queue: local_exchange -> local_api_worker`);

    rabbitmqChannel.consume('local_special_worker', (message) => {
        const json = JSON.parse(message.content.toString());
        console.log(`[RabbitMQ][${json.meta.uuid}] Message Received: ${JSON.stringify(json.data)}`);

        // App logic here
        setTimeout(() => {
            const reverse = Object.fromEntries(
                Object
                    .entries(json.data)
                    .map(([key, value]) => [value, key])
            );

            rabbitmqChannel.publish('local_exchange', 'local_api_worker', Buffer.from(JSON.stringify({
                meta: json.meta,
                data: reverse
            })));
            rabbitmqChannel.ack(message);
        }, 5000);
    });
};

run();
