const fs = require('fs');
const path = require('path')

try {
	fs.mkdirSync(path.join(__dirname, 'data'));
} catch (e) {
	if (e.code !== 'EEXIST') {
		throw e;
	}
}

try {
	fs.writeFileSync(path.join(__dirname, 'data/attendance.json'), JSON.stringify({}));
	fs.writeFileSync(path.join(__dirname, 'data/users.json'), JSON.stringify([]));
} catch (e) {
	if (e.code !== 'EEXIST') {
		throw e;
	}
}