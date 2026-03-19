const path = require('path');

const PORT = 3000;
const SECRET_KEY = 'your-very-secure-secret';
const DATA_FILE = path.join(__dirname, 'data.json');

module.exports = {
    PORT,
    SECRET_KEY,
    DATA_FILE
};
