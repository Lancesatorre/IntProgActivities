const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use((req, res, next) => {
    console.log(`${req.method} request made to ${req.url}`);
    next();
});

let items = [];

app.get('/items', (req, res) => {
    res.json(items);
});

app.post('/add-item', (req, res) => {
    const newItem = req.body.item;
    if (newItem) {
        items.push(newItem);
    }
    res.redirect('/index.html');
});

app.get('/about', (req, res) => {
    res.send("This is the About Page");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});