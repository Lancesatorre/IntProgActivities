const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { getStore, saveData } = require('../data/store');

const router = express.Router();
const dataStore = getStore();

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = dataStore.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, first: user.first, last: user.last },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({ token, user: { email: user.email, role: user.role, first: user.first, last: user.last } });
});

router.put('/profile/password', async (req, res) => {
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

module.exports = router;
