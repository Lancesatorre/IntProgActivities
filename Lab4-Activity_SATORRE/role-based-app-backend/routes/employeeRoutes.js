const express = require('express');
const { getStore, saveData } = require('../data/store');

const router = express.Router();
const dataStore = getStore();

router.get('/employees', (req, res) => {
    res.json({ employees: dataStore.employees });
});

router.post('/employees', (req, res) => {
    const { id, first, last, email, position, dept, hireDate } = req.body;
    if (!id || !first || !last || !email || !position || !dept || !hireDate) {
        return res.status(400).json({ error: 'All employee fields are required' });
    }

    const newEmployee = { id, first, last, position, dept, hireDate, email };
    dataStore.employees.push(newEmployee);
    saveData();
    res.status(201).json({ employee: newEmployee });
});

router.get('/employees/:id', (req, res) => {
    const emp = dataStore.employees.find(e => e.id === req.params.id);
    if (!emp) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ employee: emp });
});

router.put('/employees/:id', (req, res) => {
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

router.delete('/employees/:id', (req, res) => {
    const idx = dataStore.employees.findIndex(e => e.id === req.params.id);
    if (idx === -1) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    const removed = dataStore.employees.splice(idx, 1)[0];
    saveData();
    res.json({ employee: removed });
});

module.exports = router;
