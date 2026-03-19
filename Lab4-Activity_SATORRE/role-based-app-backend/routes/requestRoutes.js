const express = require('express');
const { getStore, saveData } = require('../data/store');

const router = express.Router();
const dataStore = getStore();

router.get('/requests', (req, res) => {
    res.json({ requests: dataStore.requests });
});

router.get('/requests/:id', (req, res) => {
    const reqObj = dataStore.requests.find(r => r.id === parseInt(req.params.id));
    if (!reqObj) {
        return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ request: reqObj });
});

router.put('/requests/:id', (req, res) => {
    const { status, type, items, createdBy } = req.body;
    const reqObj = dataStore.requests.find(r => r.id === parseInt(req.params.id));
    if (!reqObj) {
        return res.status(404).json({ error: 'Request not found' });
    }
    if (status) reqObj.status = status;
    if (type) reqObj.type = type;
    if (Array.isArray(items) && items.length) {
        reqObj.items = items;
        reqObj.itemsCount = items.length;
    }
    if (createdBy) reqObj.createdBy = createdBy;
    saveData();
    res.json({ request: reqObj });
});

router.delete('/requests/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = dataStore.requests.findIndex(r => r.id === id);
    if (idx === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }
    const removed = dataStore.requests.splice(idx, 1)[0];
    saveData();
    res.json({ request: removed });
});

router.post('/requests', (req, res) => {
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

module.exports = router;
