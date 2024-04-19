/**
 * Import base packages
 */
const express = require('express');
const redis = require('redis');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

/**
 * Setup Express app
 */
const app = express();

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
 * Trust proxy
 */
app.enable('trust proxy');

/**
 * Enable body parsers
 */
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: false}));

/**
 * Request logger
 */
app.use((req, res, next) => {
    console.log(`[Web]: ${req.originalUrl}`);
    next();
});

/**
 * Allow CORS
 */
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    next();
});

/**
 * Configure routers
 */
app.post('/api/input', (req, res) => {
    console.log('req.body', req.body);

    const uuid = uuidv4();
    rabbitmqChannel.publish('local_exchange', 'local_special_worker', Buffer.from(JSON.stringify({
        meta: {
            uuid
        },
        data: req.body.data
    })));

    res.json({
        uuid
    });
});
app.get('/api/poll/:uuid', async (req, res) => {
    console.log('req.params', req.params);

    res.json({
        data: JSON.parse(await redisClient.get(req.params.uuid))
    });
});

/**
 * Disable powered by header for security reasons
 */
app.disable('x-powered-by');

/**
 * Start listening on port
 */
app.listen(4000, '0.0.0.0', async () => {
    console.log(`[App] Running on: 0.0.0.0:4000`);

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
    await rabbitmqChannel.assertQueue('local_special_worker', { durable: false });
    console.log(`[RabbitMQ] Asserted Queue: local_special_worker`);
    await rabbitmqChannel.bindQueue('local_special_worker', 'local_exchange', 'local_special_worker');
    console.log(`[RabbitMQ] Bound Queue: local_exchange -> local_special_worker`);
});
