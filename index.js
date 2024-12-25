const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Sample API
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to my API!' });
});

app.get('/api/data', (req, res) => {
    res.send({ data: [1, 2, 3, 4, 5] });
});

app.post('/api/data', (req, res) => {
    const newData = req.body;
    res.status(201).send({ status: 'Data added', data: {"status :": res.statusCode, "data :": newData} });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
