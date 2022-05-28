'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')
const fs = require('fs')

const fastify = require('fastify')({
    logger: true
});

// Utils

function isAValidId(id) {
    let valid = true;
    // Check if each character is a number
    for (let i = 0; i < id.length; i++) {
        if (isNaN(id[i])) {
            valid = false;
        }
    }
    return valid;
}


// Socket.io
const io = require('socket.io')(fastify.server);

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

// GET /dump/today
fastify.get('/dump/today', async (request, reply) => {
    // Load attendance data
    const attendanceData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/attendance.json'), 'utf8'));

    // We will create a CSV out of the attendance data
    let csv = 'Name\n';
    for (let x = 0; x < Object.keys(attendanceData).length; x++) {
        let userAttendanceData = attendanceData[Object.keys(attendanceData)[x]];
        if (userAttendanceData[userAttendanceData.length - 1] === new Date().toLocaleDateString()) {
            csv += Object.keys(attendanceData)[x] + '\n';
        }
    }
    return reply.send(csv);
});

// GET /dump/all
fastify.get('/dump/all', async (request, reply) => {
    // Load attendance data
    const attendanceData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/attendance.json'), 'utf8'));

    // We will create a CSV out of the attendance data
    let csv = 'Name\tDays Attended\n';
    for (let x = 0; x < Object.keys(attendanceData).length; x++) {
        let userAttendanceData = attendanceData[Object.keys(attendanceData)[x]];
        csv += Object.keys(attendanceData)[x] + '\t' + userAttendanceData.join(",") + '\n';
    }
    return reply.send(csv);
});

// On socket connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('attendance', (data) => {
        // If data doesn't contain either name or id, return
        if (!data.name && !data.id) {
            socket.emit('attendance', {
                success: false,
                message: 'Please enter a name or ID'
            });
            return;
        }

        // Load attendance and user data
        const userData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json')));
        const attendanceData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/attendance.json')));
        // Validate data
        if (!isAValidId(data.id)) {
            return socket.emit('attendance', {
                success: false,
                message: 'Provided ID is not valid'
            });
        }
        // Find the user by their id. If the id is 9 digits long, it's an osis, otherwise it's a long id
        let user = userData.find(user => {
            if (data.id.length === 9) {
                return user.osis === data.id
            } else if (data.id.length === 13) {
                return user.long_id === data.id
            } else {
                return false;
            }
        });


        // If no osis was provided, find the user by their name
        if (!user && data.name) {
            user = userData.find(user => {
                return user.name === data.name
            });
        }

        // If no user was found, return an error
        if (!user) {
            socket.emit('attendance', {
                success: false,
                message: 'No user found with that id or name, please check case sensitivity!'
            });
            return;
        }

        // Find the user's attendance record
        let userAttendanceRecord = attendanceData[user.name];

        // If no attendance record exists, create one
        if (!userAttendanceRecord) {
            attendanceData[user.name] = [new Date().toLocaleDateString()];
            userAttendanceRecord = attendanceData[user.name];
        } else {
            // Check if the last entry is the same as today's date
            if (userAttendanceRecord[userAttendanceRecord.length - 1] === new Date().toLocaleDateString()) {
                socket.emit('attendance', {
                    success: false,
                    message: 'You have already been marked as present today'
                });
                return;
            }

            // Add today's date to the attendance record
            attendanceData[user.name].push(new Date().toLocaleDateString());
        }
        // Write the attendance data back to the file
        fs.writeFileSync(path.join(__dirname, 'data/attendance.json'), JSON.stringify(attendanceData));

        socket.emit('attendance', {
            success: true,
            message: 'Successfully marked ' + user.name + ' as present'
        });
    });

    socket.on('register', (data) => {
        // Load user data
        const userData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json')));

        // Validate the data
        if (data.osis.length !== 9) {
            socket.emit('register', {
                success: false,
                message: 'Provided OSIS is not 9 digits long'
            });
            return;
        }
        if (!isAValidId(data.osis)) {
            socket.emit('register', {
                success: false,
                message: 'Provided OSIS contains invalid characters'
            });
            return;
        }
        if (data.long_id.length !== 13) {
            socket.emit('register', {
                success: false,
                message: 'Provided long ID is not 13 digits long'
            });
            return;
        }
        if (!isAValidId(data.long_id)) {
            socket.emit('register', {
                success: false,
                message: 'Provided long ID contains invalid characters'
            });
            return;
        }

        // Make sure that there are no users whose data matches the new user's data
        let user = userData.find(user => {
            return user.name === data.name || user.osis === data.osis || user.long_id === data.long_id
        });

        // If no user was found, add the new user to the user data
        if (!user) {
            userData.push({
                name: data.name,
                osis: data.osis,
                long_id: data.long_id
            });
        } else {
            socket.emit('register', {
                success: false,
                message: 'A user with that name, osis, or long id already exists'
            });
            return;
        }

        // Write the user data back to the file
        fs.writeFileSync(path.join(__dirname, 'data/users.json'), JSON.stringify(userData));

        socket.emit('register', {
            success: true,
            message: 'Successfully registered ' + data.name + ' as a new user'
        });
    });
});

// Run the server!
fastify.listen(3002, '0.0.0.0');