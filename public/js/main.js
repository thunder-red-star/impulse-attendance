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
	const name = document.getElementById('name');
	const id = document.getElementById('id')
	socket.emit('attendance', {
		name: name.value,
		id: id.value
	});
	name.value = '';
	id.value = '';
});

newUserForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const name = document.getElementById('new_name');
	const osis = document.getElementById('new_osis');
	const long_id = document.getElementById('new_long_id');
	socket.emit('register', {
		name: name.value,
		osis: osis.value,
		long_id: long_id.value
	});
	name.value = '';
	osis.value = '';
	long_id.value = '';
});

// When the server responds to attendance and register hooks, display a Noty notification
socket.on('attendance', (data) => {
	if (data.success) {
		createNoty('success', data.message);
	} else {
		createNoty('error', data.message);
	}
});

socket.on('register', (data) => {
	if (data.success) {
		createNoty('success', data.message);
	} else {
		createNoty('error', data.message);
	}
});