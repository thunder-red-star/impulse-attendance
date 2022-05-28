// Assume socketio is loaded
let socket = io();

// Hold last heartbeat time
let lastHeartbeat = Date.now();

// Test Noty.js by creating a notification
function createNoty(type, message) {
	new Noty({
		type: type,
		theme: 'sunset',
		text: message,
		timeout: 3000
	}).show();
}

// On socket connection
socket.on('connect', () => {
	createNoty('success', 'Connected to server!');
});

socket.on('disconnect', () => {
	createNoty('error', 'Lost connection');
});

// Attach submit handlers to forms
const swipeForm = document.getElementById('swipe-form');
const newUserForm = document.getElementById('new-user-form');

swipeForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const name = document.getElementById('name').value;
	const id = document.getElementById('id').value;
	socket.emit('attendance', {
		name: name,
		id: id
	});
});

newUserForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const name = document.getElementById('new_name').value;
	const osis = document.getElementById('new_osis').value;
	const long_id = document.getElementById('new_long_id').value;
	socket.emit('register', {
		name: name,
		osis: osis,
		long_id: long_id
	});
});

// When the server responds to attendance and register hooks, display a Noty notification
socket.on('attendance', (data) => {
	createNoty('success', data.message);
});

socket.on('register', (data) => {
	createNoty('success', data.message);
});