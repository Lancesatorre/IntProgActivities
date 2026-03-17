// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-very-secure-secret'; // In production, use environment variables!
const DATA_FILE = path.join(__dirname, 'data.json');

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
    departments: [
        { name: 'Engineering', description: 'Product dev, automation, and platform support' },
        { name: 'Customer Success', description: 'Support, onboarding, and success' }
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

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2));
}

let dataStore = loadData();

// Enable CORS for frontend
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔒 In-memory "database" (replace with MySQL/MongoDB later)
// 🚪 AUTH ROUTES

// POST /api/register
app.post('/api/register', async (req, res) => {
    const { first, last, email, password, role, verified } = req.body;

    if (!email || !password || !first || !last) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = dataStore.users.find(u => u.email === email);
    if (existing) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: dataStore.users.length + 1,
        first,
        last,
        email,
        password: hashedPassword,
        role: role || 'user', 
        verified: typeof verified === 'boolean' ? verified : true
    };

    dataStore.users.push(newUser);
    saveData();
    const { password: _password, ...safeUser } = newUser;
    res.status(201).json({ message: 'User registered successfully!', user: safeUser });
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const user = dataStore.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, first: user.first, last: user.last },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({ token, user: { email: user.email, role: user.role, first: user.first, last: user.last } });
});

app.get('/api/users', (req, res) => {
    const users = dataStore.users.map(({ password, ...rest }) => rest);
    res.json({ users });
});

app.put('/api/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { first, last, email, password, role, verified } = req.body;
    const user = dataStore.users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (email) {
        const exists = dataStore.users.find(u => u.email === email && u.id !== id);
        if (exists) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        user.email = email;
    }
    if (first) user.first = first;
    if (last) user.last = last;
    if (role) user.role = role;
    if (typeof verified === 'boolean') user.verified = verified;
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    saveData();
    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser });
});

app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = dataStore.users.findIndex(u => u.id === id);
    if (idx === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    const removed = dataStore.users.splice(idx, 1)[0];
    saveData();
    const { password, ...safeUser } = removed;
    res.json({ user: safeUser });
});

app.put('/api/profile/password', async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
    }

    const user = dataStore.users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    saveData();
    res.json({ message: 'Password updated successfully' });
});

app.get('/api/employees', (req, res) => {
    res.json({ employees: dataStore.employees });
});

app.post('/api/employees', (req, res) => {
    const { id, first, last, email, position, dept, hireDate } = req.body;
    if (!id || !first || !last || !email || !position || !dept || !hireDate) {
        return res.status(400).json({ error: 'All employee fields are required' });
    }

    const newEmployee = { id, first, last, position, dept, hireDate, email };
    dataStore.employees.push(newEmployee);
    saveData();
    res.status(201).json({ employee: newEmployee });
});

app.get('/api/departments', (req, res) => {
    res.json({ departments: dataStore.departments });
});

app.post('/api/departments', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Department name and description are required' });
    }

    const newDepartment = { name, description };
    dataStore.departments.push(newDepartment);
    saveData();
    res.status(201).json({ department: newDepartment });
});

app.put('/api/departments/:name', (req, res) => {
    const { name, description } = req.body;
    const dept = dataStore.departments.find(d => d.name === req.params.name);
    if (!dept) {
        return res.status(404).json({ error: 'Department not found' });
    }
    if (name) dept.name = name;
    if (description) dept.description = description;
    saveData();
    res.json({ department: dept });
});

app.get('/api/employees/:id', (req, res) => {
    const emp = dataStore.employees.find(e => e.id === req.params.id);
    if (!emp) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ employee: emp });
});

app.put('/api/employees/:id', (req, res) => {
    const { first, last, position, dept, email, hireDate } = req.body;
    const emp = dataStore.employees.find(e => e.id === req.params.id);
    if (!emp) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    if (first) emp.first = first;
    if (last) emp.last = last;
    if (position) emp.position = position;
    if (dept) emp.dept = dept;
    if (email) emp.email = email;
    if (hireDate) emp.hireDate = hireDate;
    saveData();
    res.json({ employee: emp });
});

app.get('/api/requests', (req, res) => {
    res.json({ requests: dataStore.requests });
});

app.get('/api/requests/:id', (req, res) => {
    const req_obj = dataStore.requests.find(r => r.id === parseInt(req.params.id));
    if (!req_obj) {
        return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ request: req_obj });
});

app.put('/api/requests/:id', (req, res) => {
    const { status, type, items, createdBy } = req.body;
    const req_obj = dataStore.requests.find(r => r.id === parseInt(req.params.id));
    if (!req_obj) {
        return res.status(404).json({ error: 'Request not found' });
    }
    if (status) req_obj.status = status;
    if (type) req_obj.type = type;
    if (Array.isArray(items) && items.length) {
        req_obj.items = items;
        req_obj.itemsCount = items.length;
    }
    if (createdBy) req_obj.createdBy = createdBy;
    saveData();
    res.json({ request: req_obj });
});

app.delete('/api/requests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = dataStore.requests.findIndex(r => r.id === id);
    if (idx === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }
    const removed = dataStore.requests.splice(idx, 1)[0];
    saveData();
    res.json({ request: removed });
});

app.post('/api/requests', (req, res) => {
    const { type, items, status, createdBy } = req.body;
    if (!type || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ error: 'Request type and at least one item are required' });
    }

    const newRequest = {
        id: dataStore.requests.length + 1,
        type,
        items,
        itemsCount: items.length,
        status: status || 'Pending',
        createdBy: createdBy || 'unknown'
    };
    dataStore.requests.push(newRequest);
    saveData();
    res.status(201).json({ request: newRequest });
});

// 🧩 MIDDLEWARE
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// 🏁 Start server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FullStack.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});