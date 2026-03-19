const fs = require('fs');
const bcrypt = require('bcryptjs');
const { DATA_FILE } = require('../config');

const defaultData = () => ({
    users: [
        {
            id: 1,
            first: 'Admin',
            last: 'User',
            email: 'admin@example.com',
            password: bcrypt.hashSync('Password123!', 10),
            role: 'admin',
            verified: true
        }
    ],
    employees: [
        { id: '001', first: 'Jordan', last: 'Avery', position: 'Lead Engineer', dept: 'Engineering', hireDate: '2024-02-12' },
        { id: '002', first: 'Abby', last: 'Torres', position: 'Success Manager', dept: 'Customer Success', hireDate: '2023-11-03' }
    ],
    requests: []
});

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (err) {
            console.warn('Could not parse data file, resetting to defaults', err);
        }
    }
    const data = defaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return data;
}

let dataStore = loadData();

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2));
}

function getStore() {
    return dataStore;
}

module.exports = {
    getStore,
    saveData,
    defaultData
};
