const express = require('express');
const bcrypt = require('bcryptjs');
const { getStore, saveData } = require('../data/store');

const router = express.Router();
const dataStore = getStore();

router.get('/users', (req, res) => {
    const users = dataStore.users.map(({ password, ...rest }) => rest);
    res.json({ users });
});

router.put('/users/:id', async (req, res) => {
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

router.delete('/users/:id', (req, res) => {
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

module.exports = router;
