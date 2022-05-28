const fs = require('fs');

fs.writeFileSync(path.join(__dirname, 'data/attendance.json'), JSON.stringify({}));
fs.writeFileSync(path.join(__dirname, 'data/users.json'), JSON.stringify([]));