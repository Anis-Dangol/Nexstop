import express from 'express';
import cors from 'cors';

const app = express();

const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions));

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from the server!' });
})

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
})