function appendLog(message) {
	const log = document.getElementById('log_list');
	const li = document.createElement('li');
	li.innerText = message;
	log.appendChild(li);
}