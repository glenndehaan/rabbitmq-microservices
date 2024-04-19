/**
 * Import base packages
 */
const redis = require('redis');
const amqp = require('amqplib');

/**
 * Setup redis
 */
const redisClient = redis.createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});

/**
 * Global rabbitmq channel
 */
let rabbitmqChannel = null;

/**
 * Main application loop
 */
const run = async () => {
    await redisClient.connect().catch((e) => {
        console.error(e);
        process.exit(1);
    });
    console.log(`[Redis] Connected: 127.0.0.1:6379`);

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

    rabbitmqChannel.consume('local_api_worker', (message) => {
        const json = JSON.parse(message.content.toString());
        console.log(`[RabbitMQ][${json.meta.uuid}] Message Received: ${JSON.stringify(json.data)}`);

        // App logic here
        redisClient.set(json.meta.uuid, JSON.stringify(json.data));
        rabbitmqChannel.ack(message);
    });
};

run();
