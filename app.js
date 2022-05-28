'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')

const fastify = require('fastify')({
    logger: true
});

// Socket.io
const io = require('socket.io')(fastify.server);

fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, {
        prefix: 'plugins/'
    })
});

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/'
});

// GET /test
fastify.get('/test', async (request, reply) => {
    return reply.sendFile('test.html');
});

// GET /
fastify.get('/', async (request, reply) => {
    return reply.sendFile('home.html');
});

// On socket connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('attendance', (data) => {
        // Reply to that socket only with a success message
        let socketId = socket.id;
        socket.emit('attendance', {
            message: 'Successfully marked ' + data.name + ' as present'
        });
    });

    socket.on('register', (data) => {
        // Reply to that socket only with a success message
        let socketId = socket.id;
        socket.emit('register', {
            message: 'Successfully registered ' + data.name + ' as a new user'
        });
    });
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000, '');
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
