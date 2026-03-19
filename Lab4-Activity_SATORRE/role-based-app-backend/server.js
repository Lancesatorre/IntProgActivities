const path = require('path');
const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', employeeRoutes);
app.use('/api', departmentRoutes);
app.use('/api', requestRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FullStack.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});