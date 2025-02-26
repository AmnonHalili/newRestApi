import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/api/users', (req: Request, res: Response) => {
    res.status(200).json([{ id: 1, name: 'John Doe' }]);
});

app.post('/api/users', (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    res.status(201).json({ id: 2, name });
});

export default app;
