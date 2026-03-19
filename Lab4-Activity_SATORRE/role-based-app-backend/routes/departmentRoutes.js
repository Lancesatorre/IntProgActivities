const express = require('express');
const { getStore, saveData } = require('../data/store');

const router = express.Router();
const dataStore = getStore();

router.get('/departments', (req, res) => {
    res.json({ departments: dataStore.departments });
});

router.post('/departments', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Department name and description are required' });
    }

    const newDepartment = { name, description };
    dataStore.departments.push(newDepartment);
    saveData();
    res.status(201).json({ department: newDepartment });
});

router.put('/departments/:name', (req, res) => {
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

router.delete('/departments/:name', (req, res) => {
    const idx = dataStore.departments.findIndex(d => d.name === req.params.name);
    if (idx === -1) {
        return res.status(404).json({ error: 'Department not found' });
    }
    const removed = dataStore.departments.splice(idx, 1)[0];
    saveData();
    res.json({ department: removed });
});

module.exports = router;
